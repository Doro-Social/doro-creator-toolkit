import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4310/?tab=animations');
 const formats=[['portrait',1080,1350],['square',1080,1080],['tall',1080,1920],['photo',1080,1440],['landscape',1200,628],['wide',1920,1080]] as const;
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const [id,w,h] of formats){
   await page.getByLabel('Preview size').selectOption(id);
   await page.waitForTimeout(100);
   const results=await page.locator('.motion-viewport').evaluateAll(nodes=>nodes.map(n=>{
    const box=n.getBoundingClientRect();
    const content=(n.querySelector('.demo-content,video,.pending-study')??n).getBoundingClientRect();
    const fits=Array.from(n.querySelectorAll('.demo-content>*')).every(el=>{const r=el.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right+.5&&r.top>=box.top&&r.bottom<=box.bottom+.5;});
    return {ratio:box.width/box.height,fits,contentFits:content.height<=box.height};
   }));
   for(const result of results){assert.ok(Math.abs(result.ratio-w/h)<.01,`${width} ${id} ratio`);assert.ok(result.fits&&result.contentFits,`${width} ${id} containment`);}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${id} page overflow`);
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.getByLabel('Preview size').selectOption('portrait');
 await page.screenshot({path:'.artifacts/animation-portrait.png',fullPage:true});
 console.log('All six formats: correct proportions and contained content at desktop and mobile widths.');
}finally{await browser.close();}
