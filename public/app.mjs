import { filterRecipes, matchRecipe, normalize } from './matcher.mjs';
import { STORAGE_KEY, SETTINGS_KEY, validateStock, parseBackup } from './storage.mjs';
const $=id=>document.getElementById(id);
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
let data,stock,view='menu',pendingStock,installEvent,waitingWorker;
const options={maxMissing:0,requireOther:false,search:'',category:''};
function report(message){$('error').textContent=message;$('error').hidden=false;}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(stock));}catch{report('Stock is updated for this session, but this browser could not save it. Export a backup before closing.');}}
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(options));}catch{/* Stock failure already has a dedicated alert. */}}
function labels(ids){return ids.map(id=>data.catalog[id].label).join(', ');}
function setView(next){view=next;$('menu-view').hidden=next!=='menu';$('inventory-view').hidden=next!=='inventory';for(const name of ['menu','inventory']){$(`${name}-tab`).classList.toggle('active',name===next);$(`${name}-tab`).setAttribute('aria-pressed',String(name===next));}if(next==='inventory')renderInventory();else renderMenu();}
function renderMenu(){
  const matches=filterRecipes(data.recipes,stock,data.catalog,options);
  $('result-count').textContent=`${matches.length} ${matches.length===1?'drink':'drinks'} on your menu`;
  $('result-caption').textContent=options.requireOther?'All mixers required':'Mixers assumed available';
  $('other-help').textContent=options.requireOther?'On · Every required mixer, fresh ingredient, ice and garnish must be in stock.':'Off · Mixers and other non-alcoholic ingredients are assumed available.';
  $('minus').disabled=options.maxMissing===0;
  const fragment=document.createDocumentFragment();
  for(const result of matches){
    const {recipe,missingAlcohol}=result;
    const card=el('button','drink-card');
    card.append(el('span','eyebrow',recipe.category),el('h3','',recipe.name));
    const types=[...new Set(recipe.requirements.flatMap(r=>r.options).filter(id=>data.catalog[id]?.kind==='alcohol'))];
    card.append(el('p','ingredients',types.map(id=>data.catalog[id].label).join(' · ')||'Alcohol-free'));
    if(missingAlcohol.length)card.append(el('p','missing-text',`Add ${labels(missingAlcohol)}`));
    const bottom=el('div','card-bottom');bottom.append(el('span',`badge${missingAlcohol.length?' missing':''}`,missingAlcohol.length?`${missingAlcohol.length} alcohol ${missingAlcohol.length===1?'type':'types'} away`:options.requireOther?'All ingredients on hand':'Alcohol on hand'),el('span','card-arrow','↗'));card.append(bottom);
    card.addEventListener('click',()=>openRecipe(recipe));fragment.append(card);
  }
  if(!matches.length){const empty=el('div','empty');empty.append(el('h3','','A little shelf work first.'),el('p','',options.requireOther?'No recipes match these filters. Check your mixers, citrus, ice and garnishes in Inventory, or turn off the non-alcoholic ingredient requirement.':'No recipes match these filters. Try another search, allow one more missing alcohol type, or update your inventory.'));fragment.append(empty);}
  $('results').replaceChildren(fragment);
  const unresolved=data.recipes.filter(r=>r.requirements.some(x=>!x.optional&&!x.options.length));
  $('review-note').textContent=`${unresolved.length} recipes held for ingredient review. Stock is based on presence, not serving quantities.`;
  $('review-list').hidden=!unresolved.length;
  $('review-recipes').replaceChildren(...unresolved.map(recipe=>{const button=el('button','text-button',recipe.name+' ↗');button.addEventListener('click',()=>openRecipe(recipe));return button;}));
  $('stock-count').textContent=Object.values(stock).filter(Boolean).length;
}
function renderInventory(){
  const query=normalize($('inventory-search').value),kind=$('inventory-kind').value;
  const products=id=>data.products.filter(p=>p.type===id).map(p=>p.name);
  const entries=Object.values(data.catalog).filter(item=>(!kind||kind==='stocked'?kind!=='stocked'||stock[item.id]===true:item.kind===kind)&&normalize(item.label+' '+products(item.id).join(' ')).includes(query))
    .sort((a,b)=>Number(stock[b.id]===true)-Number(stock[a.id]===true)||a.kind.localeCompare(b.kind)||a.label.localeCompare(b.label));
  const fragment=document.createDocumentFragment();
  for(const item of entries){
    const checked=stock[item.id]===true,row=el('label',`stock-row${checked?' checked':''}`),input=el('input');input.type='checkbox';input.checked=checked;input.dataset.type=item.id;input.setAttribute('aria-label',`${item.label} in stock`);
    const desc=el('span');desc.append(el('b','',item.label));const brands=products(item.id);desc.append(el('small','',brands.length?brands.join(' · '):item.kind==='alcohol'?'Any brand of this exact type':'Fresh, prepared or purchased'));
    const status=el('em','',checked?'On the shelf':stock[item.id]===false?'Out of stock':'Not yet confirmed');desc.append(status);row.append(input,desc);
    input.addEventListener('change',()=>{stock[item.id]=input.checked;save();row.classList.toggle('checked',input.checked);status.textContent=input.checked?'On the shelf':'Out of stock';$('stock-count').textContent=Object.values(stock).filter(Boolean).length;updateInventoryNote(entries.length);});fragment.append(row);
  }
  if(!entries.length)fragment.append(el('p','subtle','No ingredient types match your search.'));
  $('inventory-list').replaceChildren(fragment);updateInventoryNote(entries.length);
}
function updateInventoryNote(count){$('inventory-note').textContent=`${Object.values(stock).filter(Boolean).length} types in stock · ${count} shown. Seeded from 29 products photographed September 27, 2026. Unconfirmed ingredients do not count as stocked. Syrup concentrations are tracked separately; check your bottle before marking a prepared strength.`;}
function openRecipe(recipe){
  const result=matchRecipe(recipe,stock,data.catalog),container=$('recipe-content');container.replaceChildren();
  $('recipe-category').textContent=recipe.category;
  const title=el('h2','',recipe.name);title.id='recipe-title';container.append(title);
  const summary=result.unresolved.length?'Availability unconfirmed: an ingredient or prepared component needs review.':result.missingAlcohol.length?`Additional alcohol: ${labels(result.missingAlcohol)}.`:'All alcoholic ingredients are on hand.';
  container.append(el('p','detail-status',summary+(options.requireOther?' Mixers are checked against inventory.':' Mixers and other non-alcoholic ingredients are assumed available.')));
  container.append(el('h3','','Ingredients'));
  const list=el('ul','ingredient-list');
  for(const text of recipe.ingredients){
    const requirements=recipe.requirements.filter(r=>r.text===text),li=el('li','',text);
    for(const r of requirements){
      const inStock=r.options.find(id=>stock[id]);
      let note,className='';
      if(r.optional){note='Optional';}
      else if(!r.options.length){note='Needs review · ingredient or preparation unresolved';className='needed';}
      else if(inStock){const brands=data.products.filter(p=>p.type===inStock).map(p=>p.name);note=`On hand: ${data.catalog[inStock].label}${brands.length?' — '+brands.join(' / '):''}`;className='available';}
      else if(!options.requireOther && r.options.every(id=>data.catalog[id].kind==='other')){note=`Assumed available: ${r.options.map(id=>data.catalog[id].label).join(' OR ')}`;}
      else{note=`Need: ${r.options.map(id=>data.catalog[id].label).join(' OR ')}`;className='needed';}
      li.append(el('small',className,note));
    }
    list.append(li);
  }
  container.append(list,el('h3','','Method'));const instructions=el('ol','instructions');for(const step of recipe.instructions)instructions.append(el('li','',step));container.append(instructions);
  if(recipe.notes){const details=el('details');details.append(el('summary','','Recipe notes & source caveats'),el('pre','notes',recipe.notes));container.append(details);}
  if(recipe.source && /^https?:\/\//.test(recipe.source)){const link=el('a','','View original recipe ↗');link.href=recipe.source;link.target='_blank';link.rel='noopener noreferrer';container.append(link);}
  container.append(el('p','subtle','Matching uses ingredient types. Brand, flavor and proof may differ within a type. Presence does not establish enough volume for a serving.'));
  $('recipe-dialog').showModal();$('recipe-dialog').scrollTop=0;
}
function changeMissing(value){const n=Number(value);options.maxMissing=Number.isFinite(n)?Math.max(0,Math.floor(n)):0;$('missing').value=options.maxMissing;saveSettings();renderMenu();}
async function boot(){
  const response=await fetch('./data/bar.json');if(!response.ok)throw new Error('The recipe collection could not be loaded.');data=await response.json();stock={...data.initialStock};
  try{const stored=localStorage.getItem(STORAGE_KEY);if(stored!==null)stock=validateStock(JSON.parse(stored),data.catalog);}catch{report('Saved stock could not be read. The photographed inventory is shown for this session. Import your backup to restore your changes.');}
  try{const settings=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');if(settings&&typeof settings==='object'){if(Number.isFinite(settings.maxMissing))options.maxMissing=Math.max(0,Math.floor(settings.maxMissing));options.requireOther=settings.requireOther===true;if(typeof settings.search==='string')options.search=settings.search;if(typeof settings.category==='string')options.category=settings.category;}}catch{/* Defaults remain usable. */}
  const categories=[...new Set(data.recipes.map(r=>r.category))].sort();if(!categories.includes(options.category))options.category='';
  for(const category of categories){const option=el('option','',category);option.value=category;$('category').append(option);}
  $('recipe-count').textContent=`${data.recipes.length} recipes`;$('missing').value=options.maxMissing;$('require-other').checked=options.requireOther;$('search').value=options.search;$('category').value=options.category;
  $('menu-tab').onclick=() =>setView('menu');$('inventory-tab').onclick=()=>setView('inventory');$('edit-stock').onclick=()=>setView('inventory');$('back-menu').onclick=()=>setView('menu');
  $('minus').onclick=()=>changeMissing(options.maxMissing-1);$('plus').onclick=()=>changeMissing(options.maxMissing+1);$('missing').addEventListener('input',event=>changeMissing(event.target.value));
  $('require-other').onchange=event=>{options.requireOther=event.target.checked;saveSettings();renderMenu();};
  $('search').oninput=event=>{options.search=event.target.value;saveSettings();renderMenu();};$('category').onchange=event=>{options.category=event.target.value;saveSettings();renderMenu();};
  $('inventory-search').oninput=renderInventory;$('inventory-kind').onchange=renderInventory;
  $('close-recipe').onclick=()=>$('recipe-dialog').close();
  $('export').onclick=()=>{const blob=new Blob([JSON.stringify({app:'home-bar',version:1,exportedAt:new Date().toISOString(),stock},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=el('a');link.href=url;link.download=`home-bar-stock-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('import').onclick=()=>$('import-file').click();$('import-file').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>1000000)throw new Error('This file is too large for a stock backup.');pendingStock=parseBackup(await file.text(),data.catalog);$('import-summary').textContent=`This backup contains ${Object.values(pendingStock).filter(Boolean).length} stocked types. It will replace the stock saved in this browser.`;$('import-dialog').showModal();}catch(error){report(`Import failed. Your inventory is unchanged. ${error.message}`);}finally{event.target.value='';}};
  $('cancel-import').onclick=()=>$('import-dialog').close();$('confirm-import').onclick=()=>{stock=pendingStock;pendingStock=null;save();$('import-dialog').close();renderInventory();renderMenu();};
  window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY&&event.newValue){try{stock=validateStock(JSON.parse(event.newValue),data.catalog);renderMenu();if(view==='inventory')renderInventory();}catch{report('A stock update from another tab could not be read.');}}});
  renderMenu();
  const updateConnection=()=>{$('connection').textContent=navigator.onLine?'Saved on this device · Local collection':'Offline · Using saved collection';};updateConnection();window.addEventListener('online',updateConnection);window.addEventListener('offline',updateConnection);
  if('serviceWorker' in navigator&&window.isSecureContext){try{
    const registration=await navigator.serviceWorker.register('./sw.js');
    const offerUpdate=()=>{if(registration.waiting){waitingWorker=registration.waiting;$('update-app').hidden=false;}};
    offerUpdate();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offerUpdate();});});
    await navigator.serviceWorker.ready;$('connection').textContent='Offline ready · Saved on this device';
  }catch{$('connection').textContent='Local collection · Offline cache unavailable';}}
}
let updating=false;
$('update-app').onclick=()=>{if(waitingWorker){updating=true;waitingWorker.postMessage({type:'ACTIVATE_UPDATE'});}};
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating)location.reload();});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;$('install').hidden=false;});
$('install').onclick=async()=>{if(installEvent){await installEvent.prompt();installEvent=null;$('install').hidden=true;}};
boot().catch(error=>{$('result-count').textContent='Collection unavailable';report(`${error.message} Start the app with node scripts/serve.mjs, then reload this page.`);});
