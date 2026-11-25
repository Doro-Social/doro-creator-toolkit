// Original illustrations. Static headings and ordering advice remain outside the moving artwork.
export function secondFlight({txt,ital,lab,line,header,foot,gradient,circle,ellipse,rect,each}){
 const path=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
 const stroke=(d,c,w=2,extra='')=>path(d,'none',`stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
 const panel=(bg,ink,k,title,sub)=>rect(0,0,540,675,bg)+header(ink,k)+ital(37,138,title,56,ink)+lab(40,168,sub,ink);
 const copper=gradient('copper',[[0,'#72472d'],[.16,'#bb8054'],[.34,'#f8c68d'],[.51,'#aa6942'],[.78,'#db9f6b'],[1,'#824a37']]);
 const kettle=panel('#c6dbe1','#233e48','BREW BENCH','Follow the spout','POUR-OVER   /   HAND BREWED')+
 rect(51,225,250,245,'#678e98')+each(16,i=>line(58,238+i*14,295,238+i*14,'#83a6ad'))+
 '<rect x="51" y="225" width="250" height="245" fill="none" stroke="#2e5260" stroke-width="5"/>'+
 lab(66,452,'KETTLE STUDY','#e4f3ea')+
 ellipse(387,477,63,9,'#aac0c4')+
 path('M352 403L343 457Q342 474 389 474Q428 473 428 459L420 404Z','#dcebea','stroke="#47646b" stroke-width="3"')+
 path('M348 438Q383 445 425 438L428 459Q425 475 385 472Q340 470 344 457Z','#664534')+
 path('M335 366H438L398 420H377Z','#f7e9cb','stroke="#42616a" stroke-width="3"')+
 each(8,i=>line(343+i*12,369,378+i*2.8,414,'#aa9279',1.6))+ellipse(386,366,51,7,'#694635')+
 `<g id="kettle">${stroke('M122 305C61 281 65 381 121 364','#383d3d',12)}${stroke('M122 305C61 281 65 381 121 364','#bd8d63',4)}${path('M210 350C251 368 250 293 284 284L290 291C261 314 274 388 207 376Z','url(#copper)','stroke="#704c37" stroke-width="2"')}${path('M131 288Q167 278 199 292L223 365Q222 391 164 393Q99 390 103 364Z','url(#copper)','stroke="#69513b" stroke-width="2"')}${ellipse(164,289,35,9,'#9f6b48')}${ellipse(164,286,32,6,'#e3ae7f')}${circle(164,279,6,'#353a37')}${stroke('M130 311L117 361Q111 378 142 382','#f4c596',3)}</g>`+
 stroke('M384 301Q393 325 385 361','#fafffb',4,'id="pour" stroke-dasharray="77"')+
 foot('#233e48','WHY THE LONG SPOUT?','A narrow stream lets the barista','aim the water across the grounds.');
 const kettleTL=`tl.fromTo('#kettle',{x:-2,y:0,rotation:0,svgOrigin:'163 345'},{x:92,y:-3,rotation:6,duration:1.5,ease:'power2.inOut'},.3).fromTo('#pour',{strokeDashoffset:77,opacity:0},{strokeDashoffset:0,opacity:1,duration:.36},1.75).to('#pour',{opacity:0,duration:.3},3.75).to('#kettle',{rotation:0,duration:.55,ease:'sine.out'},3.9);`;
 const cherryDefs=gradient('skin',[[0,'#f99468'],[.33,'#d95048'],[.70,'#ae303c'],[1,'#71233a']])+gradient('kernel',[[0,'#7f9971'],[.4,'#cfcd99'],[.72,'#a1b989'],[1,'#71916c']])+'<clipPath id="window"><circle id="iris" cx="273" cy="354" r="0"/></clipPath>';
 const fruit=panel('#f6e6cd','#5b3336','BOTANY NOTES','Inside the cherry','FIELD GUIDE   /   COFFEE FRUIT')+
 stroke('M256 268Q253 229 297 201','#6c6840',7)+path('M269 246Q227 191 176 205Q197 246 269 246Z','#68855c')+stroke('M184 208L260 241','#d0cd93')+
 ellipse(277,465,86,9,'#e0c7a9')+
 path('M266 258C213 223 156 280 163 354C166 421 213 457 269 458C326 462 379 422 381 347C382 281 329 234 288 253Q277 260 266 258Z','url(#skin)')+
 stroke('M190 324Q195 280 227 270','#ffa77f',7)+
 `<g clip-path="url(#window)">${ellipse(272,353,105,101,'#ea8265')}${ellipse(272,353,94,91,'#ffca86')}${each(38,i=>{const a=i*2*Math.PI/38;return line(272+89*Math.cos(a),353+86*Math.sin(a),272+82*Math.cos(a+.04),353+79*Math.sin(a+.04),'#d89064',2)})}${each(2,i=>`<g transform="translate(${i?301:244} 353) rotate(${i?13:-13})">${ellipse(0,0,30,64,'#ead798')}${ellipse(0,0,26,59,'url(#kernel)')}${stroke('M0 -49C-12 -24 12 4 -2 45','#738466',3)}${stroke('M-11 -42Q-23 -9 -14 18','#d5d7aa',2)}</g>`)}</g>`+
 `<g id="callout">${stroke('M313 350L389 304H465','#5b3336',1.4)}${circle(313,350,3,'#5b3336')}${lab(392,296,'SEED','#5b3336')}</g>`+
 foot('#5b3336','WHAT GETS ROASTED?','A coffee bean is a seed. Most coffee','cherries hold two, side by side.');
 const fruitTL=`tl.fromTo('#iris',{attr:{r:0}},{attr:{r:115},duration:1.65,ease:'power2.inOut'},.6).fromTo('#callout',{opacity:0,x:6},{opacity:1,x:0,duration:.45},1.97);`;
 const orbitDefs=gradient('crema',[[0,'#ddae69'],[.4,'#b57547'],[.73,'#e6ad6a'],[1,'#ae7141']]);
 const flight=panel('#292e49','#f2e5be','TASTING FLIGHT','One base, three cups','ORDERING NOTES   /   ESPRESSO BASE')+
 `<circle cx="270" cy="350" r="118" fill="none" stroke="#858598" stroke-dasharray="2 6"/>`+
 each(48,i=>{const a=i*Math.PI/24;return line(270+81*Math.cos(a),350+81*Math.sin(a),270+85*Math.cos(a),350+85*Math.sin(a),'#7d8299')})+
 circle(270,350,67,'#e3ac79')+circle(270,350,62,'#2a3048')+ital(270,344,'Double',25,'#f5dfb1').replace('<text ', '<text text-anchor="middle" ')+ital(270,374,'espresso',25,'#f5dfb1').replace('<text ', '<text text-anchor="middle" ')+
 each(3,i=>{const a=(-90+i*120)*Math.PI/180,x=270+118*Math.cos(a),y=350+118*Math.sin(a);return `<g id="track${i}"><g transform="translate(${x} ${y})"><g id="upright${i}">${ellipse(0,7,40,34,'#181d33')}${circle(0,0,34,['#dd907b','#95b7bc','#d6c99c'][i])}${stroke('M19 -8C43 -20 45 11 22 9','#f4ead9',6)}${circle(0,0,25,'#f4ead9')}${circle(0,0,20,['url(#crema)','#663f32','#c99061'][i])}${i===2?stroke('M-11 0Q-7 -10 -1 0Q5 -10 11 -5Q12 2 1 10Z','#ffedc7',3):stroke('M-13 -5Q-9 -15 4 -14','#e1ab73',2)}${rect(-63,35,126,24,'#292e49')}${txt(0,53,['Espresso','Americano','Latte'][i],19,'#f5e5c1','text-anchor="middle"')}</g></g></g>`})+
 foot('#f2e5be','CHOOSE YOUR FLIGHT','Espresso + hot water: Americano.','Espresso + steamed milk: latte.');
 const flightTL=each(3,i=>`tl.fromTo('#track${i}',{rotation:-105,svgOrigin:'270 350'},{rotation:0,duration:2.3,ease:'power2.inOut'},.16).fromTo('#upright${i}',{rotation:105,svgOrigin:'0 0'},{rotation:0,duration:2.3,ease:'power2.inOut'},.16);`);
 return [['frame-escape',kettle,copper,kettleTL],['zoom-portal',fruit,cherryDefs,fruitTL],['orbit',flight,orbitDefs,flightTL]];
}
