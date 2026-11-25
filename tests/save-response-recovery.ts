import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {startLocalApp,freePort} from './helpers/local-app.ts';
const root=await fs.mkdtemp(path.resolve('.artifacts/save-response-'));const app=await startLocalApp(path.join(root,'projects'),await freePort());const browser=await chromium.launch();
try{
 const response=await fetch(app.url+'/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Save response test'})});const p=await response.json();
 const page=await browser.newPage();await page.goto(app.url+'/?project='+p.id);await page.getByLabel('Heading',{exact:true}).fill('This edit must be saved once');
 let intercepted=false;let requestId='';
 await page.route('**/api/projects/'+p.id+'/commands',async route=>{
  if(intercepted){assert.equal(route.request().postDataJSON().requestId,requestId);await route.continue();return;}
  intercepted=true;requestId=route.request().postDataJSON().requestId;assert.ok(requestId);const saved=await route.fetch();assert.equal(saved.status(),200);await route.abort('failed');
 });
 await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByText(/The local app is not reachable/)).toBeVisible();
 const read=async()=>await(await fetch(app.url+'/api/projects/'+p.id)).json();assert.equal((await read()).revision,1);
 await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByText('Your changes are saved.',{exact:true})).toBeVisible();assert.equal((await read()).revision,1);
 await page.unroute('**/api/projects/'+p.id+'/commands');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Heading',{exact:true})).toHaveValue(p.slides[0].headline);assert.equal((await read()).revision,2);
 await fs.writeFile(path.join(root,'evidence.json'),JSON.stringify({lostResponseRecovered:true,requestId,savedExactlyOnce:true,undoRestored:true},null,2));console.log(root);
}finally{await browser.close();await app.stop();}
