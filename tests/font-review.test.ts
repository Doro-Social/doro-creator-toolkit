import {it,expect} from 'vitest';import {newProject} from '../packages/templates/src/index.ts';import {reviewFontCoverage} from '../packages/rendering/src/font-review.ts';
it('accepts supported letters and punctuation without changing the project',async()=>{
 const p=newProject();p.brand.name='Cafe';p.slides[0].eyebrow='COFFEE GUIDE';p.slides[0].headline='Cafe: espresso or Americano?';p.slides[0].body="Choose a drink. It's your choice!\nA longer cup costs $4.";const before=JSON.stringify(p);expect(await reviewFontCoverage(p)).toEqual([]);expect(JSON.stringify(p)).toBe(before);
});
it('identifies unsupported characters with slide, field and revision context',async()=>{
 const p=newProject();p.brand.name='珈琲';p.slides[0].headline='Coffee ☕';p.slides[0].body='中文';const before=JSON.stringify(p);const notes=await reviewFontCoverage(p);expect(notes.some(f=>f.field==='brand.name')).toBe(true);expect(notes.some(f=>f.field==='headline')).toBe(true);expect(notes.some(f=>f.field==='body')).toBe(true);expect(notes.every(f=>f.code==='FONT_FALLBACK'&&f.severity==='warning'&&f.revision===p.revision&&f.slideId===p.slides[0].id)).toBe(true);expect(JSON.stringify(p)).toBe(before);
});
it('normalizes combining accents for checking and ignores layout-only control characters',async()=>{
 const p=newProject();p.brand.name='Cafe';p.slides[0].headline='Cafe\u0301';p.slides[0].body='Line one\nLine two\t\u200d\ufe0f';const decomposed=await reviewFontCoverage(p);p.slides[0].headline='Café';expect(await reviewFontCoverage(p)).toEqual(decomposed);expect(decomposed.filter(f=>f.field==='body')).toHaveLength(0);
});
