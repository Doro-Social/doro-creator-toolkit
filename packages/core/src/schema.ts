import {editableMotionIds} from '../../motion/src/editable.ts';
import {layoutIds} from './layouts.ts';
import {publishingSchema} from './publishing.ts';
import {imageSchema,photoSchema} from './media.ts';
import {canvasSchema} from './canvas.ts';
import {z} from 'zod';
export const idSchema=z.string().uuid();
export const slideAppearanceSchema=z.object({headingScale:z.number().min(.8).max(1.2).default(1),bodyScale:z.number().min(.8).max(1.2).default(1),align:z.enum(['left','center']).default('left')}).strict();
export const slideColorsSchema=z.object({background:z.string().regex(/^#[a-fA-F0-9]{6}$/).optional(),text:z.string().regex(/^#[a-fA-F0-9]{6}$/).optional(),accent:z.string().regex(/^#[a-fA-F0-9]{6}$/).optional()}).strict();
export const slideSchema=z.object({appearance:slideAppearanceSchema.nullable().optional(),colors:slideColorsSchema.nullable().optional(),id:idSchema,eyebrow:z.string().max(80),headline:z.string().min(1).max(160),body:z.string().max(650),duration:z.number().min(2).max(20),motion:z.enum(editableMotionIds),layout:z.enum(layoutIds).optional(),photo:photoSchema.nullable().optional(),visual:z.enum(['none','coffee-pair','espresso','americano','iced-americano']).optional()}).strict();
export const brandSchema=z.object({typography:z.enum(['editorial','modern']).optional(),logo:imageSchema.nullable().optional(),name:z.string().min(1).max(80),background:z.string().regex(/^#[a-fA-F0-9]{6}$/),text:z.string().regex(/^#[a-fA-F0-9]{6}$/),accent:z.string().regex(/^#[a-fA-F0-9]{6}$/)}).strict();
export const projectSchema=z.object({schemaVersion:z.literal(1),id:idSchema,revision:z.number().int().nonnegative(),title:z.string().min(1).max(120),canvas:canvasSchema.optional(),brief:z.string().max(2000),publishing:publishingSchema.optional(),brand:brandSchema,slides:z.array(slideSchema).min(1).max(30),updatedAt:z.string().datetime()}).strict().superRefine((p,c)=>{if(new Set(p.slides.map(s=>s.id)).size!==p.slides.length)c.addIssue({code:'custom',message:'Slide IDs must be unique',path:['slides']});});
export type Project=z.infer<typeof projectSchema>;
export const commandSchema=z.discriminatedUnion('type',[
z.object({type:z.literal('photoFrame'),slideId:idSchema,fit:z.enum(['cover','contain']),x:z.number().min(0).max(100),y:z.number().min(0).max(100)}).strict(),
z.object({type:z.literal('publishing'),publishing:publishingSchema}).strict(),
z.object({type:z.literal('canvas'),canvas:canvasSchema}).strict(),
z.object({type:z.literal('duplicateSlide'),slideId:idSchema}).strict(),
z.object({type:z.literal('rename'),title:z.string().min(1).max(120)}).strict(),
z.object({type:z.literal('brief'),text:z.string().max(2000)}).strict(),
z.object({type:z.literal('brand'),brand:brandSchema}).strict(),
z.object({type:z.literal('editSlide'),slideId:idSchema,patch:slideSchema.omit({id:true}).partial()}).strict(),
z.object({type:z.literal('addSlide'),afterId:idSchema,slide:slideSchema}).strict(),
z.object({type:z.literal('removeSlide'),slideId:idSchema}).strict(),
z.object({type:z.literal('reorder'),slideIds:z.array(idSchema)}).strict()
]);
export const batchSchema=z.object({requestId:idSchema.optional(),expectedRevision:z.number().int().nonnegative(),commands:z.array(commandSchema).min(1).max(100),dryRun:z.boolean().default(false)}).strict();
export type Batch=z.infer<typeof batchSchema>;
export class AppError extends Error{constructor(public code:string,message:string,public details:unknown={}){super(message);}}
export function applyBatch(source:Project,batch:Batch):Project{
 if(source.revision!==batch.expectedRevision)throw new AppError('REVISION_CONFLICT','This project changed. Reload before applying your edits.',{currentRevision:source.revision});
 const p=structuredClone(source);
 for(const c of batch.commands){
  if(c.type==='publishing')p.publishing=c.publishing;
  else if(c.type==='canvas')p.canvas=c.canvas;
  else if(c.type==='rename')p.title=c.title;
  else if(c.type==='brief')p.brief=c.text;
  else if(c.type==='brand')p.brand=c.brand;
  else if(c.type==='reorder'){
   if(c.slideIds.length!==p.slides.length||new Set(c.slideIds).size!==p.slides.length||c.slideIds.some(id=>!p.slides.some(s=>s.id===id)))throw new AppError('INVALID_ORDER','Include each slide exactly once.');
   p.slides=c.slideIds.map(id=>p.slides.find(s=>s.id===id)!);
  }else{
   const id=c.type==='addSlide'?c.afterId:c.slideId;const i=p.slides.findIndex(s=>s.id===id);
   if(i<0)throw new AppError('SLIDE_NOT_FOUND','This slide no longer exists.',{slideId:id});
   if(c.type==='photoFrame'){if(!p.slides[i].photo)throw new AppError('PHOTO_NOT_FOUND','Add a photo before adjusting its framing.');p.slides[i].photo={...p.slides[i].photo!,fit:c.fit,x:c.x,y:c.y};}
   if(c.type==='duplicateSlide')p.slides.splice(i+1,0,{...p.slides[i],id:crypto.randomUUID()});
   if(c.type==='editSlide')p.slides[i]={...p.slides[i],...c.patch};
   if(c.type==='removeSlide')p.slides.splice(i,1);
   if(c.type==='addSlide')p.slides.splice(i+1,0,c.slide);
  }
 }
 p.revision++;p.updatedAt=new Date().toISOString();return projectSchema.parse(p);
}
