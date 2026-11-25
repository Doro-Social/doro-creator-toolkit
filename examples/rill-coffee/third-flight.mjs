// Rill's autumn issue, brew notebook and dispatch slip.
export function thirdFlight({txt,ital,lab,line,header,foot,gradient,circle,ellipse,rect,each}){
 const path=(d,fill,attr='')=>`<path d="${d}" fill="${fill}" ${attr}/>`;
 const stroke=(d,c,w,attr='')=>path(d,'none',`stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${attr}`);
 const coverDefs=gradient('cup',[[0,'#a64732'],[.17,'#ed875a'],[.52,'#f2a174'],[.8,'#d46543'],[1,'#963b35']])+
 '<clipPath id="mast"><rect x="30" y="70" width="480" height="112"/></clipPath>';
 const pear=(x,y,r)=>`<g transform="translate(${x} ${y}) rotate(${r})">${path('M-7 -44Q10 -51 15 -25C19 -6 43 5 38 26C32 57 -38 57 -40 24C-42 3 -16 -7 -14 -26Q-13 -37 -7 -44Z','#d6cc65')}${stroke('M-2 -44Q-4 -57 6 -66','#796644',4)}${path('M1 -52Q-21 -78 -34 -63Q-22 -44 1 -52Z','#91a17c')}${each(25,i=>circle(-19+(i*37)%43,3+(i*7)%29,1,'#a3a153'))}</g>`;
 const cover=rect(0,0,540,675,'#492936')+header('#fce5bb','AUTUMN MENU')+
 `<g clip-path="url(#mast)"><g id="masthead">${ital(33,159,'Orchard',113,'#ffe8bf')}</g></g>`+
 lab(40,192,'THE PEAR &amp; CARDAMOM LATTE','#f8c69c')+
 `<g id="stilllife">${ellipse(270,457,130,17,'#302331')}${pear(159,373,-25)}${stroke('M333 316C421 272 422 410 336 405','#d47355',17)}${path('M186 307Q185 428 240 449Q288 466 328 428Q354 383 351 307Z','url(#cup)')}${ellipse(268,307,83,23,'#ffd5a6')}${ellipse(268,307,74,17,'#a86a47')}${each(4,i=>stroke('M'+(231+i*8)+' 308 Q250 '+(288+i*3)+' 267 306 Q285 '+(291+i*3)+' '+(299-i*7)+' 303 Q286 321 267 317Z','#ffe8bc',1.6))}${pear(354,427,19)}</g>`+
 `<g id="coverline">${line(40,500,499,500,'#b57b72')}${lab(40,521,'FROM THE RILL RECIPE FILE','#fbc8a7')}</g>`+
 foot('#ffe7bd','IN THE CUP','Pear syrup and a pinch of cardamom','meet espresso and steamed milk.');
 const cTL=`tl.fromTo('#masthead',{y:115},{y:0,duration:.85,ease:'power3.out'},.05).fromTo('#stilllife',{scale:.81,y:39,rotation:-5,svgOrigin:'267 400'},{scale:1,y:0,rotation:0,duration:1.2,ease:'power2.out'},.3).fromTo('#coverline',{x:-30,opacity:0},{x:0,opacity:1,duration:.6},1.1);`;
 const ink='#1e4947',teal='#08786f',grid='#becab2';
 const points=[[157,395,50],[286,324,150],[432,252,250]];
 const chartPath='M72 432C96 432 119 395 157 395H181C205 395 247 324 286 324H309C340 324 393 252 432 252H463';
 const chart=rect(0,0,540,675,'#f0ebcf')+header(ink,'BREW NOTEBOOK')+ital(37,139,'Pour to the line',55,ink)+lab(40,170,'RILL FILTER RECIPE   /   15 G COFFEE',ink)+
 lab(50,213,'TOTAL WATER ON SCALE',ink)+each(6,i=>line(70,432-i*36,473,432-i*36,grid,1))+
 each(21,i=>line(70+i*20,247,70+i*20,436,grid,.6))+
 stroke(chartPath,teal,5,'id="trace" pathLength="100" stroke-dasharray="100"')+
 points.map(([x,y,g],i)=>`<g id="dot${i}">${circle(x,y,7,'#f0ebcf')}${circle(x,y,4,teal)}${txt(x,y-15,g+' g',23,ink,'text-anchor="middle" font-weight="bold"')}</g>${txt(x,467,['Bloom','Pour','Finish'][i],21,ink,'text-anchor="middle"')}`).join('')+
 foot(ink,'KEEP THE SCALE RUNNING','Wet the grounds with 50 g of water.','Pour to 150 g, then to 250 g total.');
 const chartTL=`tl.fromTo('#trace',{strokeDashoffset:100},{strokeDashoffset:0,duration:2.65,ease:'none'},.22);`+each(3,i=>`tl.fromTo('#dot${i}',{opacity:0},{opacity:1,duration:.18},${[.77,1.68,2.65][i]});`);
 const plum='#3d3242',sheet='#fcf3d9';
 const tick=(i,y)=>`<g>${rect(82,y-19,24,24,'none').replace('fill="none"','fill="none" stroke="#74645c" stroke-width="2"')}${stroke('M86 '+(y-6)+'l6 6 14 -17','#367453',4,`id="tick${i}" pathLength="1" stroke-dasharray="1"`)}${txt(124,y+1,['House blend','Whole bean','250 g bag'][i],25,plum)}${line(80,y+18,458,y+18,'#cec1a6')}</g>`;
 const tally=rect(0,0,540,675,'#e4af77')+header(plum,'DISPATCH DESK')+ital(37,138,'Bag check',62,plum)+lab(40,169,'PACKING A WHOLE-BEAN PICKUP',plum)+
 path('M70 205H473V475L462 483L451 475L440 483L429 475L418 483L407 475L396 483L385 475L374 483L363 475L352 483L341 475L330 483L319 475L308 483L297 475L286 483L275 475L264 483L253 475L242 483L231 475L220 483L209 475L198 483L187 475L176 483L165 475L154 483L143 475L132 483L121 475L110 483L99 475L88 483L70 474Z','#b98358')+
 rect(62,198,405,273,sheet)+lab(82,230,'RILL  /  PICKUP SLIP',plum)+line(81,244,451,244,plum)+
 [289,344,399].map((y,i)=>tick(i,y)).join('')+lab(82,451,'MATCHED',plum)+
 each(4,i=>`<g id="count${i}">${txt(188,453,i+' / 3',24,plum,'font-weight="bold"')}</g>`)+
 `<g id="stamp"><g transform="rotate(-6 383 443)"><rect x="325" y="426" width="116" height="31" rx="3" fill="none" stroke="#367453" stroke-width="3"/>${lab(351,447,'READY','#367453')}</g></g>`+
 foot(plum,'BEFORE HANDOFF','Match the blend, grind and bag size','to the order before sealing the bag.');
 const tallyTL=each(4,i=>`tl.set('#count${i}',{opacity:${i===0?1:0}},0);`)+each(3,i=>{let at=.45+.68*i;return `tl.fromTo('#tick${i}',{strokeDashoffset:1},{strokeDashoffset:0,duration:.27},${at}).set('#count${i}',{opacity:0},${at+.27}).set('#count${i+1}',{opacity:1},${at+.27});`})+`tl.fromTo('#stamp',{scale:1.4,opacity:0,svgOrigin:'383 443'},{scale:1,opacity:1,duration:.28},2.35);`;
 return [['magazine-cover',cover,coverDefs,cTL],['growth-curve',chart,'',chartTL],['checklist-tally',tally,'',tallyTL]];
}
