import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../scripts/serve.mjs';
test('server exposes app assets and never workspace source files',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{const base=`http://127.0.0.1:${server.address().port}`;
    const page=await fetch(base);assert.equal(page.status,200);assert.match(await page.text(),/The Home Bar/);
    assert.equal((await fetch(base+'/data/bar.json')).status,200);
    assert.equal((await fetch(base+'/INVENTORY.md')).status,404);
    assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,403);
    assert.equal((await fetch(base,{method:'POST'})).status,405);
    assert.equal((await fetch(base+'/%E0%A4%A')).status,400);
    assert.match((await fetch(base+'/matcher.mjs')).headers.get('content-type'),/javascript/);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
