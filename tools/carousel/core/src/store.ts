import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {z} from 'zod';
import {applyBatch,AppError,idSchema,projectSchema,batchSchema,type Project,type Batch} from './schema.ts';
export class Store{
 private tail:Promise<unknown>=Promise.resolve();
 constructor(public root:string){}
 private file(id:string){return path.join(this.root,idSchema.parse(id)+'.json');}
 private async atomic(p:Project){await fs.mkdir(this.root,{recursive:true});const file=this.file(p.id),tmp=file+'.'+randomUUID()+'.tmp';try{await fs.writeFile(tmp,JSON.stringify(p,null,2));await fs.rename(tmp,file);}finally{await fs.rm(tmp,{force:true});}}
 private async readRaw(id:string){try{return projectSchema.parse(JSON.parse(await fs.readFile(this.file(id),'utf8')));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')throw new AppError('PROJECT_NOT_FOUND','This project was not found.');throw e;}}
 list(){return this.serial(async()=>{await fs.mkdir(this.root,{recursive:true});const names=await fs.readdir(this.root);return Promise.all(names.filter(n=>/^[a-f0-9-]{36}\.json$/.test(n)).map(n=>this.readRaw(n.slice(0,-5))));});}
 catalog(){return this.serial(async()=>{await fs.mkdir(this.root,{recursive:true});const files=(await fs.readdir(this.root)).filter(n=>/^[a-f0-9-]{36}\.json$/.test(n));const projects:Project[]=[];const unreadable:{id:string;filename:string;code:string;message:string}[]=[];
 for(const filename of files){const id=filename.slice(0,-5);try{const raw=JSON.parse(await fs.readFile(this.file(id),'utf8'));if(raw.schemaVersion!==1){unreadable.push({id,filename,code:'UNSUPPORTED_VERSION',message:'This project uses an unsupported format. Keep the original and open it with a compatible app version.'});continue;}const p=projectSchema.parse(raw);if(p.id!==id)throw new Error('Project identity does not match its filename.');projects.push(p);}catch{unreadable.push({id,filename,code:'UNREADABLE_PROJECT',message:'This project could not be read. The original file is unchanged. Restore a project backup as a separate copy.'});}}
 return {projects,unreadable};
 });}
 read(id:string){return this.serial(()=>this.readRaw(id));}
 initialize(){return this.serial(async()=>{});}
 private async writeJSON(file:string,value:unknown){await fs.mkdir(path.dirname(file),{recursive:true});const tmp=file+'.'+randomUUID()+'.tmp';try{await fs.writeFile(tmp,JSON.stringify(value));await fs.rename(tmp,file);}finally{await fs.rm(tmp,{force:true});}}
 private async recover(){
  const file=path.join(this.root,'.transaction.json');let raw:unknown;
  try{raw=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return;throw e;}
  const journal=z.object({project:projectSchema,history:z.object({past:z.array(projectSchema).max(30),future:z.array(projectSchema).max(30)}).strict(),receipt:z.object({requestId:idSchema,hash:z.string().regex(/^[a-f0-9]{64}$/)}).strict().optional()}).strict().parse(raw);
  if([...journal.history.past,...journal.history.future].some(p=>p.id!==journal.project.id))throw new Error('Invalid transaction project identity.');
  await this.saveHistory(journal.project.id,journal.history);
  await this.atomic(journal.project);
  if(journal.receipt)await this.writeJSON(this.receiptFile(journal.receipt.requestId),{hash:journal.receipt.hash,project:journal.project});
  await fs.rm(file);
 }
 private receiptFile(requestId:string){return path.join(this.root,'.edit-requests',idSchema.parse(requestId)+'.json');}
 private async replay(requestId:string|undefined,hash:string){
  if(!requestId)return;
  try{const receipt=JSON.parse(await fs.readFile(this.receiptFile(requestId),'utf8'));if(receipt.hash!==hash)throw new AppError('REQUEST_REUSED','Use a new requestId for different operation parameters.');return projectSchema.parse(receipt.project);}
  catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 }
 private async commit(project:Project,history:{past:Project[];future:Project[]},receipt?:{requestId:string;hash:string}){
  await this.writeJSON(path.join(this.root,'.transaction.json'),{project,history,receipt});await this.recover();
 }
 private serial<T>(fn:()=>Promise<T>):Promise<T>{const result=this.tail.then(async()=>{await this.recover();return fn();});this.tail=result.catch(()=>{});return result;}
 create(p:Project){return this.serial(async()=>{projectSchema.parse(p);try{await fs.access(this.file(p.id));throw new AppError('ALREADY_EXISTS','Project already exists.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}await this.atomic(p);return p;});}
 createRequested(p:Project,requestId:string,input:unknown){return this.serial(async()=>{
 const dir=path.join(this.root,'.requests'),file=path.join(dir,idSchema.parse(requestId)+'.json');const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');await fs.mkdir(dir,{recursive:true});
 let receipt:{hash:string;project:Project;complete:boolean}|undefined;
 try{receipt=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 if(receipt&&receipt.hash!==hash)throw new AppError('REQUEST_REUSED','Use a new requestId for different creation parameters.');
 const write=async(value:unknown)=>{const tmp=file+'.tmp';await fs.writeFile(tmp,JSON.stringify(value));await fs.rename(tmp,file);};
 if(!receipt){receipt={hash,project:projectSchema.parse(p),complete:false};await write(receipt);}
 if(!receipt.complete){try{await this.readRaw(receipt.project.id);}catch(e){if(!(e instanceof AppError)||e.code!=='PROJECT_NOT_FOUND')throw e;await this.atomic(receipt.project);}receipt.complete=true;await write(receipt);}
 return receipt.project;
 });}
 batch(id:string,b:Batch){b=batchSchema.parse(b);return this.serial(async()=>{
 const hash=createHash('sha256').update(JSON.stringify({id,...b})).digest('hex');
 if(b.requestId&&!b.dryRun){
  try{const receipt=JSON.parse(await fs.readFile(this.receiptFile(b.requestId),'utf8'));if(receipt.hash!==hash)throw new AppError('REQUEST_REUSED','Use a new requestId for different edits.');return projectSchema.parse(receipt.project);}
  catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 }
 const current=await this.readRaw(id),p=applyBatch(current,b);
 if(!b.dryRun){const h=await this.history(id);h.past=[...h.past,current].slice(-30);h.future=[];await this.commit(p,h,b.requestId?{requestId:b.requestId,hash}:undefined);}
 return p;
 });}

 private async history(id:string){try{return JSON.parse(await fs.readFile(path.join(this.root,'.history',idSchema.parse(id)+'.json'),'utf8')) as {past:Project[];future:Project[]};}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {past:[],future:[]};throw e;}}
 private async saveHistory(id:string,h:{past:Project[];future:Project[]}){const dir=path.join(this.root,'.history');await fs.mkdir(dir,{recursive:true});const file=path.join(dir,idSchema.parse(id)+'.json'),tmp=file+'.tmp';await fs.writeFile(tmp,JSON.stringify(h));await fs.rename(tmp,file);}
 undoRedo(id:string,revision:number,direction:'undo'|'redo'){return this.serial(async()=>{const current=await this.readRaw(id);if(current.revision!==revision)throw new AppError('REVISION_CONFLICT','Reload before undo or redo.',{currentRevision:current.revision});const h=await this.history(id),from=direction==='undo'?h.past:h.future,to=direction==='undo'?h.future:h.past;const old=from.pop();if(!old)throw new AppError('NO_HISTORY','Nothing to '+direction+'.');to.push(current);const restored=projectSchema.parse({...old,id,revision:current.revision+1,updatedAt:new Date().toISOString()});h.past=h.past.slice(-30);h.future=h.future.slice(-30);await this.commit(restored,h);return restored;});}
 duplicate(id:string,requestId?:string){return this.serial(async()=>{
 const hash=createHash('sha256').update(JSON.stringify({operation:'duplicate',id})).digest('hex');const previous=await this.replay(requestId,hash);if(previous)return previous;
 const p=await this.readRaw(id);const copy=projectSchema.parse({...p,id:randomUUID(),title:(p.title+' copy').slice(0,120),revision:0,updatedAt:new Date().toISOString(),slides:p.slides.map(s=>({...s,id:randomUUID()}))});
 await this.commit(copy,{past:[],future:[]},requestId?{requestId,hash}:undefined);return copy;
 });}
 archive(id:string,revision:number){return this.serial(async()=>{const p=await this.readRaw(id);if(p.revision!==revision)throw new AppError('REVISION_CONFLICT','Reload before moving this project to trash.');const dir=path.join(this.root,'.trash');await fs.mkdir(dir,{recursive:true});await fs.rename(this.file(id),path.join(dir,id+'.json'));return {id,archived:true};});}
 trash(){return this.serial(async()=>{const dir=path.join(this.root,'.trash');await fs.mkdir(dir,{recursive:true});const files=await fs.readdir(dir);return Promise.all(files.filter(f=>/^[a-f0-9-]{36}\.json$/.test(f)).map(async f=>projectSchema.parse(JSON.parse(await fs.readFile(path.join(dir,f),'utf8')))));});}
 restore(id:string){return this.serial(async()=>{const file=this.file(id);try{await fs.access(file);throw new AppError('ALREADY_EXISTS','A project with this identity is already open.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}await fs.rename(path.join(this.root,'.trash',id+'.json'),file);return this.readRaw(id);});}
 importProject(raw:unknown,requestId?:string){const p=projectSchema.parse(raw);return this.serial(async()=>{
 const hash=createHash('sha256').update(JSON.stringify({operation:'import',project:p})).digest('hex');const previous=await this.replay(requestId,hash);if(previous)return previous;
 const copy={...p,id:randomUUID(),revision:0,updatedAt:new Date().toISOString(),slides:p.slides.map(s=>({...s,id:randomUUID()}))};await this.commit(copy,{past:[],future:[]},requestId?{requestId,hash}:undefined);return copy;
 });}
}
