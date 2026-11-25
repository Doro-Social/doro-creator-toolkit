import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {startLocalApp,freePort} from './helpers/local-app.ts';
const root=await fs.mkdtemp(path.resolve('.artifacts/dev-launch-'));
const apps:Awaited<ReturnType<typeof startLocalApp>>[]=[];
const browser=await chromium.launch();
try{
 for(let i=0;i<2;i++) apps.push(await startLocalApp(path.join(root,String(i),'projects'),await freePort(),false));
 for(const app of apps){
  const page=await browser.newPage();const messages:string[]=[];
  const connected=new Promise<string>((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Live preview did not connect')),15000);
   page.on('websocket',socket=>socket.on('framereceived',event=>{
    messages.push(String(event.payload));if(String(event.payload).includes('"type":"connected"')){clearTimeout(timer);resolve(socket.url());}
   }));
  });
  await page.goto(app.url);
  assert.equal(new URL(await connected).port,new URL(app.url).port);
  await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeVisible();
  const response=await fetch(app.url+'/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Watcher isolation'})});const project=await response.json();
  await page.goto(app.url+'/?project='+project.id);await page.getByLabel('Heading',{exact:true}).fill('Keep these unsaved edits');messages.length=0;
  const output=path.join(root,'generated-'+new URL(app.url).port);await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'index.html'),'<html><body>Generated render input</body></html>');
  await new Promise(resolve=>setTimeout(resolve,1200));await expect(page.getByLabel('Heading',{exact:true})).toHaveValue('Keep these unsaved edits');assert.ok(!messages.some(m=>m.includes('full-reload')),'Generated output triggered a page reload');
  await page.close();
 }
 console.log('Two isolated dev apps connect on their own HTTP ports; generated output does not reload unsaved edits.');
}finally{await browser.close();for(const app of apps)await app.stop();}
