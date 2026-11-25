import {prepareComposition} from '../../rendering/src/index.ts';
import {reviewFontCoverage} from '../../rendering/src/font-review.ts';
import {reviewProject,type Finding} from '../../core/src/review.ts';
export type {Finding} from '../../core/src/review.ts';
import {runRenderer} from '../../rendering/src/process.ts';
import {publishingText} from '../../core/src/publishing.ts';
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium,type Browser} from '@playwright/test';
import {PDFDocument} from 'pdf-lib';
import AdmZip from 'adm-zip';
import {z} from 'zod';
import {documentHTML} from '../../rendering/src/document.tsx';
import {AppError,idSchema,type Project} from '../../core/src/schema.ts';
export const exportSchema=z.object({requestId:z.string().uuid().optional(),expectedRevision:z.number().int().nonnegative(),format:z.enum(['jpg','png','pdf','video','clips']),quality:z.enum(['standard','compact']).default('standard')}).strict();
export type ExportOptions=z.infer<typeof exportSchema>;
export type Job={id:string;projectId:string;revision:number;format:ExportOptions['format'];quality:ExportOptions['quality'];status:'queued'|'running'|'completed'|'failed'|'cancelled';progress:number;createdAt:string;outputDirectory:string;files:{name:string;url:string;bytes:number;sha256:string}[];findings:Finding[];error?:string};
const run=promisify(execFile);
export class Exports{
 private writes:Promise<unknown>=Promise.resolve();
 private jobs=new Map<string,Job>();private controls=new Map<string,AbortController>();private queue:Promise<unknown>=Promise.resolve();
 constructor(public root:string){}
 async initialize(){await fs.mkdir(this.root,{recursive:true});for(const entry of await fs.readdir(this.root)){if(!idSchema.safeParse(entry).success)continue;try{const job=JSON.parse(await fs.readFile(path.join(this.root,entry,'job.json'),'utf8')) as Job;if(job.status==='running'||job.status==='queued'){job.status='failed';job.error='The application stopped before export finished. Your project is safe. Start a new export.';await this.cleanPartial(job.id);await this.persist(job);}this.jobs.set(job.id,job);}catch{/* Incomplete directories are not downloadable jobs. */}}}
 private async cleanPartial(id:string){const dir=this.dir(id);for(const name of await fs.readdir(dir)){if(name==='job.json'||name==='project.json')continue;await fs.rm(path.join(dir,name),{recursive:true,force:true});}}
 private dir(id:string){return path.join(this.root,idSchema.parse(id));}
 private persist(job:Job){const pending=this.writes.then(async()=>{const dir=this.dir(job.id);await fs.mkdir(dir,{recursive:true});const tmp=path.join(dir,'job.'+randomUUID()+'.tmp');await fs.writeFile(tmp,JSON.stringify(job,null,2));await fs.rename(tmp,path.join(dir,'job.json'));});this.writes=pending.catch(()=>{});return pending;}

