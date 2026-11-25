import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1440,height:1000}});await p.goto('http://127.0.0.1:4310/?tab=animations');
const video=p.locator('video').first();await video.scrollIntoViewIfNeeded();
await p.waitForFunction(()=>document.querySelector('video')!.currentTime>.3);
const v=await video.evaluate((el:HTMLVideoElement)=>({duration:el.duration,loop:el.loop,w:el.videoWidth,h:el.videoHeight}));assert.ok(v.loop&&v.duration>=5.9&&v.w/v.h===4/5&&v.w>=648);
await video.evaluate((el:HTMLVideoElement)=>el.currentTime=el.duration-.15);await p.waitForFunction(()=>document.querySelector('video')!.currentTime<1);
await p.screenshot({path:'.artifacts/rill-gallery.png'});console.log('Portrait film decoded, autoplayed and looped.');
}finally{await b.close();}
