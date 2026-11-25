/** Editable treatments, distinct from the inspiration gallery. */
export const editableMotionIds=['none','rise','fade','snap-zoom','headline-storm','checklist-pop'] as const;
export const editableMotions=[
 {id:'none',name:'None (still)',guidance:'Complete still layout.'},
 {id:'rise',name:'Gentle rise',guidance:'Supporting content rises, then holds.'},
 {id:'fade',name:'Soft fade',guidance:'Supporting content fades, then holds.'},
 {id:'snap-zoom',name:'Snap Zoom',guidance:'One punch-in on artwork, or the heading when no artwork is present. Copy stays readable.'},
 {id:'headline-storm',name:'Headline Storm',guidance:'A short headline converges word by word. Best with 2 to 8 words.'},
 {id:'checklist-pop',name:'Checklist Pop',guidance:'Checklist items arrive in order. Choose the Checklist layout and 2 to 5 short items; other layouts reveal the body together.'}
] as const;
export function entranceSeconds(slide:{motion:string;headline:string;body:string;layout?:string}){
 if(slide.motion==='none')return 0;
 if(slide.motion==='headline-storm')return .7+Math.min(11,slide.headline.trim().split(/\s+/u).length-1)*.07;
 if(slide.motion==='checklist-pop')return .65+Math.min(7,slide.layout==='checklist'?Math.max(0,slide.body.split('\n').filter(s=>s.trim()).length-1):0)*.18;
 return slide.motion==='snap-zoom'?.65:.5;
}
/** Self-contained so the exact same choreography can be embedded in portable HTML. */
export function animateSlide(tl:any,root:HTMLElement,slide:{motion:string},at=0){
 const supporting=Array.from(root.querySelectorAll('.slide-photo,.coffee-illustration,.review-body,.review-rule'));
 if(slide.motion==='rise'||slide.motion==='fade')tl.fromTo(supporting,{opacity:0,y:slide.motion==='rise'?24:0},{opacity:1,y:0,duration:.5,ease:'power2.out',immediateRender:true},at);
 if(slide.motion==='snap-zoom'){
  const media=Array.from(root.querySelectorAll('.slide-photo,.coffee-illustration'));
  tl.fromTo(media.length?media:Array.from(root.querySelectorAll('h2')),{scale:.78,rotation:-2,transformOrigin:'50% 50%'},{scale:1,rotation:0,duration:.65,ease:'back.out(1.15)',immediateRender:true},at);
 }
 if(slide.motion==='headline-storm'){
  Array.from(root.querySelectorAll('.motion-word')).forEach((word,i)=>tl.fromTo(word,{opacity:0,x:i%2?-24:24,y:16,rotation:i%2?4:-4},{opacity:1,x:0,y:0,rotation:0,duration:.7,ease:'power3.out',immediateRender:true},at+Math.min(i,11)*.07));
 }
 if(slide.motion==='checklist-pop'){
  const items=Array.from(root.querySelectorAll('.checklist-body li'));
  (items.length?items:Array.from(root.querySelectorAll('.review-body'))).forEach((item,i)=>tl.fromTo(item,{opacity:0,x:-20,scale:.95,transformOrigin:'0% 50%'},{opacity:1,x:0,scale:1,duration:.65,ease:'back.out(1.2)',immediateRender:true},at+Math.min(i,7)*.18));
 }
 return tl;
}
