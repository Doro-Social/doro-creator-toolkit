import {editableMotions} from '../../motion/src/editable.ts';
import React,{useEffect,useRef,useState} from 'react';
import type {Project,Batch} from '../../core/src/schema.ts';
import {layouts} from '../../core/src/layouts.ts';
import {canvasPresets} from '../../core/src/canvas.ts';
import {SlideCanvas} from '../SlideCanvas';
import {SlidePlayback} from '../SlidePlayback';
import {AppearanceControls} from '../AppearanceControls';
import {ImageControls} from '../ImageControls';
import type {UseBrandAsset} from '../BrandAssetLibrary';
import {BrandKits} from '../BrandKits';
import {SequenceMotion} from '../SequenceMotion';
import {SequenceReview} from '../SequenceReview';
import {ReviewPanel} from '../ReviewPanel';
import {ExportPanel} from '../ExportPanel';
import {PostDetails} from '../PostDetails';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/material-symbols-outlined/400.css';
import styles from './CalmEditor.module.css';
function Icon({name}:{name:string}){return <span className={styles.icon} aria-hidden="true">{name}</span>}
type Panel='none'|'brief'|'post'|'exports'|'sequence'|'project';
type Props={onUseAsset:UseBrandAsset;project:Project;selected:number;dirty:boolean;busy:boolean;connection:string;panel:Panel;initialReview:boolean;alerts:React.ReactNode;onPanel:(p:Panel)=>void;onSelect:(i:number)=>void;onChange:(p:Project)=>void;onBusy:(b:boolean)=>void;onNavigate:(p:string)=>void;onSave:()=>Promise<void>;onAgent:()=>Promise<void>;onAdd:()=>Promise<void>;onCommands:(c:Batch['commands'],selection?:number)=>Promise<void>;onHistory:(d:'undo'|'redo')=>Promise<void>;onDuplicate:()=>Promise<void>;onArchive:()=>Promise<void>;onVariant:(w:number,h:number)=>Promise<void>;onNotice:(s:string)=>void};
function Sheet({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{ref.current?.showModal();},[]);return <dialog ref={ref} className={`${styles.sheet} studio-sheet`} onCancel={onClose} aria-label={title}><div className={styles.sheetHead}><h2>{title}</h2><button onClick={onClose} aria-label="Close panel">✕</button></div><div className={styles.sheetBody}>{children}</div></dialog>}
export function CalmEditor(p:Props){
 const {project,selected,dirty,busy}=p,slide=project.slides[selected],canvas=project.canvas??{width:1080,height:1350};
 const [tab,setTab]=useState<'content'|'style'|'review'>(p.initialReview?'review':'content');
 const [guides,setGuides]=useState(false),[zoom,setZoom]=useState(100),[fitWidth,setFitWidth]=useState(420),[dragged,setDragged]=useState<string|null>(null);
 const [customWidth,setCustomWidth]=useState(canvas.width),[customHeight,setCustomHeight]=useState(canvas.height);
 const [playerSlot,setPlayerSlot]=useState<HTMLDivElement|null>(null);
 const stage=useRef<HTMLDivElement>(null);
 const inspector=useRef<HTMLElement>(null);const [reviewTarget,setReviewTarget]=useState<string|null>(null);
 function editFinding(index:number,field='headline'){p.onSelect(index);p.onPanel('none');setTab(['brand.name','colors','duration','motion'].includes(field)?'style':'content');setReviewTarget(field);}
 useEffect(()=>{
  if(!reviewTarget)return;
  const labels:Record<string,string>={assets:'Saved brand kit',headline:'Heading',eyebrow:'Short label',body:'Body',motion:'Motion treatment',duration:'Duration in seconds',colors:'Slide text','brand.name':'Business name','photo.alt':'Image description',photo:'Photo framing',illustration:'Illustration'};
  const label=labels[reviewTarget]||'Heading';const input=inspector.current?.querySelector<HTMLElement>('[aria-label="'+label+'"]');
  if(input){let ancestor=input.parentElement;while(ancestor&&ancestor!==inspector.current){if(ancestor instanceof HTMLDetailsElement)ancestor.open=true;ancestor=ancestor.parentElement;}input.focus();input.scrollIntoView({block:'nearest'});}
  setReviewTarget(null);
 },[reviewTarget,tab,selected]);
 useEffect(()=>{if(p.initialReview)setTab('review');},[p.initialReview]);
 useEffect(()=>{const el=stage.current;if(!el)return;const observer=new ResizeObserver(()=>setFitWidth(Math.max(160,Math.min(430,el.clientWidth-48,(el.clientHeight-48)*canvas.width/canvas.height))));observer.observe(el);return()=>observer.disconnect();},[canvas.width,canvas.height]);
 function patch(key:string,value:unknown){p.onChange({...project,slides:project.slides.map((s,i)=>i===selected?{...s,[key]:value}:s)});}
 async function copyLink(){const link=location.origin+'/?project='+project.id+'&slide='+slide.id;try{await navigator.clipboard.writeText(link);p.onNotice('Slide link copied. It opens in this local app.');}catch{p.onNotice(link);}}
 function reorder(id:string,target:string){if(dirty||busy||id===target)return;const order=project.slides.map(s=>s.id);const destination=order.indexOf(target);order.splice(order.indexOf(id),1);order.splice(destination,0,id);void p.onCommands([{type:'reorder',slideIds:order}],order.indexOf(slide.id));}
 const layoutName=layouts.find(l=>l.id===(slide.layout||'editorial'))?.name;
 return <div className={styles.studio}>
 <div className={styles.header}>
  <button className={styles.wordmark} onClick={()=>p.onNavigate('projects')} aria-label="All projects"><span className={styles.logo}><Icon name="layers"/></span><span>Doro <small>CREATOR TOOLKIT</small></span></button>
  <input className={styles.title} aria-label="Project title" maxLength={120} value={project.title} disabled={busy} onChange={e=>p.onChange({...project,title:e.target.value})}/>
  <span className={styles.status} role="status"><i data-offline={p.connection==='offline'}/>{p.connection==='offline'?'Local app offline':busy?'Working…':dirty?'Unsaved changes':'Saved locally'}</span>
  <button className={styles.format} onClick={()=>p.onPanel('project')} title="Canvas size and size variants"><Icon name="aspect_ratio"/>{canvas.width} × {canvas.height}<Icon name="expand_more"/></button>
  <div className={styles.headerActions}><button onClick={()=>p.onPanel('sequence')}><Icon name="view_carousel"/>Review all slides</button><button disabled={dirty||busy} onClick={()=>void p.onAgent()} title={dirty?'Save changes before asking your agent':undefined} aria-label="Ask my agent ↗" className={styles.agent}><Icon name="smart_toy"/>Ask my agent</button><button className={styles.save} disabled={!dirty||busy} onClick={()=>void p.onSave()}><Icon name="save"/>Save changes</button><button className={styles.export} onClick={()=>p.onPanel('exports')} aria-label="Export ↗"><Icon name="ios_share"/>Export carousel</button></div>
 </div>
 {p.alerts&&<div className={styles.alerts}>{p.alerts}</div>}
 <div className={styles.workspace}>
  <aside className={styles.rail}>
   <nav aria-label="Main navigation" className={styles.nav}>{[['projects','Projects','folder_open'],['templates','Slide templates','dashboard_customize'],['animations','Animations','motion_photos_on'],['settings','Your agent','smart_toy']].map(([id,label,icon])=><button key={id} disabled={busy} onClick={()=>p.onNavigate(id)}><Icon name={icon}/>{label}</button>)}<button aria-current="page"><Icon name="edit_note"/>Carousel editor <i/></button><button onClick={()=>p.onPanel('sequence')}><Icon name="rate_review"/>Review &amp; QA</button><button onClick={()=>p.onPanel('exports')}><Icon name="send"/>Export hub</button></nav>
   <div className={styles.railHeading}><span>SLIDES ({project.slides.length.toString().padStart(2,'0')})</span><span>{canvas.width} × {canvas.height}</span></div>
   <div className={styles.filmstrip} aria-label="Slide sequence">{project.slides.map((s,i)=><button key={s.id} className={`${styles.slideCard} slide-tab ${i===selected?styles.active:''}`} aria-label={`Slide ${i+1}: ${s.headline}`} aria-pressed={i===selected} disabled={busy} draggable={!dirty&&!busy} onDragStart={e=>{setDragged(s.id);e.dataTransfer.setData('text/plain',s.id);}} onDragEnd={()=>setDragged(null)} onDragOver={e=>{if(!dirty&&!busy)e.preventDefault();}} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain')||dragged;if(id&&project.slides.some(slide=>slide.id===id))reorder(id,s.id);setDragged(null);}} onClick={()=>p.onSelect(i)}><Icon name="drag_indicator"/><span className={styles.number}>{String(i+1).padStart(2,'0')}</span><div className={styles.thumbnail} aria-hidden="true"><SlideCanvas slide={s} brand={project.brand} canvas={canvas}/></div><span className={styles.slideMeta}><strong>{s.headline}</strong><small>{layouts.find(l=>l.id===(s.layout||'editorial'))?.name} · {s.duration}s</small></span></button>)}</div>
   <div className={styles.railActions}><button disabled={dirty||busy} title={dirty?'Save changes before adding a slide':undefined} onClick={()=>void p.onAdd()}><Icon name="add"/>Add slide</button><div className={styles.row}><button disabled={dirty||busy} onClick={()=>void p.onHistory('undo')}>Undo</button><button disabled={dirty||busy} onClick={()=>void p.onHistory('redo')}>Redo</button></div><button onClick={()=>p.onPanel('project')}>Project options ···</button></div>
   <button className={styles.brandNote} onClick={()=>{setTab('style');setReviewTarget('assets');}}><Icon name="palette"/><span><strong>{project.brand.name}</strong><small>Brand &amp; assets</small></span></button>
  </aside>
  <section className={styles.stageColumn} aria-label="Slide preview">
   <div className={styles.stageHeading}><span>Slide {selected+1} of {project.slides.length} <small>· {layoutName}</small></span><label data-active={guides}><Icon name="grid_goldenratio"/><input type="checkbox" checked={guides} onChange={e=>setGuides(e.target.checked)}/> Safe guides: {guides?'On':'Off'}</label></div>
   <div className={styles.stage} ref={stage}><div className={styles.canvasFrame} style={{width:fitWidth*zoom/100}}><SlidePlayback project={project} selected={selected} guides={guides} controlsTarget={playerSlot}/></div></div>
   <div className={styles.stageFooter}><div className={styles.zoom}><button aria-label="Zoom out" disabled={zoom<=50} onClick={()=>setZoom(Math.max(50,zoom-25))}>−</button><span>{zoom}%</span><button aria-label="Zoom in" disabled={zoom>=200} onClick={()=>setZoom(Math.min(200,zoom+25))}>＋</button><button onClick={()=>setZoom(100)}>Fit</button></div><span>{canvas.width} × {canvas.height} px</span><button className={styles.copyLink} aria-label="Copy slide link" title="Copy slide link" disabled={dirty||busy} onClick={()=>void copyLink()}><Icon name="link"/></button><div className={styles.player} ref={setPlayerSlot}/></div>
  </section>
  <section ref={inspector} className={styles.inspector} aria-label="Slide inspector">
   <div className={styles.tabs} role="tablist" aria-label="Inspector">{(['content','style','review'] as const).map(t=><button role="tab" id={'tab-'+t} aria-controls={'panel-'+t} aria-selected={tab===t} tabIndex={tab===t?0:-1} key={t} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=['content','style','review'] as const;const next=e.key==='Home'?0:e.key==='End'?2:(tabs.indexOf(t)+(e.key==='ArrowRight'?1:2))%3;setTab(tabs[next]);document.getElementById('tab-'+tabs[next])?.focus();}}} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
   <div className={styles.inspectorBody} role="tabpanel" id={'panel-'+tab} aria-labelledby={'tab-'+tab}>
   {tab==='content'&&<fieldset disabled={busy}>
    <span className={styles.label}>LAYOUT BLUEPRINT</span><div className={styles.layouts}>{layouts.map(l=><button key={l.id} aria-pressed={(slide.layout||'editorial')===l.id} onClick={()=>patch('layout',l.id)}><Icon name={l.id==='comparison'?'compare_arrows':l.id==='checklist'?'checklist':l.id==='statement'?'title':l.id==='spotlight'?'photo':l.id==='cta'?'ads_click':'format_quote'}/>{l.name}</button>)}</div>
    <p className={styles.hint}>{layouts.find(l=>l.id===(slide.layout||'editorial'))?.bodyHint}</p>
    <label>Short label <small>{slide.eyebrow.length}/80</small><input aria-label="Short label" maxLength={80} value={slide.eyebrow} onChange={e=>patch('eyebrow',e.target.value)}/></label>
    <label>Heading <small>{slide.headline.length}/160</small><textarea aria-label="Heading" maxLength={160} value={slide.headline} onChange={e=>patch('headline',e.target.value)}/></label>
    <label>{slide.layout==='comparison'?'Comparison content':slide.layout==='checklist'?'Checklist items':'Body'} <small>{slide.body.length}/650</small><textarea aria-label="Body" rows={7} maxLength={650} value={slide.body} onChange={e=>patch('body',e.target.value)}/></label>
    <label>Illustration<select aria-label="Illustration" disabled={!!slide.photo} value={slide.visual||'none'} onChange={e=>patch('visual',e.target.value)}>{[['none','No illustration'],['coffee-pair','Espresso and Americano'],['espresso','Espresso'],['americano','Americano'],['iced-americano','Iced Americano']].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <ImageControls key={slide.id} photo={slide.photo} logo={project.brand.logo} onBusy={p.onBusy} onPhoto={value=>patch('photo',value)} onLogo={logo=>p.onChange({...project,brand:{...project.brand,logo}})}/>
   </fieldset>}
   {tab==='style'&&<fieldset disabled={busy}>
    <span className={styles.label}>SLIDE APPEARANCE</span><AppearanceControls slide={slide} brand={project.brand} onChange={patch}/>
    <label>Motion treatment<select aria-label="Motion treatment" value={slide.motion} onChange={e=>patch('motion',e.target.value)}>{editableMotions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><p>{editableMotions.find(m=>m.id===slide.motion)?.guidance}</p>
    <label>Duration in seconds<input aria-label="Duration in seconds" type="number" min={2} max={20} value={slide.duration} onChange={e=>patch('duration',Number(e.target.value))}/></label>
    <SequenceMotion project={project} disabled={dirty||busy} onApply={p.onCommands}/>
    <details><summary>Project branding</summary><BrandKits canApply={!dirty&&!busy} onUse={p.onUseAsset} brand={project.brand} onApply={brand=>p.onChange({...project,brand})}/><label>Typography<select aria-label="Typography" value={project.brand.typography||'editorial'} onChange={e=>p.onChange({...project,brand:{...project.brand,typography:e.target.value as 'editorial'|'modern'}})}><option value="editorial">Editorial · Fraunces + Geist</option><option value="modern">Modern · Geist</option></select></label><label>Business name<input aria-label="Business name" maxLength={80} value={project.brand.name} onChange={e=>p.onChange({...project,brand:{...project.brand,name:e.target.value}})}/></label>{(['background','text','accent'] as const).map(key=><label key={key}>Brand {key}<input aria-label={'Brand '+key} type="color" value={project.brand[key]} onChange={e=>p.onChange({...project,brand:{...project.brand,[key]:e.target.value}})}/></label>)}</details>
   </fieldset>}
   {tab==='review'&&<><ReviewPanel project={project} dirty={dirty} busy={busy} onEdit={editFinding} onApply={p.onCommands}/><button onClick={()=>p.onPanel('sequence')}><Icon name="view_carousel"/>Review all slides</button></>}
   </div>
   <div className={styles.inspectorFooter}><div className={styles.row}><button aria-label="Move slide up" disabled={dirty||busy||selected===0} onClick={()=>reorder(slide.id,project.slides[selected-1].id)}>↑</button><button aria-label="Move slide down" disabled={dirty||busy||selected===project.slides.length-1} onClick={()=>reorder(slide.id,project.slides[selected+1].id)}>↓</button><button disabled={dirty||busy} onClick={()=>void p.onCommands([{type:'duplicateSlide',slideId:slide.id}])}>Duplicate slide</button><button disabled={dirty||busy||project.slides.length===1} onClick={()=>void p.onCommands([{type:'removeSlide',slideId:slide.id}])}>Remove</button></div><p>{dirty?'Save your edits to enable slide actions.':'Drag saved slides to reorder, or use the arrows.'}</p></div>
  </section>
 </div>
 {p.panel!=='none'&&<Sheet title={{brief:'Creative brief',post:'Post details',exports:'Export carousel',sequence:'Review all slides',project:'Project options'}[p.panel]} onClose={()=>p.onPanel('none')}>
  {p.panel==='exports'&&<ExportPanel project={project} dirty={dirty} saving={busy} onSave={p.onSave} onReview={()=>p.onPanel('sequence')} onPostDetails={()=>p.onPanel('post')}/>}
  {p.panel==='sequence'&&<SequenceReview project={project} dirty={dirty} busy={busy} onApply={p.onCommands} onEdit={editFinding}/>}
  {p.panel==='brief'&&<><p>Context for you and your agent: audience, purpose, business, next action and intended output.</p><label>Creative brief<textarea aria-label="Creative brief" rows={10} maxLength={2000} value={project.brief} disabled={busy} onChange={e=>p.onChange({...project,brief:e.target.value})}/></label><p>{project.brief.length} / 2000 characters. Included in project backups.</p><button disabled={!dirty||busy} onClick={()=>void p.onSave()}><Icon name="save"/>Save changes</button></>}
  {p.panel==='post'&&<><PostDetails value={project.publishing} disabled={busy} onChange={publishing=>p.onChange({...project,publishing})}/><button disabled={!dirty||busy} onClick={()=>void p.onSave()}><Icon name="save"/>Save changes</button></>}
  {p.panel==='project'&&<>
   <div className={styles.optionGrid}><button onClick={()=>p.onPanel('brief')}>Creative brief</button><button onClick={()=>p.onPanel('post')}>Post details</button><button disabled={dirty||busy} onClick={()=>void p.onDuplicate()}>Duplicate project</button><button disabled={dirty||busy} onClick={()=>void p.onArchive()}>Move to trash</button></div>
   <h3>Create a size variant</h3><p>A separate copy preserves your original. Review every slide in the new size.</p><label>New size variant<select aria-label="New size variant" value="" disabled={dirty||busy} onChange={e=>{const size=canvasPresets[Number(e.target.value)];void p.onVariant(size.width,size.height);}}><option value="">Choose size…</option>{canvasPresets.map((size,i)=><option key={size.name} value={i}>{size.name} · {size.width}×{size.height}</option>)}</select></label>
   <details><summary>Custom size</summary><label>Width<input aria-label="Custom width" type="number" min={320} max={4096} value={customWidth} onChange={e=>setCustomWidth(Number(e.target.value))}/></label><label>Height<input aria-label="Custom height" type="number" min={320} max={4096} value={customHeight} onChange={e=>setCustomHeight(Number(e.target.value))}/></label><button disabled={dirty||busy||![customWidth,customHeight].every(n=>Number.isInteger(n)&&n>=320&&n<=4096)} onClick={()=>void p.onVariant(customWidth,customHeight)}>Create size variant</button></details>
   <h3>Back up project</h3><p>Includes saved slides, embedded photos, logo, brief, captions and internal tags. Original media, history and credentials are excluded.</p>{dirty?<p>Save changes before downloading your latest work.</p>:<div className={styles.row}><a href={'/api/projects/'+project.id+'/bundle'} download>Download project ZIP</a><a href={'/api/projects/'+project.id+'/download'} download>Download project JSON</a></div>}
  </>}
 </Sheet>}
 </div>
}
