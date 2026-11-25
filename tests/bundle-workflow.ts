import {chromium,expect} from '@playwright/test';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.ACC_URL||'http://127.0.0.1:4310';
await fs.mkdir('.artifacts',{recursive:true});
const client=new Client({name:'bundle-check',version:'1'});
const browser=await chromium.launch();
async function tool(name:string,args:Record<string,unknown>){const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,JSON.stringify(r));return JSON.parse((r.content as {text:string}[])[0].text);}
try{
 await client.connect(new StdioClientTransport({command:path.resolve('node_modules/.bin/tsx'),args:[path.resolve('packages/agent-tools/src/index.ts')]}));
 const project=await tool('create_project',{title:'Portable project workflow fixture',outline:[{headline:'A first idea',body:'A supporting detail.'},{headline:'A practical next step',body:'An action to take.'}]});
 const output=path.resolve('.artifacts/bundle-'+crypto.randomUUID()+'.zip');
 await tool('export_project_bundle',{projectId:project.id,filePath:output});
 const before=await tool('list_projects',{});const summary=await tool('import_project_bundle',{filePath:output});assert.equal(summary.slides,2);assert.equal((await tool('list_projects',{})).length,before.length);
 const agentCopy=await tool('import_project_bundle',{filePath:output,previewOnly:false});assert.notEqual(agentCopy.id,project.id);assert.deepEqual(agentCopy.slides.map((s:any)=>s.headline),project.slides.map((s:any)=>s.headline));
 const overwrite=await client.callTool({name:'export_project_bundle',arguments:{projectId:project.id,filePath:output}});assert.ok(overwrite.isError);
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(base);await page.getByLabel('Import project file').setInputFiles(output);await expect(page.getByRole('region',{name:'Review project import'})).toBeVisible();await page.screenshot({path:'.artifacts/bundle-import.png'});await page.getByRole('button',{name:'Cancel import'}).click();await expect(page.getByRole('region',{name:'Review project import'})).toHaveCount(0);
 await page.getByLabel('Import project file').setInputFiles(output);await page.getByRole('button',{name:'Import as new project'}).click();await expect(page.getByLabel('Heading',{exact:true})).toHaveValue('A first idea');const id=new URL(page.url()).searchParams.get('project');assert.notEqual(id,project.id);
 await page.getByText('Back up project',{exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download project ZIP'}).click();assert.equal((await download).suggestedFilename(),'carousel-project.zip');
 await page.getByLabel('Heading',{exact:true}).fill('Unsaved change');await expect(page.getByRole('link',{name:'Download project ZIP'})).toHaveCount(0);await expect(page.getByText('Save changes before downloading your latest work.')).toBeVisible();
 console.log('Agent bundle export/preview/import, overwrite refusal, browser preview/cancel/import/download and unsaved-change protection passed.');
}finally{await browser.close();await client.close();}
