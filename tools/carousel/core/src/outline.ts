import {z} from 'zod';
export const outlineSlide=z.object({headline:z.string().trim().min(1).max(160),body:z.string().max(650)}).strict();
export const outlineSchema=z.array(outlineSlide).min(1).max(30);
export function parseOutline(text:string){if(text.length>30000)throw new Error('Keep the outline under 30,000 characters.');const blocks=text.replace(/\r\n?/g,'\n').split(/^\s*---\s*$/m).map(s=>s.trim()).filter(Boolean);if(!blocks.length)throw new Error('Paste at least one slide.');return outlineSchema.parse(blocks.map((block,i)=>{const [headline,...body]=block.split('\n');return {headline:headline.replace(/^#{1,6}\s+/,''),body:body.join('\n').trim()};}));}
