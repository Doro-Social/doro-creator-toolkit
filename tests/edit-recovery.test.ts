import {it,expect,vi} from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {Store} from '../packages/core/src/store.ts';
import {batchSchema} from '../packages/core/src/schema.ts';
import {newProject} from '../packages/templates/src/index.ts';
async function setup(){const root=await fs.mkdtemp(path.join(tmpdir(),'edit-recovery-'));const store=new Store(root);const p=await store.create(newProject());return {root,store,p};}
it('replays the original edit across restart without changing a newer revision or adding undo entries',async()=>{
 const {root,store,p}=await setup();try{
 const batch=batchSchema.parse({requestId:randomUUID(),expectedRevision:0,commands:[{type:'duplicateSlide',slideId:p.slides[0].id}]});
 const [first,replay]=await Promise.all([store.batch(p.id,batch),store.batch(p.id,batch)]);expect(replay).toEqual(first);expect(first.slides).toHaveLength(2);
 await store.batch(p.id,batchSchema.parse({expectedRevision:1,commands:[{type:'rename',title:'Later edit'}]}));
 const restarted=new Store(root);expect(await restarted.batch(p.id,batch)).toEqual(first);expect((await restarted.read(p.id)).revision).toBe(2);
 await expect(restarted.batch(p.id,{...batch,commands:[{type:'rename',title:'Changed request'}]})).rejects.toMatchObject({code:'REQUEST_REUSED'});
 await restarted.undoRedo(p.id,2,'undo');expect((await restarted.undoRedo(p.id,3,'undo')).slides).toHaveLength(1);
 await expect(restarted.undoRedo(p.id,4,'undo')).rejects.toMatchObject({code:'NO_HISTORY'});
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
it.each(['history','project','receipt'])('recovers a save interrupted at %s, including its undo and retry receipt',async(stage)=>{
 const {root,store,p}=await setup();try{
 const batch=batchSchema.parse({requestId:randomUUID(),expectedRevision:0,commands:[{type:'rename',title:'Recovered edit'}]});
 const original=fs.rename.bind(fs);let failed=false;
 const spy=vi.spyOn(fs,'rename').mockImplementation(async(from,to)=>{
  const target=String(to);const match=stage==='history'?target.includes('.history'):stage==='receipt'?target.includes('.edit-requests'):target===path.join(root,p.id+'.json');
  if(match&&!failed){failed=true;throw new Error('Simulated interrupted write');}return original(from,to);
 });
 try{await expect(store.batch(p.id,batch)).rejects.toThrow('Simulated interrupted write');}finally{spy.mockRestore();}
 expect(failed).toBe(true);const restarted=new Store(root);await restarted.initialize();const recovered=await restarted.read(p.id);expect(recovered.title).toBe('Recovered edit');expect(recovered.revision).toBe(1);expect(await restarted.batch(p.id,batch)).toEqual(recovered);
 expect((await restarted.undoRedo(p.id,1,'undo')).title).toBe(p.title);await expect(fs.access(path.join(root,'.transaction.json'))).rejects.toThrow();
 }finally{vi.restoreAllMocks();await fs.rm(root,{recursive:true,force:true});}
});
it('recovers interrupted undo without consuming an extra history step',async()=>{
 const {root,store,p}=await setup();try{
 await store.batch(p.id,batchSchema.parse({expectedRevision:0,commands:[{type:'rename',title:'Edited'}]}));
 const original=fs.rename.bind(fs);const spy=vi.spyOn(fs,'rename').mockImplementation(async(from,to)=>{if(String(to)===path.join(root,p.id+'.json'))throw new Error('Interrupted undo');return original(from,to);});
 try{await expect(store.undoRedo(p.id,1,'undo')).rejects.toThrow('Interrupted undo');}finally{spy.mockRestore();}
 const restarted=new Store(root);expect((await restarted.read(p.id)).title).toBe(p.title);expect((await restarted.undoRedo(p.id,2,'redo')).title).toBe('Edited');
 }finally{vi.restoreAllMocks();await fs.rm(root,{recursive:true,force:true});}
});
it('does not reserve a retry ID for dry runs or rejected edits',async()=>{
 const {root,store,p}=await setup();try{
 const batch=batchSchema.parse({requestId:randomUUID(),expectedRevision:0,commands:[{type:'rename',title:'Dry run'}],dryRun:true});await store.batch(p.id,batch);
 const saved=await store.batch(p.id,{...batch,dryRun:false});expect(saved.revision).toBe(1);
 const next={...batch,requestId:randomUUID(),dryRun:false};await expect(store.batch(p.id,next)).rejects.toMatchObject({code:'REVISION_CONFLICT'});expect((await store.batch(p.id,{...next,expectedRevision:1})).revision).toBe(2);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
it('retries duplicate and import without making extra projects, including after archiving the source',async()=>{
 const {root,store,p}=await setup();try{
 const duplicateKey=randomUUID(),importKey=randomUUID();const copy=await store.duplicate(p.id,duplicateKey);await store.archive(p.id,0);
 const restarted=new Store(root);expect(await restarted.duplicate(p.id,duplicateKey)).toEqual(copy);
 const imported=await restarted.importProject(p,importKey);expect(await new Store(root).importProject(p,importKey)).toEqual(imported);expect(await restarted.list()).toHaveLength(2);
 await expect(restarted.importProject({...p,title:'Different'},importKey)).rejects.toMatchObject({code:'REQUEST_REUSED'});
 await expect(restarted.importProject(p,duplicateKey)).rejects.toMatchObject({code:'REQUEST_REUSED'});
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
