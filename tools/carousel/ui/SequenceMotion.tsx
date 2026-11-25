import {editableMotions} from '../motion/src/editable.ts';
import React,{useState} from 'react';
import type {Project,Batch} from '../core/src/schema.ts';
export function SequenceMotion({project,disabled,onApply}:{project:Project;disabled:boolean;onApply:(commands:Batch['commands'])=>Promise<void>}){
 const [motion,setMotion]=useState<Project['slides'][number]['motion']>('none');
 return <details className="sequence-motion"><summary>Motion for all slides</summary><p>Apply one treatment across this carousel. Keeps text, images, layouts and slide durations. Save current changes first. You can undo this as one edit.</p><label>All-slide motion<select aria-label="All-slide motion" value={motion} onChange={e=>setMotion(e.target.value as typeof motion)}>{editableMotions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><button disabled={disabled||project.slides.every(s=>s.motion===motion)} onClick={()=>void onApply(project.slides.map(s=>({type:'editSlide',slideId:s.id,patch:{motion}})))}>Apply to all {project.slides.length} slides</button></details>;
}
