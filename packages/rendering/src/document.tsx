import {animateSlide} from '../../motion/src/editable.ts';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import type {Project} from '../../core/src/schema.ts';
import {SlideCanvas} from '../../../apps/studio/src/SlideCanvas.tsx';
export async function documentHTML(p:Project,video=false){
 const {width,height}=p.canvas||{width:1080,height:1350};
 const fonts=await Promise.all(['geist-latin','geist-mono-latin'].map(async name=>(await fs.readFile(path.resolve('public/brand-assets/doro-social/fonts/'+name+'.woff2'))).toString('base64')));
 const displayFont=(await fs.readFile(path.resolve('public/fonts/fraunces-latin-400-italic.woff2'))).toString('base64');
 const css=(await fs.readFile(path.resolve('apps/studio/src/slide.css'),'utf8')).replace("/fonts/fraunces-latin-400-italic.woff2",'data:font/woff2;base64,'+displayFont);
 const markup=p.slides.map((slide,i)=>'<section class="export-page" id="page-'+i+'">'+renderToStaticMarkup(<SlideCanvas slide={slide} brand={p.brand} canvas={p.canvas}/>)+'</section>').join('');
 let at=0;const timeline=p.slides.map((s,i)=>{const start=at;at+=s.duration;return `${i?`tl.fromTo('#page-${i}',{opacity:0},{opacity:1,duration:.2,ease:'none',immediateRender:false},${start});`:`tl.set('#page-${i}',{opacity:1},${start});`}animateSlide(tl,document.getElementById('page-${i}'),${JSON.stringify({motion:s.motion})},${start});${i<p.slides.length-1?`tl.set('#page-${i}',{opacity:0},${at+.2});`:''}`;}).join('\n');
 const gsap=video?await fs.readFile(path.resolve('node_modules/gsap/dist/gsap.min.js'),'utf8'):'';
 const title=p.title.replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]!));
 return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>@font-face{font-family:Geist;src:url(data:font/woff2;base64,${fonts[0]})}@font-face{font-family:'Geist Mono';src:url(data:font/woff2;base64,${fonts[1]})}*{box-sizing:border-box}html,body{margin:0;padding:0;background:${p.brand.background}}${css}.export-page{width:${width}px;height:${height}px;overflow:hidden;break-after:page}.export-page:last-child{break-after:auto}.review-slide{width:100%;height:100%}@page{size:${width}px ${height}px;margin:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}${video?`.export-page{position:absolute;left:0;top:0;opacity:0}.export-page:first-child{opacity:1}html,body{width:${width}px;height:${height}px;overflow:hidden}`:''}</style></head><body><main data-composition-id="main" data-start="0" data-duration="${at}" data-width="${width}" data-height="${height}">${markup}</main>${video?`<script>${gsap}</script><script>const animateSlide=${animateSlide.toString()};const tl=gsap.timeline({paused:true});${timeline}window.__timelines={main:tl};</script>`:''}</body></html>`;
}
