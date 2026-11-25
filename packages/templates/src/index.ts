import {coffeeCollection} from './collection.ts';
import {randomUUID} from 'node:crypto';
import {projectSchema,AppError} from '../../core/src/schema.ts';
import {coffeeTemplate,coffeeSlides,coffeeBrand,createProjectSchema} from './coffee.ts';
import type {z} from 'zod';
import type {Project} from '../../core/src/schema.ts';
export const templates=coffeeCollection.map(t=>({...t,fictional:true,slideCount:t.slides.length,format:'1080 × 1350',motions:['none','rise','fade']}));
export function newProject(title='Untitled carousel'):Project{return {schemaVersion:1,id:randomUUID(),revision:0,title,brief:'',brand:{name:'Your business',background:'#122d32',text:'#ffffff',accent:'#d7f378'},slides:[{id:randomUUID(),eyebrow:'YOUR NEXT IDEA',headline:'Make something worth sharing.',body:'Give your agent a topic, audience and the useful takeaway you want people to remember.',duration:5,motion:'rise'}],updatedAt:new Date().toISOString()};}

export function createProject(input:z.infer<typeof createProjectSchema>):Project{
 const b=createProjectSchema.parse(input);const p=newProject(b.title);
 const template=coffeeCollection.find(t=>t.id===b.templateId);
 if(template){p.brief=template.description+' Fictional demonstration business; adapt before publishing.';p.brand={...template.brand};p.slides=template.slides.map(s=>({...s,id:randomUUID()}));}
 if(b.outline){if(b.templateId)throw new AppError('INVALID_INPUT','Choose an outline or a template, not both.');p.slides=b.outline.map(s=>({...s,id:randomUUID(),eyebrow:'',duration:7,motion:'none' as const,layout:'editorial' as const,visual:'none' as const}));}
 if(b.canvas)p.canvas=b.canvas;
 if(b.brand)p.brand={...b.brand};return projectSchema.parse(p);
}
