import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, products, classifyLine } from './catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const snapshot=path.join(root,'data','recipes-source.json');
const read=file=>fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
const section=(text,heading)=>text.match(new RegExp(`^#{2,4} ${heading}\\s*\\r?\\n([\\s\\S]*?)(?=^#{1,4} |$(?![\\s\\S]))`,'m'))?.[1]?.trim() || '';
const arg=process.argv.indexOf('--vault');
let sources;
if(arg!==-1){
  const base=path.resolve(process.argv[arg+1] || '');
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.md')?[path.join(dir,e.name)]:[]);
  sources=walk(base).sort().map((file,index)=>{const text=read(file);return {id:index+1,relative:'Cocktails/'+path.relative(base,file).replaceAll('\\','/'),name:path.basename(file,'.md'),text,ingredients:section(text,'Ingredients')};});
}else sources=JSON.parse(read(snapshot));
const recipes=sources.map(r=>({...r,ingredients:r.ingredients||r.text.split(/\r?\n/).filter(line=>/^\s*-\s*\[[ xX]\]/.test(line)).join('\n')})).filter(r=>/^\s*-\s*\[[ xX]\]/m.test(r.ingredients)).map(r=>{
  const requirements=r.ingredients.split(/\r?\n/).filter(line=>/^\s*-\s*\[[ xX]\]/.test(line)).flatMap(classifyLine);
  const source=r.text.match(/\*\*Source:\*\*[^\n]*?\]\((https?:\/\/[^)]+)\)/)?.[1] || null;
  const id=r.relative.replaceAll('\\','/').replace(/^Cocktails\//,'').replace(/\.md$/,'');
  return {id,name:r.name,category:id.split('/')[0],requirements,
    ingredients:r.ingredients.split(/\r?\n/).filter(line=>/^\s*-\s*\[[ xX]\]/.test(line)).map(line=>line.replace(/^\s*-\s*\[[ xX]\]\s*/,'').trim()),
    instructions:(section(r.text,'Instructions')||r.text).split(/\r?\n/).filter(line=>/^\d+\./.test(line)).map(line=>line.replace(/^\d+\.\s*/,'')),
    notes:section(r.text,'Notes'),source};
});
if(!recipes.length) throw new Error('No cocktail ingredient lists found; existing data preserved.');
for(const recipe of recipes) for(const r of recipe.requirements) for(const id of r.options) if(!catalog[id]) throw new Error(`Unknown type: ${id}`);
const output={version:1,generatedAt:new Date().toISOString(),inventoryAsOf:'2026-09-27',catalog,products,
  initialStock:Object.fromEntries([...new Set(products.map(p=>p.type))].map(id=>[id,true])),recipes};
fs.mkdirSync(path.join(root,'public','data'),{recursive:true});
fs.writeFileSync(path.join(root,'public','data','bar.json'),JSON.stringify(output,null,2)+'\n');
const unresolved=recipes.flatMap(r=>r.requirements.filter(x=>!x.options.length&&!x.optional).map(x=>({recipe:r.name,ingredient:x.text})));
fs.writeFileSync(path.join(root,'data','import-review.json'),JSON.stringify(unresolved,null,2)+'\n');
console.log(`${recipes.length} recipes; ${products.length} inventory products; ${unresolved.length} unresolved ingredient lines. See data/import-review.json.`);
