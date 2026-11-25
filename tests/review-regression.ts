import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:4310';
const p=await(await fetch(base+'/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Review regression',templateId:'coffee-ordering'})})).json();
const browser=await chromium.launch();
try{const page=await browser.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/?project='+p.id);await expect(page.getByLabel('Heading',{exact:true})).toHaveValue(p.slides[0].headline);
await fetch(base+'/api/projects/'+p.id+'/commands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedRevision:0,commands:[{type:'editSlide',slideId:p.slides[0].id,patch:{headline:'Updated by my agent'}}]})});
await expect(page.getByLabel('Heading',{exact:true})).toHaveValue('Updated by my agent',{timeout:7000});
await page.getByLabel('Heading',{exact:true}).fill('My unsaved text');await expect(page.getByRole('button',{name:'Ask my agent'})).toBeDisabled();
await fetch(base+'/api/projects/'+p.id+'/commands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedRevision:1,commands:[{type:'rename',title:'Agent saved again'}]})});
await page.waitForTimeout(2500);await expect(page.getByLabel('Heading',{exact:true})).toHaveValue('My unsaved text');
await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toContainText('This project changed');await expect(page.getByLabel('Heading',{exact:true})).toHaveValue('My unsaved text');
await page.getByRole('button',{name:'Reload saved version'}).click();await expect(page.getByLabel('Project title')).toHaveValue('Agent saved again');
await page.route('**/commands',async route=>{await new Promise(r=>setTimeout(r,600));await route.continue();});await page.getByLabel('Heading',{exact:true}).fill('Saved after review');await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByLabel('Heading',{exact:true})).toBeDisabled();await expect(page.getByLabel('Project title')).toBeDisabled();await expect(page.getByLabel('Heading',{exact:true})).toBeEnabled();
await page.reload();await expect(page.getByLabel('Heading',{exact:true})).toHaveValue('Saved after review');assert.deepEqual(errors,[]);console.log('Agent live sync, dirty draft protection, conflict recovery and in-flight save locking passed.');
}finally{await browser.close();}
