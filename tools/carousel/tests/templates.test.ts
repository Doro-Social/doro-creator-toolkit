import {it,expect} from 'vitest';
import {createProject} from '../templates/src/index.ts';
import {coffeeSlides,coffeeBrand,createProjectSchema} from '../templates/src/coffee.ts';
import {applyBatch,batchSchema} from '../core/src/schema.ts';
it('creates independent template instances and preserves the starter after personalization',()=>{
 const a=createProject({title:'One',templateId:'coffee-ordering'}),b=createProject({title:'Two',templateId:'coffee-ordering'});
 expect(a.slides).toHaveLength(4);expect(a.id).not.toBe(b.id);expect(a.slides.some(s=>b.slides.some(t=>t.id===s.id))).toBe(false);
 const edit=applyBatch(a,batchSchema.parse({expectedRevision:0,commands:[{type:'editSlide',slideId:a.slides[2].id,patch:{headline:'Iced coffee',visual:'iced-americano',motion:'none'}}]}));
 expect(edit.slides[2].visual).toBe('iced-americano');expect(b.slides[2].headline).toBe(coffeeSlides[2].headline);expect(a.brand).toEqual(coffeeBrand);
});
it('rejects unknown templates and validates brand colors before creating a draft',()=>{
 expect(createProjectSchema.safeParse({title:'X',templateId:'typo'}).success).toBe(false);
 expect(createProjectSchema.safeParse({title:'X',templateId:'coffee-ordering',brand:{...coffeeBrand,accent:'red'}}).success).toBe(false);
});

it('switches layouts without discarding photo, copy or motion',()=>{
 const p=createProject({title:'Layout preservation',templateId:'coffee-showcase'});
 p.slides[0].photo={src:'data:image/webp;base64,AAAA',alt:'Fixture',width:10,height:10,fit:'contain',x:25,y:75};p.slides[0].motion='fade';const slide=p.slides[0];const updated=applyBatch(p,batchSchema.parse({expectedRevision:0,commands:[{type:'editSlide',slideId:slide.id,patch:{layout:'editorial'}}]}));
 expect(updated.slides[0]).toEqual({...slide,layout:'editorial'});
});
