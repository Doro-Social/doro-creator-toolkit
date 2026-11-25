import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {startLocalApp,freePort} from '../../../tests/helpers/local-app.ts';
const root=await fs.mkdtemp(path.resolve('.artifacts/edit-retry-'));const port=await freePort();let app=await startLocalApp(path.join(root,'projects'),port);const client=new Client({name:'edit-retry-check',version:'1'});
async function call(name:string,args:Record<string,unknown>){const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,JSON.stringify(r));return JSON.parse((r.content as {text:string}[])[0].text);}
try{
 await client.connect(new StdioClientTransport({command:process.execPath,args:['--import','tsx',path.resolve('packages/agent-tools/src/index.ts')],env:{...Object.fromEntries(Object.entries(process.env).filter((x):x is [string,string]=>typeof x[1]==='string')),ACC_URL:app.url}}));
 const schemas=await client.listTools();assert.ok((schemas.tools.find(t=>t.name==='edit_project')!.inputSchema.properties as any).requestId);
 const p=await call('create_project',{title:'Retry verification',requestId:randomUUID()});
 const input={projectId:p.id,requestId:randomUUID(),expectedRevision:0,commands:[{type:'duplicateSlide',slideId:p.slides[0].id}]};
 const first=await call('edit_project',input);assert.equal(first.slides.length,2);
 assert.deepEqual(await call('edit_project',input),first);
 const later=await call('edit_project',{projectId:p.id,expectedRevision:1,commands:[{type:'rename',title:'Newer version'}]});
 await app.stop();app=await startLocalApp(path.join(root,'projects'),port);
 assert.deepEqual(await call('edit_project',input),first);assert.deepEqual(await call('read_project',{projectId:p.id}),later);
 const conflict=await client.callTool({name:'edit_project',arguments:{...input,commands:[{type:'rename',title:'Wrong reused ID'}]}});assert.ok(conflict.isError);assert.match(JSON.stringify(conflict),/REQUEST_REUSED/);
 await call('project_history',{projectId:p.id,expectedRevision:2,direction:'undo'});const undone=await call('project_history',{projectId:p.id,expectedRevision:3,direction:'undo'});assert.equal(undone.slides.length,1);
 const duplicateInput={projectId:p.id,requestId:randomUUID()};const copy=await call('duplicate_project',duplicateInput);assert.deepEqual(await call('duplicate_project',duplicateInput),copy);
 const importInput={project:await call('read_project',{projectId:p.id,includeMedia:true}),requestId:randomUUID()};const imported=await call('import_project',importInput);assert.deepEqual(await call('import_project',importInput),imported);assert.equal((await call('list_projects',{})).length,3);
 await fs.writeFile(path.join(root,'evidence.json'),JSON.stringify({projectId:p.id,replayedRevision:first.revision,preservedRevision:later.revision,undoRevision:undone.revision,restarted:true},null,2));console.log(root);
}finally{await client.close();await app.stop();}
