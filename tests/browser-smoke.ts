import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4310');
await page.getByRole('button',{name:'Start a draft',exact:true}).click();
await page.getByLabel('Project title').fill('Browser verification project');
await page.getByLabel('Heading',{exact:true}).fill('A saved idea survives a restart.');
await page.getByRole('button',{name:'Save changes',exact:true}).click();
await page.getByRole('status').filter({hasText:'Your changes are saved.'}).waitFor();
const url=page.url();await page.reload();
assert.equal(await page.getByLabel('Heading',{exact:true}).inputValue(),'A saved idea survives a restart.');
await page.screenshot({path:'.artifacts/editor.png',fullPage:true});
const projectId=new URL(url).searchParams.get('project');
const project=await (await page.request.get('http://127.0.0.1:4310/api/projects/'+projectId)).json();
const conflict=await page.request.post('http://127.0.0.1:4310/api/projects/'+projectId+'/commands',{data:{expectedRevision:0,commands:[{type:'rename',title:'Stale'}]}});assert.equal(conflict.status(),409);
const forbidden=await page.request.post('http://127.0.0.1:4310/api/projects',{headers:{Origin:'https://unrelated.example'},data:{title:'Forbidden'}});assert.equal(forbidden.status(),403);
await page.getByRole('button',{name:'All projects'}).click();
await page.screenshot({path:'.artifacts/home.png',fullPage:true});
assert.deepEqual(errors,[]);
console.log(JSON.stringify({savedAndReopened:true,revision:project.revision,conflictRejected:true,foreignOriginRejected:true,browserErrors:errors,projectId}));
}finally{await browser.close();}
