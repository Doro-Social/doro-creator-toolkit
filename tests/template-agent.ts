import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {chromium} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.ACC_URL||'http://127.0.0.1:4310';
const client=new Client({name:'template-review',version:'1'});
const browser=await chromium.launch();
async function tool(name:string,args:Record<string,unknown>={}){const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,JSON.stringify(r));return JSON.parse((r.content as {text:string}[])[0].text);}
try{
 await client.connect(new StdioClientTransport({command:path.resolve('node_modules/.bin/tsx'),args:[path.resolve('packages/agent-tools/src/index.ts')],env:{...process.env,ACC_URL:base} as Record<string,string>}));
 const before=(await tool('capabilities')).templates.find((t:{id:string})=>t.id==='coffee-ordering');assert.equal(before.slides.length,4);
 const brand={name:'Cedar Street Coffee',background:'#fff2d5',text:'#213d59',accent:'#4b7696'};
 const p=await tool('create_project',{title:'Cedar Street · Black coffee guide',templateId:'coffee-ordering',brand});
 assert.equal(p.slides.length,4);assert.equal(p.brand.name,brand.name);
 const edited=await tool('edit_project',{projectId:p.id,expectedRevision:p.revision,commands:[
 {type:'editSlide',slideId:p.slides[2].id,patch:{eyebrow:'ICED AMERICANO',headline:'Espresso, water and ice.',body:'For a longer cold black coffee, ask for an iced Americano.',visual:'iced-americano'}},
 {type:'editSlide',slideId:p.slides[3].id,patch:{body:'Short and concentrated? Ask for espresso.\nLonger and cold? Ask for an iced Americano.',visual:'iced-americano'}}]});
 assert.equal(edited.revision,1);
 assert.deepEqual((await tool('capabilities')).templates.find((t:{id:string})=>t.id==='coffee-ordering'),before);
 const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?project='+p.id);await page.getByLabel('Project title').waitFor();
 assert.equal(await page.locator('.slide-tab').count(),4);
 for(let i=0;i<4;i++){await page.locator('.slide-tab').nth(i).click();await page.locator('.review-slide').screenshot({path:'.artifacts/cedar-slide-'+i+'.png'});
 assert.ok(await page.locator('.review-slide').evaluate(el=>Array.from(el.children).every(c=>{const r=c.getBoundingClientRect(),b=el.getBoundingClientRect();return r.bottom<=b.bottom+1&&r.right<=b.right+1&&r.left>=b.left-1;})),'Slide content must fit');}
 await page.locator('.slide-tab').nth(2).click();assert.equal(await page.getByLabel('Illustration').inputValue(),'iced-americano');
 await page.getByLabel('Heading',{exact:true}).fill('Your iced coffee, your pace.');await page.getByRole('button',{name:'Save changes'}).click();await page.getByText('Your changes are saved.').waitFor();
 assert.equal((await tool('read_project',{projectId:p.id})).slides[2].headline,'Your iced coffee, your pace.');
 await page.reload();assert.equal(await page.getByLabel('Project title').inputValue(),p.title);
 await page.goto(base+'/?tab=templates');await page.getByRole('button',{name:/Create an editable copy/}).waitFor();assert.equal(await page.locator('.template-strip .review-slide').count(),4);
 await page.screenshot({path:'.artifacts/coffee-template.png',fullPage:true});assert.deepEqual(errors,[]);
 await fs.writeFile('.artifacts/template-agent-result.json',JSON.stringify({projectId:p.id,reviewUrl:base+'/?project='+p.id}));
 console.log(JSON.stringify({reviewUrl:base+'/?project='+p.id,mcpCreateEdit:true,uiSaveReadBack:true,templateUnchanged:true}));
}finally{await client.close();await browser.close();}
