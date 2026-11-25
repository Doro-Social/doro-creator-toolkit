import {it,expect} from 'vitest';
import {newProject} from '../templates/src/index.ts';
import {reviewProject,contrastRatio,readingSeconds} from '../core/src/review.ts';
import {applyBatch,projectSchema} from '../core/src/schema.ts';
it('reports contrast and reading time without changing source and applies suggestions through normal history commands',()=>{
 const p=newProject('Review fixture');p.brand.text='#122d32';p.slides[0].duration=2;const before=JSON.stringify(p);const findings=reviewProject(p);expect(JSON.stringify(p)).toBe(before);expect(findings.some(f=>f.code==='TEXT_CONTRAST')).toBe(true);const timing=findings.find(f=>f.code==='READING_TIME')!;expect(timing.projectId).toBe(p.id);expect(timing.revision).toBe(p.revision);const fixed=applyBatch(p,{expectedRevision:p.revision,commands:timing.proposedCommands!,dryRun:false});expect(fixed.slides[0].duration).toBe(readingSeconds(p.slides[0]));expect(()=>applyBatch(fixed,{expectedRevision:p.revision,commands:timing.proposedCommands!,dryRun:false})).toThrow(/changed/);
});
it('respects per-slide colors and never suggests an invalid duration',()=>{
 const p=newProject();p.slides[0].colors={background:'#ffffff',text:'#ffffff',accent:'#ffffff'};p.slides[0].body='word '.repeat(120);expect(reviewProject(p).find(f=>f.code==='READING_TIME')?.proposedCommands).toBeUndefined();expect(reviewProject(p).some(f=>f.code==='TEXT_CONTRAST')).toBe(true);expect(contrastRatio('#ffffff','#000000')).toBeCloseTo(21);expect(contrastRatio('#000000','#000000')).toBe(1);
});
it('retains valid styling through shared commands and rejects invalid sizes and CSS strings',()=>{
 const p=newProject();const styled=applyBatch(p,{expectedRevision:0,commands:[{type:'editSlide',slideId:p.slides[0].id,patch:{appearance:{headingScale:.85,bodyScale:1.1,align:'center'},colors:{background:'#abcdef'}}}],dryRun:false});expect(projectSchema.parse(styled).slides[0].appearance?.align).toBe('center');expect(()=>projectSchema.parse({...p,slides:[{...p.slides[0],appearance:{headingScale:3,bodyScale:1,align:'left'}}]})).toThrow();expect(()=>projectSchema.parse({...p,slides:[{...p.slides[0],colors:{text:'url(https://example.org)'}}]})).toThrow();const reset=applyBatch(styled,{expectedRevision:1,commands:[{type:'editSlide',slideId:p.slides[0].id,patch:{appearance:null,colors:null}}],dryRun:false});expect(reset.slides[0].colors).toBeNull();
});
it('flags fictional branding and remaining sample copy even after rebranding without blocking intentional demos',()=>{
 const p=newProject();p.brand.name='Rill Coffee';p.slides[0].headline='Your Americano';p.slides[0].body='Our fictional Rill Coffee menu has a new option.';
 const before=JSON.stringify(p);let findings=reviewProject(p);expect(findings.some(f=>f.code==='DEMO_BRAND')).toBe(true);expect(findings.some(f=>f.code==='DEMO_COPY'&&f.field==='body')).toBe(true);expect(findings.filter(f=>f.code.startsWith('DEMO_')).every(f=>f.severity==='warning'&&!f.proposedCommands)).toBe(true);expect(JSON.stringify(p)).toBe(before);
 p.brand.name='Actual Cafe';findings=reviewProject(p);expect(findings.some(f=>f.code==='DEMO_BRAND')).toBe(false);expect(findings.some(f=>f.code==='DEMO_COPY')).toBe(true);
 p.slides[0].body='Espresso with cold water and ice.';expect(reviewProject(p).some(f=>f.code.startsWith('DEMO_'))).toBe(false);
});
it('identifies explicit unfinished placeholders without guessing whether real prices or dates are valid',()=>{
 const p=newProject();p.brand.name='Actual Cafe';p.slides[0].headline='[Your headline]';p.slides[0].body='Visit [website] to see the menu.';
 expect(reviewProject(p).filter(f=>f.code==='UNFINISHED_COPY')).toHaveLength(2);
 p.slides[0].headline='Order a coffee';p.slides[0].body='Open November 15. Coffee is $4. Array[0] is code.';
 expect(reviewProject(p).some(f=>f.code==='UNFINISHED_COPY')).toBe(false);
});
it('identifies unchanged starter content and business name',()=>{
 const findings=reviewProject(newProject());expect(findings.some(f=>f.code==='UNFINISHED_BRAND')).toBe(true);expect(findings.filter(f=>f.code==='UNFINISHED_COPY').map(f=>f.field)).toEqual(['headline','body']);
});
