import AdmZip from 'adm-zip';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {z} from 'zod';
import {AppError,projectSchema,type Project} from './schema.ts';

export const bundleLimit=48*1024*1024;
const hash=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
const manifestSchema=z.object({format:z.literal('doro-creator-project'),version:z.literal(1),appVersion:z.literal('0.1.0'),projectSchemaVersion:z.literal(1),project:z.object({file:z.literal('project.json'),bytes:z.number().int().positive().max(bundleLimit),sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict(),media:z.literal('embedded-webp')}).strict();
const instructions='Doro Creator Toolkit project bundle\n\nOpen Projects, choose Import project, select this ZIP, review it and choose Import as new project. Or ask your local agent to use import_project_bundle.\n\nRequires project schema 1, supported by app 0.1.0. Photos and logos are embedded normalized WebP images in project.json. This is not an archive of original media. Includes saved brief, captions and internal tags; review before sharing. Does not include credentials, history, exports or other workspace files. No scripts are needed or executed.\n';
export function createBundle(input:Project):Buffer{
 const project=projectSchema.parse(input);const bytes=Buffer.from(JSON.stringify(project,null,2));
 if(bytes.length>bundleLimit)throw new AppError('BUNDLE_TOO_LARGE','This project exceeds the 48 MB bundle limit.');
 const zip=new AdmZip();zip.addFile('project.json',bytes);zip.addFile('manifest.json',Buffer.from(JSON.stringify({format:'doro-creator-project',version:1,appVersion:'0.1.0',projectSchemaVersion:1,project:{file:'project.json',bytes:bytes.length,sha256:hash(bytes)},media:'embedded-webp'},null,2)));zip.addFile('README.txt',Buffer.from(instructions));return zip.toBuffer();
}
export function readBundle(bytes:Buffer):Project{
 try{
  if(bytes.length>bundleLimit)throw new Error('Choose a project ZIP up to 48 MB.');
  const zip=new AdmZip(bytes);const entries=zip.getEntries();
  if(entries.length!==3||new Set(entries.map(e=>e.entryName)).size!==3)throw new Error('The project bundle must contain exactly project.json, manifest.json and README.txt.');
  let total=0;
  for(const e of entries){
   if(!['project.json','manifest.json','README.txt'].includes(e.entryName)||e.isDirectory||(e.header.flags&1)||((e.attr>>>16)&0xf000)===0xa000)throw new Error('Unsupported file, path or encrypted entry in project bundle.');
   const limit=e.entryName==='project.json'?bundleLimit:16384;
   if(e.header.size>limit||(total+=e.header.size)>bundleLimit+32768)throw new Error('The expanded bundle is too large.');
  }
  // Bound actual inflation as well as declared sizes. Never extract archive paths to disk.
  const read=(name:string)=>{const e=zip.getEntry(name)!;const compressed=e.getCompressedData();const cap=name==='project.json'?bundleLimit:16384;const data=e.header.method===0?compressed:e.header.method===8?inflateRawSync(compressed,{maxOutputLength:cap}):null;if(!data||data.length>cap||data.length!==e.header.size)throw new Error('Invalid compressed project file.');return data;};
  const manifest=manifestSchema.parse(JSON.parse(read('manifest.json').toString('utf8')));
  const project=read('project.json');read('README.txt');
  if(project.length!==manifest.project.bytes||hash(project)!==manifest.project.sha256)throw new Error('The project checksum does not match. Use an intact project bundle.');
  const raw=JSON.parse(project.toString('utf8'));
  if(raw.schemaVersion!==1)throw new Error('This project version is unsupported. Update the app that opens it; the source file has not been changed.');
  return projectSchema.parse(raw);
 }catch(e){throw new AppError('INVALID_BUNDLE',e instanceof z.ZodError?'This bundle uses an unsupported format or contains invalid project fields.':(e as Error).message);}
}
export function bundleSummary(p:Project){return {title:p.title,slides:p.slides.length,brand:p.brand.name,canvas:p.canvas??{width:1080,height:1350},photos:p.slides.filter(s=>s.photo).length,logo:!!p.brand.logo,hasPostDetails:!!p.publishing,headlines:p.slides.map(s=>s.headline)};}
