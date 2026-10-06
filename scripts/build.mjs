import './build-data.mjs';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const root=new URL('../public/',import.meta.url);
const hash=createHash('sha256');
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())walk(file);else if(entry.name!=='sw.js'){hash.update(entry.name);hash.update(fs.readFileSync(file));}}}
walk(root);
const sw=new URL('sw.js',root);
const current=fs.readFileSync(sw,'utf8').replace(/const CACHE='[^']+';/,`const CACHE='home-bar-${hash.digest('hex').slice(0,12)}';`);
fs.writeFileSync(sw,current);
console.log('Offline cache version updated.');
