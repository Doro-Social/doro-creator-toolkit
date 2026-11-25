import fs from 'node:fs/promises';import path from 'node:path';import {randomUUID} from 'node:crypto';import {z} from 'zod';import {brandSchema,idSchema,AppError} from './schema.ts';
export const kitInput=z.object({label:z.string().trim().min(1).max(80),brand:brandSchema}).strict();
export const kitSchema=kitInput.extend({id:idSchema,revision:z.number().int().nonnegative()});
export type BrandKit=z.infer<typeof kitSchema>;
export class Brands{
 private tail:Promise<unknown>=Promise.resolve();constructor(public root:string){}
 private file(id:string){return path.join(this.root,idSchema.parse(id)+'.json');}
 async read(id:string){try{return kitSchema.parse(JSON.parse(await fs.readFile(this.file(id),'utf8')));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')throw new AppError('KIT_NOT_FOUND','This brand kit was not found. Refresh the kit list.');throw e;}}
 async list(){await fs.mkdir(this.root,{recursive:true});return Promise.all((await fs.readdir(this.root)).filter(n=>/^[a-f0-9-]{36}\.json$/.test(n)).map(n=>this.read(n.slice(0,-5))));}
 save(input:z.infer<typeof kitInput>,id?:string,expectedRevision?:number){const work=this.tail.then(async()=>{const data=kitInput.parse(input);const old=id?await this.read(id):null;if(old&&old.revision!==expectedRevision)throw new AppError('REVISION_CONFLICT','This brand kit changed. Refresh before updating it.');const kit=kitSchema.parse({...data,id:old?.id||randomUUID(),revision:old?old.revision+1:0});await fs.mkdir(this.root,{recursive:true});const file=this.file(kit.id),tmp=file+'.'+randomUUID()+'.tmp';try{await fs.writeFile(tmp,JSON.stringify(kit,null,2));await fs.rename(tmp,file);}finally{await fs.rm(tmp,{force:true});}return kit;});this.tail=work.catch(()=>{});return work;}
}
