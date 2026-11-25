import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import type {Project} from '../../core/src/schema.ts';
import {documentHTML} from './document.tsx';
const run=promisify(execFile);
export const composition=(p:Project)=>documentHTML(p,true);
export async function prepareComposition(p:Project,directory:string){await fs.mkdir(directory,{recursive:true});await fs.writeFile(path.join(directory,'DESIGN.md'),`# Saved carousel design\nPalette and typography: ${JSON.stringify(p.brand)}\nCanvas: ${JSON.stringify(p.canvas)}\nShared SlideCanvas end-state layout. Editable motion preserves copy and uses a readable hold. No random motion or external assets. Full-video pages crossfade for 0.2s; individual clips keep their full still ending.\nTreatments: ${p.slides.map(s=>s.motion).join(', ')}`);await fs.writeFile(path.join(directory,'index.html'),await composition(p));}
export async function renderVideo(directory:string,output:string){return run(path.resolve('node_modules/.bin/hyperframes'),['render',directory,'--output',output,'--fps','30','--quality','draft','--workers','1','--json'],{timeout:180000,maxBuffer:8*1024*1024});}
