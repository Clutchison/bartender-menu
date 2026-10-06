import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
export const publicRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
export function createServer(){return http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(publicRoot,'.'+(pathname==='/'?'/index.html':pathname));
    const relative=path.relative(publicRoot,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);res.end();return;}
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(err){res.writeHead(err.code==='ENOENT'||err.code==='EISDIR'?404:400);res.end('Not found');}
});}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.argv.find(arg=>arg.startsWith('--port='))?.split('=')[1]||process.env.PORT||4173),lan=process.argv.includes('--lan');
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Port must be an integer from 1 to 65535.');
  const server=createServer();
  server.on('error',err=>{console.error(`Could not start bar menu: ${err.message}`);process.exitCode=1;});
  server.listen(port,lan?'0.0.0.0':'127.0.0.1',()=>{
    console.log(`Home Bar is running at http://localhost:${port}`);
    if(lan) for(const entries of Object.values(os.networkInterfaces())) for(const net of entries||[]) if(net.family==='IPv4'&&!net.internal) console.log(`Tablet on the same Wi-Fi: http://${net.address}:${port}`);
  });
}
