import {assetFields, localAssetBody} from '../../media/src/brand-assets.ts';
import {z} from 'zod';
import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import {mkdir,access} from 'node:fs/promises';
import path from 'node:path';
const command=process.argv[2]||'help';
if(command==='doctor'){
 const checks:{name:string,ok:boolean,detail:string}[]=[];
 checks.push({name:'Node',ok:Number(process.versions.node.split('.')[0])>=22,detail:process.versions.node});
 for(const [name,args] of [['bun',['--version']],['hyperframes',['--version']]] as const){try{checks.push({name,ok:true,detail:execFileSync(path.resolve('node_modules/.bin',name),[...args],{encoding:'utf8'}).trim()});}catch{checks.push({name,ok:false,detail:'Run npm install in the project directory.'});}}
 for(const name of ['ffmpeg','ffprobe']){try{checks.push({name,ok:true,detail:execFileSync(name,['-version'],{encoding:'utf8'}).split('\n')[0]});}catch{checks.push({name,ok:false,detail:'Install FFmpeg (including ffprobe) and put it on PATH.'});}}
 const root=path.resolve(process.env.ACC_WORKSPACE||'.workspace/projects');try{await mkdir(root,{recursive:true});await access(root,2);checks.push({name:'Local project storage',ok:true,detail:root});}catch{checks.push({name:'Local project storage',ok:false,detail:'Select a writable ACC_WORKSPACE.'});}
 try{const disk=await fs.statfs(root);const free=Number(disk.bavail)*Number(disk.bsize);checks.push({name:'Free disk space',ok:free>=1024**3,detail:(free/1024**3).toFixed(1)+' GB available; at least 1 GB recommended before rendering.'});}catch{checks.push({name:'Free disk space',ok:false,detail:'Could not inspect workspace disk space.'});}
 try{const browser=await chromium.launch();checks.push({name:'Export browser',ok:true,detail:browser.version()});await browser.close();}catch{checks.push({name:'Export browser',ok:false,detail:'Run npx playwright install chromium, then retry doctor.'});}
 console.log(JSON.stringify({checks,renderVerified:false,note:'Runtime checks only. Run a real HyperFrames sample render to verify browser and encoder readiness.'},null,2));if(checks.some(c=>!c.ok))process.exitCode=1;
}else if(command==='save-brand-asset'){
 const [kitId,kind,label,filePath]=process.argv.slice(3);
 if(!filePath)throw new Error('Use save-brand-asset <kitId> <kind> "<label>" "/absolute/path/to/image".');
 const fields=assetFields.parse({kind,label});
 const body=await localAssetBody(filePath,fields);
 const response=await fetch((process.env.ACC_URL||'http://127.0.0.1:4310')+'/api/brands/'+z.string().uuid().parse(kitId)+'/assets',{
   method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
 });
 console.log(JSON.stringify(await response.json(),null,2));if(!response.ok)process.exitCode=1;
}else if(command==='request'){
 const method=process.argv[3]||'GET',route=process.argv[4]||'/capabilities';
 if(!['GET','POST'].includes(method)||!route.startsWith('/')||route.includes('..')||route.includes('?'))throw new Error('Use GET/POST with an /api-relative path, such as /projects.');
 const dataFile=process.argv[5];const body=dataFile?await fs.readFile(dataFile,'utf8'):undefined;if(body)JSON.parse(body);
 const base=process.env.ACC_URL||'http://127.0.0.1:4310';
 try{const r=await fetch(base+'/api'+route,{method,headers:{'Content-Type':'application/json'},body});console.log(JSON.stringify(await r.json(),null,2));if(!r.ok)process.exitCode=1;}
 catch(e){console.error(JSON.stringify({code:'LOCAL_APP_UNAVAILABLE',message:`Could not read a response from ${base}. Start the app with npm run dev and set ACC_URL to its printed URL if using another port.`,detail:(e as Error).message}));process.exitCode=1;}
}else console.log('Commands: npm run dev | npm run doctor | npm run agent | npm run cli -- request GET /capabilities | npm run cli -- request POST /projects request.json | npm run cli -- save-brand-asset <kitId> <kind> "<label>" "/absolute/path/to/image"');
