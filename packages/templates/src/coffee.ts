import {outlineSchema} from '../../core/src/outline.ts';
import {canvasSchema} from '../../core/src/canvas.ts';
import {z} from 'zod';
import {brandSchema} from '../../core/src/schema.ts';
export const createProjectSchema=z.object({requestId:z.string().uuid().optional(),outline:outlineSchema.optional(),title:z.string().min(1).max(120),canvas:canvasSchema.optional(),templateId:z.enum(['engineering-fixture','coffee-ordering','coffee-announcement','coffee-showcase','coffee-story']).optional(),brand:brandSchema.optional()}).strict();
export const coffeeBrand={name:'Rill Coffee',background:'#f1e6cd',text:'#293e36',accent:'#9f4d39'};
export const coffeeSlides=[
 {eyebrow:'THE BLACK COFFEE GUIDE',headline:'Short and bold, or a longer sip?',body:'Espresso and Americano both start with espresso. Choose by how much water you want in your cup.',visual:'coffee-pair',motion:'none',duration:7},
 {eyebrow:'ESPRESSO',headline:'A small cup. A concentrated taste.',body:'Choose espresso when you want a short drink with no added water or milk.',visual:'espresso',motion:'none',duration:6},
 {eyebrow:'AMERICANO',headline:'Espresso, with room to sip.',body:'An Americano adds water to espresso. Choose it when you want a longer black coffee.',visual:'americano',motion:'none',duration:6},
 {eyebrow:'AT THE COUNTER',headline:'Order the cup that fits your mood.',body:'Short and concentrated? Ask for espresso.\nA longer black coffee? Ask for an Americano.',visual:'coffee-pair',motion:'none',duration:7},
] as const;
export const coffeeTemplate={id:'coffee-ordering',name:'The black coffee guide',description:'Four illustrated slides that help a guest choose espresso or Americano.',slideCount:4,format:'1080 × 1350',motions:['none'],brand:coffeeBrand,slides:coffeeSlides};
