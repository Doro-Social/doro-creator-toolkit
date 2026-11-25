import {describe,it,expect} from 'vitest';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {newProject} from '../templates/src/index.ts';
import {Store} from '../core/src/store.ts';
import {batchSchema} from '../core/src/schema.ts';
describe('saved project behavior',()=>{
 it('reopens edits and rejects a stale write without losing the newer text',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'creator space ü-'));try{const store=new Store(root);const p=await store.create(newProject());
 const edit=(headline:string)=>batchSchema.parse({expectedRevision:0,commands:[{type:'editSlide',slideId:p.slides[0].id,patch:{headline}}]});
 await store.batch(p.id,edit('New heading'));await expect(store.batch(p.id,edit('Stale heading'))).rejects.toMatchObject({code:'REVISION_CONFLICT'});
 expect((await new Store(root).read(p.id)).slides[0].headline).toBe('New heading');}finally{await rm(root,{recursive:true,force:true});}
 });
 it('commits none of a batch when a later command would remove the final slide',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'creator-'));try{const store=new Store(root),p=await store.create(newProject());await expect(store.batch(p.id,batchSchema.parse({expectedRevision:0,commands:[{type:'rename',title:'Should not persist'},{type:'removeSlide',slideId:p.slides[0].id}]}))).rejects.toThrow();expect((await store.read(p.id)).title).toBe(p.title);}finally{await rm(root,{recursive:true,force:true});}
 });
 it('dry run returns a candidate without modifying saved data',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'creator-'));try{const store=new Store(root),p=await store.create(newProject());const result=await store.batch(p.id,batchSchema.parse({expectedRevision:0,dryRun:true,commands:[{type:'rename',title:'Preview only'}]}));expect(result.title).toBe('Preview only');expect((await store.read(p.id)).revision).toBe(0);}finally{await rm(root,{recursive:true,force:true});}
 });
 it('serializes simultaneous edits so only one revision wins',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'creator-'));try{const store=new Store(root),p=await store.create(newProject());const results=await Promise.allSettled(['First','Second'].map(title=>store.batch(p.id,batchSchema.parse({expectedRevision:0,commands:[{type:'rename',title}]}))));expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect((await store.read(p.id)).revision).toBe(1);}finally{await rm(root,{recursive:true,force:true});}
 });
});
