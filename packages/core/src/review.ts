import {entranceSeconds} from '../../motion/src/editable.ts';
import type {Project,Batch} from './schema.ts';
export type Finding={projectId:string;revision:number;slideId:string;severity:'error'|'warning';code:string;field:string;message:string;proposedCommands?:Batch['commands']};
export const reviewVersion=1;
export function contrastRatio(a:string,b:string){const luminance=(hex:string)=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function readingSeconds(slide:Project['slides'][number]){const words=[slide.eyebrow,slide.headline,slide.body].join(' ').trim().split(/\s+/u).filter(Boolean).length;return Math.ceil(words/3+1+entranceSeconds(slide));}
export function reviewProject(p:Project):Finding[]{
 const out:Finding[]=[];const headings=new Set<string>();
 for(const s of p.slides){const add=(code:string,field:string,message:string,proposedCommands?:Batch['commands'])=>out.push({projectId:p.id,revision:p.revision,slideId:s.id,severity:'warning',code,field,message,...(proposedCommands?{proposedCommands}:{})});const colors={...p.brand,...s.colors};
 if(s.id===p.slides[0].id&&/^your business$/i.test(p.brand.name.trim()))add('UNFINISHED_BRAND','brand.name','Replace the starter business name with your brand before sharing. Text-only branding is fine; a logo is optional.');
 if(s.id===p.slides[0].id&&/\brill\s+coffee\b/i.test(p.brand.name))add('DEMO_BRAND','brand.name','Rill Coffee is the fictional sample business. Replace its name in Style > Brand before using this for your business, or keep it intentionally for a clearly labelled demo.');
 for(const field of ['eyebrow','headline','body'] as const){
  const text=s[field];
  if(/\b(?:rill\s+coffee|fictional|imaginary coffee shop|demo menu)\b/i.test(text))add('DEMO_COPY',field,'This text still refers to the fictional example. Replace the sample business details, or keep them intentionally for a clearly labelled demo.');
  if(/\[(?:your|insert|add|replace|business|brand|company|topic|audience|cta|website|url|offer|price|date|name|link)\b[^\]\n]{0,80}\]|\b(?:lorem ipsum|your (?:business|brand|company) name|insert (?:text|title|headline) here)\b/i.test(text)||['Add your takeaway','Explain one useful idea.','Make something worth sharing.','Give your agent a topic, audience and the useful takeaway you want people to remember.'].includes(text.trim()))add('UNFINISHED_COPY',field,'Replace this placeholder with your own content before sharing. If it is an intentional example, make that clear to the reader.');
 }

 if(s.motion==='headline-storm'&&s.headline.trim().split(/\s+/u).length>8)add('MOTION_FIT','headline','Headline Storm works best with 2 to 8 words. Shorten this heading or choose a quieter treatment.');
 if(s.motion==='checklist-pop'&&s.layout!=='checklist')add('MOTION_FIT','motion','Checklist Pop reveals the body together in this layout. Choose Checklist for separate item arrivals.');
 const textRatio=contrastRatio(colors.text,colors.background);if(textRatio<4.5)add('TEXT_CONTRAST','colors',`Text contrast is ${textRatio.toFixed(2)}:1. Aim for at least 4.5:1 for body text. Adjust text or background colors.`);
 const labelRatio=contrastRatio(colors.accent,colors.background);if(s.eyebrow.trim()&&labelRatio<4.5)add('LABEL_CONTRAST','colors',`Short-label contrast is ${labelRatio.toFixed(2)}:1. Adjust the accent or background color for readability.`);
 const recommended=readingSeconds(s);if(recommended>s.duration)add('READING_TIME','duration',`Allow about ${recommended} seconds for this text in video (a 180 words/minute estimate, not a reading guarantee). ${recommended>20?'Shorten the text or split the slide; the hold limit is 20 seconds.':'Still images and PDFs are read at the viewer’s pace.'}`,recommended<=20?[{type:'editSlide',slideId:s.id,patch:{duration:recommended}}]:undefined);
 if(s.body.length>450)add('DENSE_TEXT','body','This slide has dense body text. Check it at phone size; consider splitting the explanation.');
 if(s.layout==='comparison'&&s.body.split(/\n\s*\n/).filter(b=>b.trim()).length!==2)add('COMPARISON_SECTIONS','body','Use two sections separated by a blank line, one for each option. All entered content is retained.');
 if(s.layout==='checklist'&&s.body.split('\n').filter(l=>l.trim()).length>5)add('LONG_CHECKLIST','body','This checklist has more than five items. Consider splitting it across slides for easier reading.');
 const heading=s.headline.trim().toLocaleLowerCase();if(headings.has(heading))add('REPEATED_HEADING','headline','This heading repeats an earlier slide. Check whether this slide adds a distinct useful point.');headings.add(heading);
 if(s.photo&&!s.photo.alt.trim())add('PHOTO_DESCRIPTION','photo.alt','Add a photo description so an agent can understand what the artwork shows.');
 }
 return out;
}
