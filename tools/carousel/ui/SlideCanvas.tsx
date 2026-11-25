import React from 'react';
import type {Project} from '../core/src/schema.ts';
type Slide=Project['slides'][number];
function Cup({x,big=false,iced=false}:{x:number,big?:boolean,iced?:boolean}){
 return <g transform={'translate('+x+' 93) scale('+(big?1.25:.85)+')'}>
 <ellipse cx="0" cy="51" rx="63" ry="7" fill="currentColor" opacity=".13"/>
 <path d="M34 -18C84 -42 83 40 37 24" fill="none" stroke="var(--slide-accent)" strokeWidth="9"/>
 <path d="M-43 -27H43L36 30Q0 64 -36 30Z" fill="var(--slide-accent)"/>
 <ellipse cy="-27" rx="43" ry="10" fill="currentColor"/><ellipse cy="-28" rx="35" ry="7" fill="var(--slide-bg)" opacity=".5"/>
 <path d="M-33 -11L-29 20Q-26 32 -15 35" fill="none" stroke="var(--slide-bg)" strokeWidth="3" opacity=".5"/>
 {iced&&[-18,2,19].map((v,i)=><rect key={v} x={v-8} y={-34+i%2*4} width="15" height="12" rx="3" fill="var(--slide-bg)" opacity=".85"/>)}
 </g>
}
export function SlideCanvas({slide,brand,canvas={width:1080,height:1350},guides=false}:{slide:Slide;brand:Project['brand'];canvas?:{width:number;height:number};guides?:boolean}){
 brand={...brand,...slide.colors};
 return <div className={'review-slide brand-'+(brand.typography||'editorial')+' layout-'+(slide.layout||'editorial')+' '+(canvas.width>canvas.height?'landscape ':canvas.width===canvas.height?'square ':'')+(guides?'guides ':'')+(slide.photo||slide.visual&&slide.visual!=='none'?'illustrated':'')} style={{'--heading-scale':slide.appearance?.headingScale??1,'--body-scale':slide.appearance?.bodyScale??1,textAlign:slide.appearance?.align??'left','--canvas-ratio':canvas.width+'/'+canvas.height,'--slide-bg':brand.background,'--slide-accent':brand.accent,background:brand.background,color:brand.text} as React.CSSProperties}>
 <div className="review-brand" data-field="brand">{brand.logo&&<img className="brand-logo" src={brand.logo.src} alt={brand.logo.alt||brand.name}/>}<span>{brand.name}</span></div><div className="review-label" data-field="eyebrow">{slide.eyebrow}</div><h2 data-field="headline">{slide.motion==='headline-storm'?slide.headline.split(/(\s+)/u).map((word,i)=>/\s/u.test(word)?word:<span className="motion-word" key={i}>{word}</span>):slide.headline}</h2>
 {slide.photo&&<div className="slide-photo" data-field="photo"><img src={slide.photo.src} alt={slide.photo.alt} style={{objectFit:slide.photo.fit,objectPosition:slide.photo.x+'% '+slide.photo.y+'%'}}/></div>}
 {!slide.photo&&slide.visual&&slide.visual!=='none'&&<svg className="coffee-illustration" data-field="illustration" viewBox="0 0 440 180" aria-label={slide.visual==='coffee-pair'?'A small espresso beside a larger Americano':slide.visual==='iced-americano'?'An iced Americano':slide.visual==='espresso'?'An espresso cup':'An Americano cup'} role="img">
 {slide.visual==='coffee-pair'?<><Cup x={125}/><Cup x={310} big/></>:<Cup x={220} big={slide.visual!=='espresso'} iced={slide.visual==='iced-americano'}/>}
 </svg>}
 {slide.layout==='checklist'?<ul className="review-body checklist-body" data-field="body">{slide.body.split('\n').filter(line=>line.trim()).map((line,i)=><li key={i}>{line}</li>)}</ul>:slide.layout==='comparison'?<div className="review-body comparison-body" data-field="body">{slide.body.split(/\n\s*\n/).filter(block=>block.trim()).map((block,i)=>{const [label,...lines]=block.split('\n');return <section key={i}><strong>{label}</strong>{lines.length>0&&<span>{lines.join('\n')}</span>}</section>})}</div>:<p className="review-body" data-field="body">{slide.body}</p>}<div className="review-rule"/></div>;
}
