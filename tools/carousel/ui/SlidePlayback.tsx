import {animateSlide,editableMotions} from '../motion/src/editable.ts';
import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import gsap from 'gsap';
import {SlideCanvas} from './SlideCanvas';
import type {Project} from '../core/src/schema.ts';
export function SlidePlayback({project,selected,guides,autoPlay=false,controlsTarget}:{project:Project;selected:number;guides:boolean;autoPlay?:boolean;controlsTarget?:HTMLElement|null}){
 const root=useRef<HTMLDivElement>(null),tl=useRef<gsap.core.Timeline|null>(null);const [playing,setPlaying]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);const slide=project.slides[selected];
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(m.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change)},[]);
 useEffect(()=>{setPlaying(false);const context=gsap.context(()=>{const t=gsap.timeline({paused:true,onComplete:()=>setPlaying(false)});if(root.current)animateSlide(t,root.current,slide);t.to({},{duration:slide.duration},0);t.seek(t.duration());tl.current=t;if(autoPlay&&!reduced){t.restart();setPlaying(true);}},root);return()=>{context.revert();tl.current=null}},[slide,project.canvas,reduced,autoPlay]);
 const button=<button aria-label={playing?'Stop preview':'Play slide'} onClick={()=>{if(playing){tl.current?.pause().seek(tl.current.duration());setPlaying(false);}else{tl.current?.restart();setPlaying(true)}}}>{playing?'Stop preview':'Play slide'}</button>;
 const compact=<><span className="motion-label"><i/>{editableMotions.find(m=>m.id===slide.motion)?.name} · {slide.duration}s</span>{slide.motion!=='none'&&!reduced&&button}{reduced&&<span>Reduced motion</span>}</>;
 return <><div ref={root}><SlideCanvas slide={slide} brand={project.brand} canvas={project.canvas} guides={guides}/></div>{controlsTarget!==undefined?(controlsTarget&&createPortal(compact,controlsTarget)):<div className="preview-note">{slide.motion==='none'?'Still slide':reduced?'Reduced motion: showing the complete still.':button} · {slide.duration}s<br/>{(project.canvas||{width:1080,height:1350}).width} × {(project.canvas||{width:1080,height:1350}).height} px</div>}</>;
}
