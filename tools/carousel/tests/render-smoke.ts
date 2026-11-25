import path from 'node:path';
import {writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {newProject} from '../templates/src/index.ts';
import {prepareComposition,renderVideo} from '../rendering/src/index.ts';
const directory=path.resolve('.artifacts/render-smoke');
const project=newProject('Renderer installation proof');project.slides[0].duration=2;
await mkdir('.artifacts',{recursive:true});
await writeFile('.artifacts/render-project.json',JSON.stringify(project,null,2));
await prepareComposition(project,directory);
const cli=path.resolve('node_modules/.bin/hyperframes');
for(const args of [['check',directory,'--json'],['snapshot',directory,'--at','1','--no-end','--output',path.resolve('.artifacts/render-frames'),'--json']]){console.log(execFileSync(cli,args,{encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024}));}
const result=await renderVideo(directory,path.resolve('.artifacts/render-smoke.mp4'));console.log(result.stdout,result.stderr);
