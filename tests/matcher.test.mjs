import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { filterRecipes, matchRecipe, minimumMissing } from '../public/matcher.mjs';
import { classifyLine } from '../scripts/catalog.mjs';
import { parseBackup } from '../public/storage.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../public/data/bar.json',import.meta.url)));
const recipe=name=>{const result=data.recipes.find(r=>r.name===name);assert.ok(result,`Recipe ${name} exists`);return result;};
const match=(name,stock=data.initialStock)=>matchRecipe(recipe(name),stock,data.catalog);
const ids=line=>classifyLine(line).flatMap(r=>r.options);
test('264 unique recipe records have methods, all lines accounted for, and only known ingredient IDs',()=>{
  assert.equal(data.recipes.length,264);assert.equal(new Set(data.recipes.map(r=>r.id)).size,264);
  for(const r of data.recipes){assert.ok(r.instructions.length,r.name);for(const line of r.ingredients)assert.ok(r.requirements.some(req=>req.text===line)||/small spoon/.test(line),`${r.name}: ${line}`);}
});
test('0 requires all alcoholic types and 1 is inclusive of 0',()=>{
  const zero=filterRecipes(data.recipes,data.initialStock,data.catalog,{maxMissing:0});const one=filterRecipes(data.recipes,data.initialStock,data.catalog,{maxMissing:1});
  assert.ok(zero.length>0);assert.ok(one.length>zero.length);assert.ok(zero.every(r=>r.missingAlcohol.length===0));assert.ok(one.every(r=>r.missingAlcohol.length<=1));assert.ok(zero.every(r=>one.some(o=>o.recipe.id===r.recipe.id)));
});
test('negative, fractional and invalid limits normalize safely',()=>{
  for(const value of [-1,NaN,'abc',Infinity])assert.equal(filterRecipes(data.recipes,data.initialStock,data.catalog,{maxMissing:value}).length,filterRecipes(data.recipes,data.initialStock,data.catalog,{maxMissing:0}).length);
});
test('brand substitutions match types and changing stock recomputes a real recipe',()=>{
  assert.deepEqual(match('Last Word').missingAlcohol,[]);
  assert.deepEqual(match('Last Word',{...data.initialStock,'gin-dry':false}).missingAlcohol,['gin-dry']);
  assert.deepEqual(ids('Beefeater London Dry Gin'),['gin-dry']);assert.deepEqual(ids('The Botanist Islay Dry Gin'),['gin-dry']);
});
test('rum styles, tequila ages, vermouth styles and Chartreuse colors do not silently cross-match',()=>{
  for(const lines of [['Koloa Kaua’i White Rum','Koloa Kaua’i Spice Rum','Appleton Estate 12 year Rum','Bacardi 151'],['Siete Leguas Blanco Tequila','Milagro Reposado Tequila','CasAgave Añejo'],['Dolin Dry Vermouth','Dolin Blanc Vermouth','Dolin Rouge Vermouth'],['Green Chartreuse','Yellow Chartreuse']])assert.equal(new Set(lines.map(line=>ids(line)[0])).size,lines.length);
  assert.ok(!data.initialStock['rum-white']);assert.ok(!data.initialStock['tequila-reposado']);
});
test('mixers toggle checks all required non-alcoholic ingredients; optional garnish does not block',()=>{
  const r=recipe('Last Word');assert.equal(filterRecipes([r],data.initialStock,data.catalog,{requireOther:false}).length,1);assert.equal(filterRecipes([r],data.initialStock,data.catalog,{requireOther:true}).length,0);
  const stocked={...data.initialStock,'lime-juice':true,ice:true};assert.equal(filterRecipes([r],stocked,data.catalog,{requireOther:true}).length,1);
});
test('alternatives need only one choice; repeated types count once',()=>{
  assert.deepEqual(minimumMissing([['a'],['a'],['a','b']],new Set()),['a']);assert.deepEqual(minimumMissing([['a','b'],['b','c'],['c']],new Set()),['a','c']);
  assert.deepEqual(minimumMissing([['a','b'],['b','c']],new Set()),['b']);assert.deepEqual(minimumMissing([['egg','aquafaba']],new Set(['aquafaba'])),[]);
  assert.deepEqual(ids('Yellow Chartreuse (or green)'),['chartreuse-yellow','chartreuse-green']);
});
test('alcoholic bitters and prepared components count; unresolved recipes fail closed',()=>{
  assert.ok(ids("Jasper's Mix").includes('bitters-aromatic'));assert.ok(ids('Top with Chartreuse whipped cream').includes('chartreuse-green'));
  assert.ok(ids('Tom & Jerry batter').includes('rum-aged-jamaican'));assert.deepEqual(ids("2 dashes Peychaud's Bitters"),['bitters-peychaud']);
  assert.equal(filterRecipes([recipe("Corn 'n' Oil")],Object.fromEntries(Object.keys(data.catalog).map(id=>[id,true])),data.catalog,{maxMissing:100}).length,0);
});
test('search and collection filters intersect availability',()=>{
  const matches=filterRecipes(data.recipes,data.initialStock,data.catalog,{search:'last word',category:'Gin'});assert.ok(matches.length);assert.ok(matches.every(r=>r.recipe.category==='Gin'&&/last word/i.test(r.recipe.name)));
});
test('backup validation rejects malformed states and unknown types without changing stock',()=>{
  assert.deepEqual(parseBackup(JSON.stringify({app:'home-bar',version:1,stock:{'gin-dry':false}}),data.catalog),{'gin-dry':false});
  for(const stock of [[],null,{'gin-dry':'yes'},{unexpected:true}])assert.throws(()=>parseBackup(JSON.stringify({app:'home-bar',version:1,stock}),data.catalog));
});

test('the bundled example inventory imports and preserves the captured menu availability',()=>{
  const stock=parseBackup(fs.readFileSync(new URL('../data/example-inventory.json',import.meta.url),'utf8'),data.catalog);
  assert.equal(Object.values(stock).filter(Boolean).length,28);
  assert.ok(!Object.hasOwn(stock,'lime-juice'),'Unconfirmed ingredients stay unconfirmed.');
  assert.equal(filterRecipes(data.recipes,stock,data.catalog,{maxMissing:0}).length,45);
  assert.equal(filterRecipes(data.recipes,stock,data.catalog,{maxMissing:1}).length,157);
  assert.equal(filterRecipes(data.recipes,stock,data.catalog,{maxMissing:0,requireOther:true}).length,1);
});
test('matching the full collection is fast enough for interactive controls',()=>{
  const begin=performance.now();for(let i=0;i<100;i++)filterRecipes(data.recipes,data.initialStock,data.catalog,{maxMissing:i%4,requireOther:i%2===0});const ms=(performance.now()-begin)/100;console.log(`Average complete filter: ${ms.toFixed(2)} ms`);assert.ok(ms<100);
});
