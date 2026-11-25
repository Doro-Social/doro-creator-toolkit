export function sixthFlight({txt,ital,lab,line,header,foot,gradient,circle,ellipse,rect,each}){
 const top=(bg,fg,section,title,sub)=>rect(0,0,540,675,bg)+header(fg,section)+ital(36,138,title,55,fg)+lab(40,169,sub,fg);
 const path=(d,c,attrs='')=>`<path d="${d}" fill="${c}" ${attrs}/>`;
 const round=(x,y,w,h,r,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
 const artClip='<clipPath id="art"><rect x="40" y="195" width="460" height="316"/></clipPath>';
 const tray=top('#e7bb95','#442f31','ROASTERY NOTES','After the roast','INSIDE RILL  /  COOLING TRAY')+
 `<g clip-path="url(#art)">${rect(40,195,460,316,'#493c40')}${circle(322,392,218,'url(#metal)')}${circle(322,392,208,'#3b2424')}<g id="bed">${each(240,i=>{let a=i*2.39996,r=197*Math.sqrt((i+.5)/240);return `<g transform="translate(${322+r*Math.cos(a)} ${392+r*Math.sin(a)}) rotate(${(i*53)%180})">${ellipse(0,0,12,7,['#8b533b','#6e4333','#986044','#774734'][i%4])}${path('M-9 0Q-4 -4 0 0T9 0','none','stroke="#412a26" stroke-width="1.6"')}</g>`})}</g><g id="rake">${each(3,i=>`<g transform="rotate(${120*i} 322 392)">${path('M317 392L313 213L321 198L328 391Z','url(#metal)')}${each(4,j=>rect(323,230+36*j,21,5,'#c9b09b'))}</g>`)}${circle(322,392,21,'#d1bfa8')}${circle(322,392,11,'#7b6963')}</g></g>`+
 rect(54,213,187,82,'#fff0cf')+lab(67,237,'ON THE ROAST FLOOR','#4c3534')+ital(66,274,'Cooling tray',27,'#4c3534')+
 foot('#442f31','AFTER THE DRUM','The rake keeps hot beans moving','as air cools them in the tray.');
 const trayTL=`tl.to('#rake',{rotation:206,svgOrigin:'322 392',duration:6,ease:'none'},0).to('#bed',{rotation:53,svgOrigin:'322 392',duration:6,ease:'none'},0);`;
 // Chroma plate: derive alpha from red and blue so pure green drops to zero while the warm hand and red sleeve stay opaque.
 const key='<filter id="chroma" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  3 -2 2 1 -0.6"/></filter>';
 const scale=top('#bfcddf','#243951','BREW SCHOOL','Start at zero','SCALE BASICS   /   TARE WITH THE CUP ON')+
 rect(40,195,460,316,'#e3e9ed')+each(17,i=>line(50+i*27,199,50+i*27,508,'#ced7db'))+
 round(92,312,349,149,21,'#364959')+round(103,304,326,98,16,'#71808a')+
 ellipse(251,365,67,10,'#51616a')+path('M195 254H295L287 346Q243 366 206 345Z','#f6d6a5')+ellipse(245,254,50,10,'#a57e5e')+path('M292 265Q338 252 327 294Q320 315 293 301','none','stroke="#edcc9b" stroke-width="12"')+
 round(119,406,152,40,5,'#c1d8be')+`<g id="mass">${txt(139,435,'184 g',25,'#29433b')}</g><g id="zero">${txt(139,435,'0 g',25,'#29433b')}</g>`+
 round(310,407,83,38,16,'#b4c2c9')+txt(327,431,'TARE',17,'#283d4a')+
 `<g clip-path="url(#art)"><g id="hand"><g filter="url(#chroma)">${rect(348,334,225,157,'#00ff00')}${path('M519 357Q488 348 460 359L426 382L371 409Q354 416 355 424Q357 431 373 426L424 405L409 424Q404 434 419 435L437 423Q431 437 443 439L474 429L504 405L543 400Z','#df9875')}${path('M496 348L547 324L570 399L518 420Z','#b35f58')}${path('M356 421Q361 414 368 415L371 420L361 425Z','#f4c9ae')}</g></g></g>`+
 foot('#243951','WEIGH JUST THE COFFEE','Put the empty cup on the scale,','then press tare before you pour.');
 const scaleTL=`tl.set('#zero',{opacity:0},0).fromTo('#hand',{x:160,y:-58},{x:0,y:0,duration:1.18,ease:'power2.inOut'},.25).set('#mass',{opacity:0},1.45).set('#zero',{opacity:1},1.45).to('#hand',{x:168,y:-57,duration:.85,ease:'power2.inOut'},2.1);`;
 const dark='#303345', dialX=272,dialY=402;
 const dial=top('#d9cee4',dark,'GRINDER GUIDE','Read the notch','RILL FILTER RECIPE   /   OUR COUNTER GRINDER')+
 `<g clip-path="url(#art)">${rect(40,195,460,316,'#a897ad')}<g id="camera">${round(128,220,285,321,28,'#454452')}${round(147,239,247,49,8,'#dad1c9')}${lab(161,269,'RILL   /   MILL 02',dark)}${circle(dialX,dialY,102,'#232530')}${circle(dialX,dialY,94,'url(#dial)')}${each(45,i=>`<g transform="rotate(${(i-22)*5} 272 402)">${line(272,314,272,320+i%2*4,'#544e53',2)}</g>`)}${each(5,i=>{let a=(i-2)*30*Math.PI/180;return txt(272+69*Math.sin(a),407-69*Math.cos(a),String(10+i),18,'#342e39','text-anchor="middle"')})}${circle(dialX,dialY,43,'#827e86')}${circle(dialX,dialY,37,'#a09aa2')}${path('M262 290H282L272 311Z','#f3ba67')}</g></g>`+
 foot(dark,'AT OUR BREW BAR','Align 12 with the fixed pointer.','Grinder numbers vary by model.');
 const dialTL=`tl.to('#camera',{scale:2.15,x:0,y:52,svgOrigin:'272 310',duration:3.05,ease:'sine.inOut'},.38);`;
 return [['b-roll-overlay',tray,artClip+gradient('metal',[[0,'#7e7270'],[.27,'#f1d8b8'],[.55,'#b3a098'],[1,'#675b5e']]),trayTL],['green-screen',scale,artClip+key,scaleTL],['digital-zoom',dial,artClip+gradient('dial',[[0,'#a79ba4'],[.25,'#dfd8cd'],[.65,'#c4b9bb'],[1,'#918792']]),dialTL]];
}
