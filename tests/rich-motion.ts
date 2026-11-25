import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {documentHTML} from '../packages/rendering/src/document.tsx';import {createProject} from '../packages/templates/src/index.ts';import {editableMotionIds,entranceSeconds} from '../packages/motion/src/editable.ts';
const dir=path.resolve('.artifacts/rich-motion');await fs.mkdir(dir,{recursive:true});const browser=await chromium.launch();
try{
 for(const motion of editableMotionIds){
 const p=createProject({title:'Motion test',outline:[{headline:'Choose your next cup',body:'Choose espresso for a short drink.\nChoose Americano for a longer cup.\nAsk about the shot count.'}]});p.slides[0]={...p.slides[0],motion,layout:'checklist',duration:8};
 for(const canvas of [{width:1080,height:1350},{width:1080,height:1080},{width:1920,height:1080}]){
 p.canvas=canvas;const page=await browser.newPage({viewport:canvas});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent(await documentHTML(p,true));await page.evaluate(()=>document.fonts.ready);
 for(const t of [0,.35,2,7.99,8]){await page.evaluate(t=>{(window as any).__timelines.main.seek(t);},t);assert.equal(await page.locator('#page-0').evaluate(e=>getComputedStyle(e).opacity),'1');if(canvas.height===1350)await page.screenshot({path:path.join(dir,motion+'-'+t+'.png')});}
 const sample=()=>page.locator('h2,.review-body li').evaluateAll(els=>els.map(e=>({opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform,text:e.textContent})));
 await page.evaluate(()=>{(window as any).__timelines.main.seek(.35);});const a=await sample();await page.evaluate(()=>{(window as any).__timelines.main.seek(7).seek(.35);});assert.deepEqual(await sample(),a);
 await page.evaluate(()=>{(window as any).__timelines.main.seek(8);});assert.ok((await sample()).every(e=>e.opacity==='1'));assert.ok(entranceSeconds(p.slides[0])<2);assert.deepEqual(errors,[]);await page.close();
 }
 }
 const p=createProject({title:'Boundary',templateId:'coffee-ordering'});p.slides=p.slides.slice(0,2).map(s=>({...s,duration:3,motion:'rise'}));const page=await browser.newPage();await page.setContent(await documentHTML(p,true));for(const t of [2.99,3,3.1,3.21,6]){await page.evaluate(t=>{(window as any).__timelines.main.seek(t);},t);const op=await page.locator('.export-page').evaluateAll(es=>es.map(e=>Number(getComputedStyle(e).opacity)));assert.ok(op.some(o=>o===1),JSON.stringify({t,op}));}await page.close();console.log('Six treatments x three sizes: seeking, end frames, still holds and boundaries passed.');
}finally{await browser.close();}
