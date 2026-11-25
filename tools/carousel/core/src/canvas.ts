import {z} from 'zod';
export const canvasSchema=z.object({width:z.number().int().min(320).max(4096),height:z.number().int().min(320).max(4096)}).strict();
export const canvasPresets=[
 {name:'Portrait feed · 4:5',width:1080,height:1350},{name:'Square · 1:1',width:1080,height:1080},
 {name:'Tall · 9:16',width:1080,height:1920},{name:'Portrait photo · 3:4',width:1080,height:1440},
 {name:'Landscape feed',width:1200,height:628},{name:'Widescreen · 16:9',width:1920,height:1080}
];
