export const layoutIds=['editorial','statement','spotlight','checklist','comparison','cta'] as const;
export const layouts=[
 {id:'editorial',name:'Editorial',purpose:'Teach one idea with a heading, explanation and optional visual.',bodyHint:'Explain one useful idea.'},
 {id:'statement',name:'Statement / cover',purpose:'Open with one clear promise or announcement.',bodyHint:'Support the heading with a short explanation.'},
 {id:'spotlight',name:'Product spotlight',purpose:'Put a product photo or illustration ahead of its explanation.',bodyHint:'Describe the detail that helps someone choose.'},
 {id:'checklist',name:'Checklist / steps',purpose:'Show a short sequence or practical checklist.',bodyHint:'Put each item on its own line. Keep the list short; every line stays visible.'},
 {id:'comparison',name:'Comparison',purpose:'Compare two options using the same criteria.',bodyHint:'Separate two sections with a blank line. The first line of each section is its label; following lines describe it. Extra sections are retained but may need a different layout.'},
 {id:'cta',name:'Call to action',purpose:'Close with one concrete next action and a useful reason.',bodyHint:'Write the action or destination in the body. This becomes a highlighted closing panel.'},
] as const;
