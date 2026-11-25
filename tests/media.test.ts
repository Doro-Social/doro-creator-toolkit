import {it,expect} from 'vitest';
import sharp from 'sharp';
import {normalizeImage} from '../packages/media/src/index.ts';
import {projectSchema} from '../packages/core/src/schema.ts';
import {newProject} from '../packages/templates/src/index.ts';
it('normalizes transparent artwork and preserves it in portable project JSON',async()=>{const bytes=await sharp({create:{width:240,height:120,channels:4,background:{r:0,g:120,b:100,alpha:.5}}}).png().toBuffer();const image=await normalizeImage({base64:bytes.toString('base64'),alt:'Test artwork'});expect(image.width).toBe(240);expect(image.height).toBe(120);expect((await sharp(Buffer.from(image.src.split(',')[1],'base64')).metadata()).hasAlpha).toBe(true);const p=newProject();p.brand.logo=image;p.slides[0].photo={...image,fit:'contain',x:50,y:50};expect(projectSchema.parse(JSON.parse(JSON.stringify(p)))).toEqual(p);});
it('rejects invalid files and active SVG input',async()=>{for(const content of ['not an image','<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100"/></svg>'])await expect(normalizeImage({base64:Buffer.from(content).toString('base64'),alt:''})).rejects.toMatchObject({code:'INVALID_IMAGE'});});
it('rejects remote image references in saved projects',()=>{const p=newProject();p.brand.logo={src:'https://example.com/image.png',alt:'',width:100,height:100};expect(projectSchema.safeParse(p).success).toBe(false);});
it('normalizes a simple SVG logo with gradients and transparent edges without retaining SVG',async()=>{
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><defs><linearGradient id="paint"><stop offset="0" stop-color="#123456"/><stop offset="1" stop-color="#abcdef"/></linearGradient></defs><path d="M20 20H180V80H20Z" fill="url(#paint)"/></svg>';
 const image=await normalizeImage({base64:Buffer.from(svg).toString('base64'),alt:'Logo fixture',kind:'logo'});expect(image.src.startsWith('data:image/webp;')).toBe(true);expect(image.width).toBe(2000);expect(image.height).toBe(1000);const meta=await sharp(Buffer.from(image.src.split(',')[1],'base64')).metadata();expect(meta.hasAlpha).toBe(true);
 const p=newProject();p.brand.logo=image;expect(projectSchema.parse(p).brand.logo).toEqual(image);
});
it.each([
 '<script>alert(1)</script>',
 '<image href="https://example.com/logo.png"/>',
 '<image href="file:///etc/passwd"/>',
 '<foreignObject><div>HTML</div></foreignObject>',
 '<path d="M0 0" onclick="alert(1)"/>',
 '<path d="M0 0" style="fill:url(https://example.com/a)"/>',
 '<path d="M0 0" fill="url(https://example.com/a)"/>',
 '<path d="M0 0" fill="url(&#104;ttps://example.com/a)"/>',
 '<use href="#shape"/>',
 '<text x="0" y="20">Convert to paths</text>',
 '<animate attributeName="x"/>',
 '<path d="M0 0" fill="url(#missing)"/>',
 '<?xml-stylesheet href="https://example.com/style.css"?>',
 '<g><path></g>'
])('rejects unsupported SVG before rasterization: %s',async(content)=>{
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">'+content+'</svg>';
 await expect(normalizeImage({base64:Buffer.from(svg).toString('base64'),alt:'',kind:'logo'})).rejects.toMatchObject({code:'UNSUPPORTED_SVG'});
});
it('rejects SVG entities, overly deep trees and malformed XML',async()=>{
 for(const svg of ['<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg>&x;</svg>','<svg>'+('<g>'.repeat(45))+'<path/>'+('</g>'.repeat(45))+'</svg>','not an image'])await expect(normalizeImage({base64:Buffer.from(svg).toString('base64'),alt:'',kind:'logo'})).rejects.toMatchObject({code:'UNSUPPORTED_SVG'});
});
