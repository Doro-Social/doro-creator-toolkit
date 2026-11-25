export const motionIds=['rise','fade','snap-zoom','digital-zoom','headline-storm','checklist-pop'] as const;
export type MotionId=typeof motionIds[number];
export const motions=[
{id:'rise',name:'Gentle Rise',category:'Entrance',intensity:'Low',summary:'Content rises into place, then stays still.',bestFor:'Teaching, announcements and everyday text slides.',compatibility:'Any text layout',hold:3,from:{opacity:0,y:28},duration:.55,stagger:0,ease:'power2.out',target:'content'},
{id:'fade',name:'Soft Fade',category:'Entrance',intensity:'Low',summary:'A quiet reveal with no camera movement.',bestFor:'Dense explanations and understated brands.',compatibility:'Any text layout',hold:3,from:{opacity:0},duration:.65,stagger:0,ease:'power1.out',target:'content'},
{id:'snap-zoom',name:'Snap Zoom',category:'Emphasis',intensity:'High',summary:'One quick punch-in, then a steady reading hold.',bestFor:'One short, important takeaway.',compatibility:'Short headings; no dense paragraphs',hold:3,from:{scale:.86},duration:.3,stagger:0,ease:'power3.out',target:'content'},
{id:'digital-zoom',name:'Digital Zoom',category:'Emphasis',intensity:'Low',summary:'A controlled, gradual move toward the content.',bestFor:'Giving one detail more attention.',compatibility:'Text layouts with generous margins',hold:3,from:{scale:.92},duration:1.1,stagger:0,ease:'power1.inOut',target:'content'},
{id:'headline-storm',name:'Headline Storm',category:'Typography',intensity:'High',summary:'Short heading fragments converge and settle together.',bestFor:'A concise opening statement.',compatibility:'Short headings with 2 to 8 words',hold:3,from:{opacity:0,y:36,rotation:5},duration:.45,stagger:.09,ease:'power3.out',target:'words'},
{id:'checklist-pop',name:'Checklist Pop',category:'Sequence',intensity:'Medium',summary:'List items arrive one by one with a small overshoot.',bestFor:'Practical checks, steps and short lists.',compatibility:'2 to 5 short items; one per body-text line',hold:3,from:{opacity:0,y:24,scale:.96},duration:.45,stagger:.32,ease:'back.out(1.3)',target:'items'}
] as const;
export function getMotion(id:string){return motions.find(m=>m.id===id)||motions[0];}
export function motionReadingTime(id:string,count=1){const m=getMotion(id);return .1+m.duration+(count-1)*m.stagger+m.hold;}