 list(projectId:string){return [...this.jobs.values()].filter(j=>j.projectId===projectId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
 get(id:string){const j=this.jobs.get(id);if(!j)throw new AppError('JOB_NOT_FOUND','Export job not found.');return j;}
 async cancel(id:string){const job=this.get(id);if(job.status==='queued'||job.status==='running'){this.controls.get(id)?.abort();job.status='cancelled';job.error='Export cancelled. Your project is unchanged.';await this.persist(job);}return job;}
 async start(p:Project,options:ExportOptions){if(options.requestId){const existing=this.jobs.get(options.requestId);if(existing){if(existing.projectId!==p.id||existing.revision!==options.expectedRevision||existing.format!==options.format||existing.quality!==options.quality)throw new AppError('REQUEST_REUSED','Use a new requestId for different export settings.');return existing;}}if(p.revision!==options.expectedRevision)throw new AppError('REVISION_CONFLICT','Reload the saved project before exporting.');const active=this.list(p.id).filter(j=>j.status==='queued'||j.status==='running');if(active.length)throw new AppError('EXPORT_ACTIVE','This project already has an active export.',{jobId:active[0].id});if([...this.jobs.values()].filter(j=>['queued','running'].includes(j.status)).length>=4)throw new AppError('QUEUE_FULL','Please wait for an export to finish.');
 const id=options.requestId||randomUUID(),job:Job={id,projectId:p.id,revision:p.revision,format:options.format,quality:options.quality,status:'queued',progress:0,createdAt:new Date().toISOString(),outputDirectory:this.dir(id),files:[],findings:[]};
 const control=new AbortController();this.jobs.set(id,job);this.controls.set(id,control);try{await this.persist(job);const snapshot=structuredClone(p);await fs.writeFile(path.join(this.dir(id),'project.json'),JSON.stringify(snapshot,null,2));this.queue=this.queue.then(()=>this.execute(job,snapshot,control)).catch(()=>{});return job;}catch(e){job.status='failed';job.error='Could not save the export snapshot. Check available disk space and folder permissions, then retry.';this.controls.delete(id);await this.persist(job).catch(()=>{});throw new AppError('EXPORT_STORAGE_ERROR',job.error);}}
 async inspect(p:Project){const html=await documentHTML(p);const size=p.canvas||{width:1080,height:1350};const browser=await chromium.launch();try{const page=await browser.newPage({viewport:size});await page.setContent(html);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(image=>image.decode()));});return await this.findings(page,p);}finally{await browser.close();}}
 private async findings(page:import('@playwright/test').Page,p:Project){
 const out:Finding[]=[...reviewProject(p),...await reviewFontCoverage(p)];
 const bad=await page.locator('.review-slide').evaluateAll(nodes=>nodes.map(node=>{
  const b=node.getBoundingClientRect();
  return Array.from(node.querySelectorAll<HTMLElement>('[data-field]')).filter(x=>getComputedStyle(x).display!=='none').flatMap(x=>{const r=x.getBoundingClientRect();return r.bottom>b.bottom-5||r.right>b.right-5||r.left<b.left+5||r.top<b.top+5||x.scrollHeight>x.clientHeight+2||x.scrollWidth>x.clientWidth+2?[x.dataset.field||'layout']:[];});
 }));
 bad.forEach((fields,i)=>fields.forEach(field=>out.push({projectId:p.id,revision:p.revision,slideId:p.slides[i].id,severity:'error',code:'OVERFLOW',field,message:`The ${field} extends beyond the slide. Shorten the text, reduce its size or choose a taller canvas.`})));
 const media=await page.locator('.review-slide').evaluateAll(nodes=>nodes.map(node=>{
  const frame=node.getBoundingClientRect();return Array.from(node.querySelectorAll<HTMLElement>('.slide-photo,.coffee-illustration')).map(el=>{const r=el.getBoundingClientRect();return {field:el.dataset.field||'photo',hidden:r.width<1||r.height<1,small:r.height<Math.min(frame.width,frame.height)*.1};});
 }));
 media.forEach((items,i)=>items.forEach(item=>{if(item.hidden||item.small)out.push({projectId:p.id,revision:p.revision,slideId:p.slides[i].id,severity:item.hidden?'error':'warning',code:item.hidden?'HIDDEN_MEDIA':'SMALL_MEDIA',field:item.field,message:item.hidden?'The artwork has no visible space in this layout. Shorten the text, choose another layout or remove the artwork intentionally.':'The artwork has very little space in this layout. Check it at phone size; shorten the text or choose another layout if the image matters to the message.'});}));
 return out;
 }
 private async execute(job:Job,p:Project,control:AbortController){let browser:Browser|undefined;const check=()=>{if(control.signal.aborted)throw new Error('Export cancelled.');};const cancelBrowser=()=>{void browser?.close();};control.signal.addEventListener('abort',cancelBrowser);
 try{check();job.status='running';job.progress=5;await this.persist(job);const dir=this.dir(job.id),size=p.canvas||{width:1080,height:1350};if(['video','clips'].includes(job.format)&&(size.width%2||size.height%2))throw new Error('Video requires even pixel dimensions. Choose a standard preset or even custom dimensions.');
 const html=await documentHTML(p);browser=await chromium.launch();const page=await browser.newPage({viewport:size});await page.setContent(html);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(image=>image.decode()));});job.findings=await this.findings(page,p);if(job.findings.some(f=>f.severity==='error'))throw new Error('Some slide content does not fit. Repair the reported slides before exporting.');check();const names:string[]=[];
 for(let i=0;i<p.slides.length;i++){check();const ext=job.format==='png'?'png':'jpg',name='slide-'+String(i+1).padStart(2,'0')+'.'+ext;await page.locator('.export-page').nth(i).screenshot({path:path.join(dir,name),type:ext==='jpg'?'jpeg':'png',...(ext==='jpg'?{quality:job.quality==='compact'?80:95}:{})});names.push(name);job.progress=10+Math.round((i+1)/p.slides.length*45);await this.persist(job);}
 if(job.format==='pdf'){await page.pdf({path:path.join(dir,'carousel.pdf'),width:size.width+'px',height:size.height+'px',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,margin:{top:0,bottom:0,left:0,right:0}});const pdfPath=path.join(dir,'carousel.pdf');const pdf=await PDFDocument.load(await fs.readFile(pdfPath));if(pdf.getPageCount()!==p.slides.length)throw new Error('PDF page count differs from slide count.');pdf.setTitle(p.publishing?.documentTitle.trim()||'Carousel');pdf.getPages().forEach(page=>page.setSize(size.width*.75,size.height*.75));await fs.writeFile(pdfPath,await pdf.save());names.push('carousel.pdf');}
 await browser.close();browser=undefined;check();
 if(job.format==='video'||job.format==='clips'){
 const render=async(project:Project,name:string)=>{check();const source=path.join(dir,'source-'+name);await fs.mkdir(source,{recursive:true});await prepareComposition(project,source);await runRenderer(path.resolve('node_modules/.bin/hyperframes'),['render',source,'--output',path.join(dir,name),'--fps','30','--workers','1','--quality',job.quality==='compact'?'draft':'looks','--json'],control.signal);names.push(name);};
 if(job.format==='video')await render(p,'carousel.mp4');else for(let i=0;i<p.slides.length;i++){if(p.slides[i].motion!=='none')await render({...p,slides:[p.slides[i]]},'slide-'+String(i+1).padStart(2,'0')+'.mp4');job.progress=55+Math.round((i+1)/p.slides.length*30);await this.persist(job);}}
 check();if(p.publishing){await fs.writeFile(path.join(dir,'publishing.json'),JSON.stringify(p.publishing,null,2));await fs.writeFile(path.join(dir,'captions.txt'),publishingText(p.publishing));names.push('publishing.json','captions.txt');}names.push('project.json');const files=await Promise.all(names.map(async name=>{const bytes=await fs.readFile(path.join(dir,name));return {name,url:'/api/exports/'+job.id+'/files/'+name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}));
 const manifest={projectId:p.id,revision:p.revision,title:p.title,canvas:size,format:job.format,quality:job.quality,createdAt:job.createdAt,renderer:'shared React SlideCanvas',videoRenderer:['video','clips'].includes(job.format)?'hyperframes@0.8.224':undefined,slides:p.slides.map((s,i)=>({id:s.id,order:i+1,duration:s.duration,motion:s.motion})),files};await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 const zip=new AdmZip();for(const name of [...names,'manifest.json'])zip.addLocalFile(path.join(dir,name));await zip.writeZipPromise(path.join(dir,'carousel.zip'));
 for(const name of ['manifest.json','carousel.zip']){const bytes=await fs.readFile(path.join(dir,name));files.push({name,url:'/api/exports/'+job.id+'/files/'+name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}check();job.files=files;job.status='completed';job.progress=100;await this.persist(job);
 }catch(e){job.files=[];job.status=control.signal.aborted?'cancelled':'failed';job.error=control.signal.aborted?'Export cancelled. Your project is unchanged.':(e as Error).message.slice(0,1200);await browser?.close();browser=undefined;try{await this.cleanPartial(job.id);}catch{job.error+=' Some temporary files could not be removed; check folder permissions.';}await this.persist(job);}finally{await browser?.close();control.signal.removeEventListener('abort',cancelBrowser);this.controls.delete(job.id);}}
 file(id:string,name:string){const j=this.get(id);if(j.status!=='completed'||!j.files.some(f=>f.name===name))throw new AppError('FILE_NOT_AVAILABLE','This export file is not available.');return path.join(this.dir(id),name);}
 async shutdown(){await Promise.all([...this.controls.keys()].map(id=>this.cancel(id)));await this.queue;await this.writes;}
}
