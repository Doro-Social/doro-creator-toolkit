import React,{useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {getMotion} from '../motion/src/catalog.ts';
import {gallery} from '../motion/src/gallery.ts';
export const previewFormats=[
 {id:'portrait',label:'Portrait · 4:5',width:1080,height:1350},
 {id:'square',label:'Square · 1:1',width:1080,height:1080},
 {id:'tall',label:'Tall · 9:16',width:1080,height:1920},
 {id:'photo',label:'Portrait · 3:4',width:1080,height:1440},
 {id:'landscape',label:'Landscape · 1.91:1',width:1200,height:628},
 {id:'wide',label:'Widescreen · 16:9',width:1920,height:1080},
] as const;
type PreviewFormat=typeof previewFormats[number];
export function MotionPreview({id,format=previewFormats[0]}:{id:string,format?:PreviewFormat}){
 const viewport=useRef<HTMLDivElement>(null);const [scale,setScale]=useState(0);
 useEffect(()=>{const element=viewport.current!;const observer=new ResizeObserver(()=>setScale(element.clientWidth/format.width));observer.observe(element);setScale(element.clientWidth/format.width);return()=>observer.disconnect();},[format]);
 const stage=useRef<HTMLDivElement>(null),timeline=useRef<gsap.core.Timeline|null>(null);const [playing,setPlaying]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{const m=getMotion(id);const context=gsap.context(()=>{const root=stage.current!;const targets=m.target==='words'?root.querySelectorAll('.demo-word'):m.target==='items'?root.querySelectorAll('.demo-item'):root.querySelector('.demo-content');const t=gsap.timeline({paused:true,repeat:-1});t.fromTo(targets,{...m.from},{opacity:1,y:0,scale:1,rotation:0,duration:m.duration,stagger:m.stagger,ease:m.ease},.1);t.call(()=>{},[],t.duration()+m.hold);timeline.current=t;if(reduced){t.seek(t.duration());setPlaying(false);}else{t.play(0);setPlaying(true);}},stage);return()=>{context.revert();timeline.current=null;};},[id,reduced]);
 useEffect(()=>{if(reduced){timeline.current?.pause().seek(timeline.current.duration());setPlaying(false);}},[reduced]);
 function play(){const t=timeline.current;if(!t)return;if(playing){t.pause();setPlaying(false);}else{setPlaying(true);if(t.time()>0&&t.time()<t.duration())t.play();else t.restart();}}
 return <><div className="motion-viewport" ref={viewport} style={{aspectRatio:`${format.width}/${format.height}`}}><div className="motion-stage" ref={stage} style={{width:format.width,height:format.height,transform:`scale(${scale})`,padding:Math.min(format.width,format.height)*.09,fontSize:Math.min(format.width,format.height)*.045}}><div className="demo-content"><span>MOTION STUDY</span><h3>{id==='headline-storm'?'One clear useful idea.'.split(' ').map((w,i)=><span className="demo-word" key={i}>{w} </span>):id==='checklist-pop'?'Before you share.':'Give the idea room.'}</h3>{id==='checklist-pop'?<ul>{['One clear message','Readable type','Time to take it in'].map(x=><li className="demo-item" key={x}><b>✓</b>{x}</li>)}</ul>:<p>Motion leads the eye.<br/>The message stays readable.</p>}<i/></div></div>{!reduced&&<button className="motion-toggle" onClick={play} aria-label={`${playing?'Pause':'Play'} ${getMotion(id).name}`} title={playing?'Pause animation':'Resume animation'}>{playing?'Ⅱ':'▶'}</button>}</div></>;
}
type Entry=typeof gallery[number];
function Film({entry}:{entry:Entry}){
 const ref=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false),[paused,setPaused]=useState(false),[hidden,setHidden]=useState(document.hidden);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const el=ref.current!;const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.1});observer.observe(el);
 const m=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(m.matches),visibility=()=>setHidden(document.hidden);
 document.addEventListener('visibilitychange',visibility);m.addEventListener('change',change);
 return()=>{observer.disconnect();m.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility)}},[]);
 useEffect(()=>{const v=ref.current!;if(visible&&!hidden&&!paused&&!reduced){void v.play().catch(()=>{});}else v.pause()},[visible,hidden,paused,reduced]);
 const media=entry.media!;
 return <><video ref={ref} poster={media.poster} preload="none" muted loop playsInline aria-label={media.note}><source src={media.src.replace(/\.mp4$/,'.webm')} type="video/webm"/><source src={media.src} type="video/mp4"/></video>{reduced?<img className="film-still" src={media.poster} alt={media.note}/>:<button className="motion-toggle" aria-label={(paused?'Play ':'Pause ')+entry.name} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button>}</>;
}
export function MotionLibrary(){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('all');
 const categories=[...new Set(gallery.map(s=>s.category))];
 const [filter,setFilter]=useState('All styles'),[format,setFormat]=useState<PreviewFormat>(previewFormats[0]);
 const visible=gallery.filter(s=>(filter==='All styles'||(filter==='Rill Coffee'?s.status==='coffee-preview':filter==='Pending'?s.status==='pending':['basic-preview','doro-preview'].includes(s.status)))&&(category==='all'||s.category===category)&&[s.id,s.name,s.category,s.summary,s.media?.note??''].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const counts={coffee:gallery.filter(x=>x.status==='coffee-preview').length,pending:gallery.filter(x=>x.status==='pending').length};
 return <section className="catalog-page motion-library"><div className="eyebrow">ANIMATION LIBRARY</div><h1>Explore what moves you.</h1><p>{gallery.length} styles. Explore {counts.coffee} counter cards from Rill Coffee, a fictional espresso bar. Open a name for the creative direction.</p>
 <div className="motion-controls"><div className="motion-format"><label htmlFor="preview-format">Preview size</label><select id="preview-format" value={format.id} onChange={e=>setFormat(previewFormats.find(f=>f.id===e.target.value)!)}>{previewFormats.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</select><span>{format.width} × {format.height} px{format.id!=='portrait'?' · Films retain their original framing':''}</span></div>
 <div className="library-search"><label>Search animations<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try liquid, comparison or coffee…"/></label><label>Motion category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label><span role="status">{visible.length} of {gallery.length} styles</span>{(query||category!=='all')&&<button onClick={()=>{setQuery('');setCategory('all');setFilter('All styles');}}>Reset animation filters</button>}</div>
 </div>{counts.coffee>0&&counts.coffee<gallery.length&&<div className="motion-filters">{['All styles',...(counts.coffee?['Rill Coffee']:[]),...(gallery.some(s=>['basic-preview','doro-preview'].includes(s.status))?['Other previews']:[]),...(counts.pending?['Pending']:[])].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div>}
 {!visible.length&&<p>No animation studies match. Try another keyword or reset the filters.</p>}
 <div className="catalog-grid motion-grid">{visible.map(s=><article className="motion-card" key={s.id} data-style={s.id}>
 {s.status==='basic-preview'?<MotionPreview id={s.id} format={format}/>:<div className="motion-viewport film-stage" style={{aspectRatio:format.width+'/'+format.height}}>{s.media?<Film entry={s}/>:<div className="pending-study"><span>STUDY PENDING</span><strong>{s.name}</strong><p>{s.summary}</p></div>}</div>}
 <details className="catalog-detail motion-info"><summary><h2>{s.name}</h2><small>{s.status==='coffee-preview'?'Rill Coffee':s.status==='doro-preview'?'Doro study':s.status==='pending'?'Pending':'Basic study'}</small></summary><div className="motion-info-body"><span className="eyebrow">{s.category}</span><p>{s.media?.note??s.summary}</p><p>{s.cautions}</p>{s.editableTreatment&&<p><strong>Available in your carousel</strong><br/>Choose {s.name} in Style → Motion treatment. {s.editableTreatment.guidance} The gallery film is a custom example, not an exact preset.</p>}</div></details></article>)}</div></section>;
}
