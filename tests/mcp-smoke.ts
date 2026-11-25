import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import assert from 'node:assert/strict';
const client=new Client({name:'verification',version:'1.0'});
try{await client.connect(new StdioClientTransport({command:path.resolve('node_modules/.bin/tsx'),args:[path.resolve('packages/agent-tools/src/index.ts')]}));
const tools=await client.listTools();assert.ok(tools.tools.some(t=>t.name==='export_project'));
const result=await client.callTool({name:'create_project',arguments:{title:'Agent verification project'}});assert.ok(!result.isError);const project=JSON.parse((result.content as {text:string}[])[0].text);
const edit=await client.callTool({name:'edit_project',arguments:{projectId:project.id,expectedRevision:project.revision,commands:[{type:'editSlide',slideId:project.slides[0].id,patch:{headline:'Created through agent tools.'}}]}});assert.ok(!edit.isError);
const saved=await(await fetch('http://127.0.0.1:4310/api/projects/'+project.id)).json();assert.equal(saved.slides[0].headline,'Created through agent tools.');console.log(JSON.stringify({toolCount:tools.tools.length,createEditRead:true,projectId:project.id}));
}finally{await client.close();}
