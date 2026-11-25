export function fifthFlight({txt,ital,lab,line,header,foot,gradient,circle,ellipse,rect,each}){
 const path=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
 const stroke=(d,c,w)=>path(d,'none',`stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`);
 const top=(bg,ink,k,title,sub)=>rect(0,0,540,675,bg)+header(ink,k)+ital(37,138,title,58,ink)+lab(40,170,sub,ink);
 const ink='#482c3b',cream='#fff0cc';
 const dessert=top('#efd0ac',ink,'DESSERT COUNTER','Affogato','AN ESPRESSO DESSERT   /   SERVED TO ORDER')+
 rect(40,200,460,307,'#60384c')+
 `<g id="hot">${ital(60,270,'Hot shot.',54,cream)}</g><g id="cold">${ital(59,336,'Cold scoop.',47,'#f3b09f')}</g>`+
 `<g id="dish">${ellipse(370,457,84,10,'#402c3c')}${path('M284 359H453Q447 402 389 414L387 439L422 449Q377 461 329 449L366 439L365 415Q301 408 284 359Z','#e6a992')}${ellipse(368,359,85,16,'#bd7c66')}${path('M309 359C302 328 324 298 353 295C387 282 423 310 423 351Q388 380 309 359Z','#ffe9b9')}${each(8,i=>stroke('M'+(318+i*7)+' '+(340-i%3*3)+'q8 -26 30 -25','#e4c991',1.5))}${path('M339 316Q359 304 361 322T384 342Q371 341 366 336Q360 327 357 335T347 343Q350 325 339 316Z','#81412f')}${stroke('M297 380Q307 399 342 404','#ffcead',2)}</g>`+
 foot(ink,'HOW WE SERVE IT','A hot shot of espresso goes over','vanilla gelato. Eat it as it melts.');
 const dessertTL=`tl.fromTo('#hot',{x:-170,y:-42,opacity:0,rotation:-13,svgOrigin:'128 252'},{x:0,y:0,opacity:1,rotation:0,duration:.7,ease:'power3.out'},.15).fromTo('#cold',{x:230,y:65,opacity:0,rotation:14,svgOrigin:'168 330'},{x:0,y:0,opacity:1,rotation:0,duration:.82,ease:'power3.out'},.48).fromTo('#dish',{y:26,scale:.88,svgOrigin:'371 399'},{y:0,scale:1,duration:.85,ease:'power2.out'},.67);`;
 const teal='#174f53',pale='#e8eee2';
 const steps=['Fill the glass with ice.','Add one part concentrate.','Add one part cold water.'];
 const checks=top('#bbd8d0',teal,'TAKE-HOME BAR','Cold brew on ice','RILL CONCENTRATE   /   HOUSE SERVING GUIDE')+
 rect(40,197,460,311,pale)+each(3,i=>`<g id="row${i}">${line(64,290+i*87,472,290+i*87,'#b3c9bf')}${circle(91,251+i*87,23,['#95c7bd','#925d46','#78a8be'][i])}${i===0?path('M80 245l16 -4 5 16 -17 5Z','#e0f2e9'):i===1?ellipse(91,251+i*87,13,8,'#562e27'):path('M91 413q-17 18 0 21q17 -4 0 -21Z','#d8edf2')}${txt(128,259+i*87,steps[i],22,teal)}${stroke('M437 '+(253+i*87)+'l6 6 12 -16',teal,3)}</g>`)+
 foot(teal,'THE RILL MIX','Start with equal parts concentrate','and water. Add more water to taste.');
 const checksTL=each(3,i=>`tl.fromTo('#row${i}',{opacity:0,y:20,scale:.95,svgOrigin:'270 ${251+87*i}'},{opacity:1,y:0,scale:1,duration:.57,ease:'back.out(1.45)'},${.13+.77*i});`);
 const metal=gradient('rim',[[0,'#60656c'],[.21,'#e3d7bd'],[.46,'#88868a'],[.75,'#fff0c6'],[1,'#756967']]);
 const grind=(packed)=>each(packed?270:360,i=>{const angle=i*2.39996,r=102*Math.sqrt((i+.5)/(packed?270:360)),x=270+r*Math.cos(angle),y=352+r*Math.sin(angle);return ellipse(x,y,packed?1.5:3.2,packed?.8:2.1,['#59392e','#976647','#38271e','#845339'][i%4])});
 const board=top('#dcc896','#3e3536','ESPRESSO BENCH','Before the tamp','PUCK PREP   /   THE COFFEE BED')+
 `<g clip-path="url(#window)">${rect(40,193,460,320,'#90765e')}${each(27,i=>line(44,201+i*12,500,198+i*12,'#987e67'))}${path('M343 389l71 79 -23 20 -79 -85Z','#40393c')}${circle(270,352,123,'url(#rim)')}${circle(270,352,111,'#53362c')}${grind(false)}
 <g id="pressed">${circle(270,352,106,'#77503b')}${grind(true)}<circle cx="270" cy="352" r="102" fill="none" stroke="#946b4f" stroke-width="2"/></g>
 <g id="tamper">${circle(270,352,46,'url(#rim)')}${circle(270,352,39,'#a46d48')}${circle(270,352,31,'#b07851')}</g></g>
 <g id="before">${rect(54,207,101,29,'#f5dfac')}${lab(64,227,'LOOSE','#503c32')}</g><g id="after">${rect(54,207,113,29,'#f5dfac')}${lab(64,227,'PRESSED','#503c32')}</g>`+
 foot('#3e3536','WHAT THE BARISTA DOES','Level the grounds in the basket.','Press straight down to form a flat puck.');
 const tampTL=`tl.set('#pressed',{opacity:0},0).set('#after',{opacity:0},0).fromTo('#tamper',{opacity:0,scale:.12,svgOrigin:'270 352'},{opacity:1,scale:.9,duration:.38},.95).to('#tamper',{scale:10,duration:.53,ease:'power3.in'},1.33).set('#pressed',{opacity:1},1.89).set('#before',{opacity:0},1.89).set('#after',{opacity:1},1.89).to('#tamper',{scale:.1,opacity:0,duration:.65,ease:'power2.out'},2.08);`;
 return [['headline-storm',dessert,'',dessertTL],['checklist-pop',checks,'',checksTL],['zoom-through-cut',board,metal+'<clipPath id="window"><rect x="40" y="193" width="460" height="320"/></clipPath>',tampTL]];
}
