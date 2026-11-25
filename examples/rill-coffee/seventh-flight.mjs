// Additional original studio directions; the original 18 catalog IDs remain unchanged.
export function seventhFlight({txt,ital,lab,line,header,foot,gradient,circle,ellipse,rect,each}){
 const path=(d,fill,attrs='')=>`<path d="${d}" fill="${fill}" ${attrs}/>`;
 const stroke=(d,c,w,attrs='')=>path(d,'none',`stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${attrs}`);
 const top=(bg,ink,section,title,sub)=>rect(0,0,540,675,bg)+header(ink,section)+ital(36,137,title,54,ink)+lab(40,169,sub,ink);
 const steel=gradient('steel',[[0,'#64666d'],[.2,'#bbbdba'],[.42,'#f6ebca'],[.51,'#a5a6a4'],[.79,'#dfd7c5'],[1,'#686970']]);
 const pot=top('#ddd8c6','#383942','BREWER ANATOMY','Inside a moka pot','THREE PARTS   /   ONE STOVETOP BREWER')+
 ellipse(201,480,81,9,'#b7b29f')+stroke('M201 202V480','#a9a69a',1,'stroke-dasharray="4 5"')+
 `<g id="base">${path('M149 386H251L268 451L251 464H150L135 451Z','url(#steel)')}${ellipse(200,386,51,8,'#66646a')}${ellipse(200,386,43,4,'#414953')}${circle(246,410,4,'#b99657')}</g>
 <g id="basket">${path('M152 335H250L214 355V378H195V353Z','url(#steel)')}${ellipse(201,335,50,8,'#735242')}${each(20,i=>ellipse(168+(i*27)%65,334+(i%4)*1.3,1.6,1,'#402e28'))}</g>
 <g id="upper">${path('M240 230Q304 213 272 290','none','stroke="#37363c" stroke-width="11" stroke-linecap="round"')}${path('M138 236L126 219L160 231H255L244 300H157Z','url(#steel)')}${path('M148 232L198 208L258 231Z','url(#steel)')}${ellipse(200,209,8,6,'#3c393a')}</g>
 <g id="labels">${[[256,'Brewed coffee'],[335,'Ground coffee'],[424,'Water']].map(([y,t])=>line(278,y,313,y,'#717168')+circle(278,y,2,'#717168')+txt(323,y+6,t,19,'#383942')).join('')}</g>`+
 foot('#383942','FROM BOTTOM TO TOP','Water starts below the basket. Brewed','coffee collects in the upper chamber.');
 const potTL=`tl.fromTo('#upper',{y:74},{y:0,duration:1.2,ease:'power2.inOut'},.25).fromTo('#basket',{y:48},{y:0,duration:1.1,ease:'power2.inOut'},.48).fromTo('#labels',{x:10,opacity:0},{x:0,opacity:1,duration:.45},1.48);`;
 const noise=(n)=>{let v=Math.sin(n*78.233+7.91)*43758.5453;return v-Math.floor(v)};
 const grains=(fine)=>each(fine?1550:440,i=>{const x=36+478*noise(i*3),y=205+293*noise(i*3+1),r=(fine?2.5:6)*(0.64+noise(i*3+2)*.72);return path(`M${x-r} ${y}l${r*.45} -${r} ${r*1.1} ${r*.12} ${r*.68} ${r*.98} -${r*.7} ${r*.85}Z`,['#3f2c32','#624039','#925b43','#77432e'][i%4])});
 const cmpDef='<clipPath id="sample"><rect x="40" y="205" width="460" height="293"/></clipPath><clipPath id="fineMask"><rect id="mask" x="40" y="205" width="0" height="293"/></clipPath>';
 const cmp=top('#e8bea8','#51343b','GRIND LAB','Compare the grind','SAME MAGNIFICATION   /   TWO SAMPLES')+
 `<g clip-path="url(#sample)">${rect(40,205,460,293,'#cfa67c')}${grains(false)}<g clip-path="url(#fineMask)">${rect(40,205,460,293,'#dfbb98')}${grains(true)}</g>
 <g id="blade">${line(40,205,40,498,'#fff6df',4)}${circle(40,360,12,'#fff6df')}${path('M35 360l4 -4v8ZM45 360l-4 -4v8Z','#684148')}</g></g>
 ${rect(376,453,106,31,'#f9e3c8')}${lab(389,474,'COARSE','#51343b')}<g id="fineTag">${rect(59,453,78,31,'#f9e3c8')}${lab(72,474,'FINE','#51343b')}</g>`+
 foot('#51343b','LOOK AT PARTICLE SIZE','Fine grounds have smaller particles.','Compare both at the same scale.');
 const cmpTL=`tl.to('#mask',{attr:{width:230},duration:1.7,ease:'sine.inOut'},.45).to('#blade',{x:230,duration:1.7,ease:'sine.inOut'},.45).fromTo('#fineTag',{opacity:0},{opacity:1,duration:.3},1.04);`;
 const green='#24574b',gold='#b45735',route='M135 461V379Q135 358 155 358H305Q328 358 328 333V275H383';
 const map=top('#cbdac7',green,'SHOP FIELD GUIDE','Find the pickup bar','RILL FLOOR PLAN   /   ORDERING AHEAD')+
 rect(40,201,460,298,'#e8ead2')+each(15,i=>line(40+32*i,201,40+32*i,499,'#d9dec8'))+each(9,i=>line(40,215+32*i,500,215+32*i,'#d9dec8'))+
 path('M75 235H257V305H75Z','#bdd1ba')+lab(90,276,'ESPRESSO BAR',green)+
 rect(365,238,111,75,'#95b6a2')+lab(378,258,'PICKUP',green)+
 each(3,i=>`<g>${circle(232+i*79,436,23,'#c3cab0')}${circle(232+i*79,436,18,'#dae0c6')}</g>`)+
 stroke(route,'#acb7a1',4,'stroke-dasharray="4 7"')+
 stroke(route,gold,5,'id="trail" pathLength="1" stroke-dasharray="1"')+
 circle(135,461,7,green)+lab(157,479,'ENTRY',green)+
 `<g id="pin">${path('M382 295Q357 268 382 264Q408 268 382 295Z',gold)}${circle(382,274,4,'#fff1cc')}</g>`+
 foot(green,'PICKING UP AT RILL?','Come in through the front door.','Follow the counter to the pickup shelf.');
 const mapTL=`tl.fromTo('#trail',{strokeDashoffset:1},{strokeDashoffset:0,duration:2.2,ease:'power1.inOut'},.22).fromTo('#pin',{y:-15,opacity:0},{y:0,opacity:1,duration:.45,ease:'back.out(1.5)'},2.18);`;
 return [['exploded-view',pot,steel,potTL],['comparison-wipe',cmp,cmpDef,cmpTL],['route-trace',map,'',mapTL]];
}
