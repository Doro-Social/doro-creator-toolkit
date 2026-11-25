import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';import assert from 'node:assert/strict';
const client=new Client({name:'export-verification',version:'1.0'});
async function call(name:string,args:Record<string,unknown>){const result=await client.callTool({name,arguments:args});assert.ok(!result.isError,JSON.stringify(result));return JSON.parse((result.content as {text:string}[])[0].text);}
try{await client.connect(new StdioClientTransport({command:path.resolve('node_modules/.bin/tsx'),args:[path.resolve('packages/agent-tools/src/index.ts')]}));
const p=await call('create_project',{title:'Agent export verification',templateId:'coffee-ordering'});
const edited=await call('edit_project',{projectId:p.id,expectedRevision:0,commands:[{type:'removeSlide',slideId:p.slides[3].id},{type:'removeSlide',slideId:p.slides[2].id},{type:'editSlide',slideId:p.slides[0].id,patch:{duration:2,motion:'rise'}},{type:'editSlide',slideId:p.slides[1].id,patch:{duration:2,motion:'none'}}]});
for(const format of ['png','clips']){let job=await call('export_project',{projectId:p.id,expectedRevision:edited.revision,format,quality:'compact'});for(let i=0;i<600&&!['completed','failed','cancelled'].includes(job.status);i++){await new Promise(r=>setTimeout(r,500));job=await call('get_export',{jobId:job.id});}assert.equal(job.status,'completed',JSON.stringify(job));assert.equal(job.files.filter((f:{name:string})=>f.name.endsWith(format==='png'?'.png':'.mp4')).length,format==='png'?2:1);for(const file of job.files){const response=await fetch('http://127.0.0.1:4310'+file.url);assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,file.bytes);}console.log(format,'completed and every file downloaded',job.id);}
}finally{await client.close();}
