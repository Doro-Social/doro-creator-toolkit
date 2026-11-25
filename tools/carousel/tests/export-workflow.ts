import {Exports} from '../exports/src/index.ts';
import {createProject} from '../templates/src/index.ts';
import {canvasPresets} from '../core/src/canvas.ts';
import {applyBatch,batchSchema} from '../core/src/schema.ts';
import {Store} from '../core/src/store.ts';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import AdmZip from 'adm-zip';
const root=path.resolve('.artifacts/export-workflow');await fs.mkdir(root,{recursive:true});
const exportsService=new Exports(path.join(root,'exports'));await exportsService.initialize();
const p=createProject({title:'Rill Coffee · Ordering guide',templateId:'coffee-ordering'});
async function finish(id:string){for(let i=0;i<600;i++){const job=exportsService.get(id);if(['completed','failed','cancelled'].includes(job.status))return job;await new Promise(r=>setTimeout(r,500));}throw new Error('Export timeout');}
for(const canvas of canvasPresets){const project={...p,canvas};const job=await finish((await exportsService.start(project,{expectedRevision:0,format:'jpg',quality:'standard'})).id);assert.equal(job.status,'completed',JSON.stringify(job));const zip=new AdmZip(path.join(job.outputDirectory,'carousel.zip'));assert.equal(zip.getEntries().filter(e=>e.entryName.endsWith('.jpg')).length,4);assert.equal(job.files.filter(f=>f.name.endsWith('.jpg')).length,4);console.log('Images',canvas.width,canvas.height,job.outputDirectory);}
const pdf=await finish((await exportsService.start(p,{expectedRevision:0,format:'pdf',quality:'standard'})).id);assert.equal(pdf.status,'completed',JSON.stringify(pdf));await fs.writeFile(path.join(root,'pdf-result.json'),JSON.stringify(pdf));console.log('PDF',pdf.outputDirectory);
const invalid={...p,slides:[{...p.slides[0],headline:'Long headline '.repeat(10),body:'Long body '.repeat(60)}]};const bad=await finish((await exportsService.start(invalid,{expectedRevision:0,format:'jpg',quality:'standard'})).id);assert.equal(bad.status,'failed');assert.ok(bad.findings.some(f=>f.code==='OVERFLOW'));assert.equal(bad.files.length,0);
const job=await exportsService.start(p,{expectedRevision:0,format:'jpg',quality:'standard'});await exportsService.cancel(job.id);assert.equal((await finish(job.id)).status,'cancelled');
const store=new Store(path.join(root,'projects'));await store.create(p);const next=await store.batch(p.id,batchSchema.parse({expectedRevision:0,commands:[{type:'duplicateSlide',slideId:p.slides[0].id}]}));assert.equal(next.slides.length,5);const undo=await store.undoRedo(p.id,1,'undo');assert.equal(undo.slides.length,4);const redo=await store.undoRedo(p.id,2,'redo');assert.equal(redo.slides.length,5);await store.archive(p.id,3);assert.equal((await store.list()).length,0);await store.restore(p.id);assert.equal((await store.read(p.id)).revision,3);
const tiny={...p,slides:[{...p.slides[1],duration:2,motion:'rise' as const},{...p.slides[2],duration:2,motion:'none' as const}]};const video=await finish((await exportsService.start(tiny,{expectedRevision:0,format:'video',quality:'compact'})).id);assert.equal(video.status,'completed',JSON.stringify(video));await fs.writeFile(path.join(root,'video-result.json'),JSON.stringify(video));console.log('Video',video.outputDirectory);
console.log('All canvas presets, PDF, overflow rejection, cancellation, undo/redo and trash recovery passed.');
