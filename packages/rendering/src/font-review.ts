import fs from 'node:fs/promises';import path from 'node:path';import {create,type Font} from 'fontkit';
import type {Project} from '../../core/src/schema.ts';import type {Finding} from '../../core/src/review.ts';
const files={body:'public/brand-assets/doro-social/fonts/geist-latin.woff2',label:'public/brand-assets/doro-social/fonts/geist-mono-latin.woff2',display:'public/fonts/fraunces-latin-400-italic.woff2'};
let cached:Promise<Record<keyof typeof files,Font>>|undefined;
async function fonts(){return cached??=(async()=>{
 const entries=await Promise.all(Object.entries(files).map(async([key,file])=>{const font=create(await fs.readFile(path.resolve(file)));if(!('hasGlyphForCodePoint' in font))throw new Error('Expected a bundled single font.');return [key,font] as const;}));return Object.fromEntries(entries) as Record<keyof typeof files,Font>;
})().catch(error=>{cached=undefined;throw error;});}
export async function reviewFontCoverage(project:Project):Promise<Finding[]>{
 const bundled=await fonts(),findings:Finding[]=[];
 for(const slide of project.slides){
  const modern=project.brand.typography==='modern';
  const fields:[string,string,Font][]=[['eyebrow',slide.eyebrow,bundled.label],['headline',slide.headline,modern||['statement','cta'].includes(slide.layout||'')?bundled.body:bundled.display],['body',slide.body,bundled.body]];
  if(slide.id===project.slides[0].id)fields.unshift(['brand.name',project.brand.name,modern?bundled.body:bundled.display]);
  for(const [field,text,font] of fields){
   const missing=[...new Set([...text.normalize('NFC')].filter(character=>{
    const code=character.codePointAt(0)!;return !/[\p{Cc}\p{Cf}\p{Z}]/u.test(character)&&!(code>=0xfe00&&code<=0xfe0f)&&!(code>=0xe0100&&code<=0xe01ef)&&!font.hasGlyphForCodePoint(code);
   }))];
   if(missing.length)findings.push({projectId:project.id,revision:project.revision,slideId:slide.id,severity:'warning',code:'FONT_FALLBACK',field,message:`The bundled font does not include ${missing.slice(0,6).map(c=>'“'+c+'”').join(', ')}${missing.length>6?' and other characters':''}. Your computer may use a fallback font or show missing-character boxes. Inspect these characters in the exported files, especially before moving this project to another computer. The text has not been changed.`});
  }
 }
 return findings;
}
