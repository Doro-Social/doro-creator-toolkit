export function fourthFlight({txt,ital,lab,line,header,foot,gradient,circle,ellipse,rect,each}){
 const panel=(bg,ink,section,title,sub)=>rect(0,0,540,675,bg)+header(ink,section)+ital(36,138,title,55,ink)+lab(40,170,sub,ink);
 const path=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
 const round=(x,y,w,h,r,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
 const slip=(id,x,y,w,bg,ink,tag,copy,right=false)=>`<g id="${id}">${round(x,y,w,76,13,bg)}${path(right?`M${x+w-25} ${y+70}l26 16 -4 -27Z`:`M${x+24} ${y+70}l-26 16 4 -27Z`,bg)}${lab(x+20,y+25,tag,ink)}${txt(x+20,y+55,copy,21,ink)}</g>`;
 const chat=panel('#d9ddbd','#273e35','COUNTER TALK','Coffee without milk','AN EXAMPLE ORDER AT RILL')+
 slip('guest',58,210,338,'#365441','#fff0cc','GUEST','Something cold, without milk?')+
 slip('barista',118,312,357,'#f5edce','#284238','BARISTA','Try espresso over ice and water.',true)+
 slip('reply',58,416,335,'#365441','#fff0cc','GUEST','An iced Americano, please.')+
 foot('#273e35','ORDER IT BY NAME','An iced Americano is espresso,','cold water and ice.');
 const chatTL=['guest','barista','reply'].map((id,i)=>`tl.fromTo('#${id}',{x:${i===1?58:-55},y:10,opacity:0},{x:0,y:0,opacity:1,duration:.48,ease:'power3.out'},${.12+i*.93});`).join('');
 const bagDefs=gradient('kraft',[[0,'#93634c'],[.15,'#e4b986'],[.34,'#ecc899'],[.83,'#c49871'],[1,'#996c54']])+'<clipPath id="shop-window"><rect x="40" y="195" width="460" height="321" rx="4"/></clipPath>';
 const bag=panel('#ded9eb','#423248','BAG LABEL GUIDE','Check the grind','HOUSE BLEND   /   RETAIL SHELF')+
 `<g clip-path="url(#shop-window)">${rect(40,195,460,321,'#9b8ba2')}${each(21,i=>line(40+i*25,195,15+i*25,516,'#ad9fb1'))}<g id="lens">${ellipse(281,481,111,12,'#7e7185')}${path('M180 230L346 225L361 261L372 467L351 482L170 478L157 458L168 268Z','url(#kraft)')}${path('M346 225L361 261L372 467L351 482L338 278Z','#9b735b')}${each(5,i=>line(182,232+i*4,345,229+i*4,'#a67f60'))}${rect(185,293,148,145,'#fbefd6')}${ital(196,319,'Rill Coffee',20,'#422e39')}${lab(197,345,'HOUSE BLEND','#422e39')}${line(197,358,318,358,'#b09585')}${txt(198,377,'GRIND',12,'#68595a')}${txt(197,402,'Filter grind',23,'#382f3b')}${line(198,409,315,409,'#b75a3c',3)}${txt(198,427,'250 g',12,'#68595a')}</g></g>`+
 foot('#423248','BEFORE YOU BUY','“Filter grind” means already ground.','Grinding at home? Pick whole bean.');
 const bagTL=`tl.to('#lens',{scale:2.23,svgOrigin:'259 392',y:-33,duration:.56,ease:'power3.inOut'},.95).to('#lens',{scale:2.16,duration:.43,ease:'sine.out'},1.51);`;
 const phone=panel('#a7ccce','#243e49','PICKUP COUNTER','Find your cup','PICKUP NOTE   /   COUNTER LABEL')+
 ellipse(272,482,184,12,'#8cafb1')+
 `<g id="device">${round(70,206,188,277,23,'#253d46')}${round(77,213,174,262,18,'#faf1ce')}${round(145,220,40,5,3,'#38494c')}${ital(96,263,'Rill Coffee',25,'#31484c')}${line(95,275,233,275,'#a5a486')}${lab(96,305,'PICKUP NOTE','#4d6663')}${txt(94,361,'A17',58,'#214a4f')}${txt(96,398,'Iced oat latte',20,'#31484c')}${line(95,417,232,417,'#9ca98e')}${txt(96,443,'Collect at the bar',15,'#4e6566')}</g>`+
 `<g id="drink">${path('M301 302H444L428 462Q380 483 319 461Z','#bb815e','stroke="#e7e4ce" stroke-width="3"')}${each(3,i=>round(311+i*37,307+i%2*6,33,22,5,'#ddc19b'))}${round(291,288,161,14,6,'#eaf3e5')}${ellipse(372,288,78,8,'#c4d8c7')}${rect(368,237,9,50,'#5c8581')}${round(321,345,105,80,5,'#fff4cf')}${lab(331,368,'PICKUP','#44615a')}${txt(330,408,'A17',40,'#214a4f')}</g>`+
 `<g id="match">${line(237,358,322,388,'#356761',2)}${circle(236,358,4,'#356761')}${circle(322,388,4,'#356761')}</g>`+
 foot('#243e49','AT THE PICKUP BAR','Match the code on your pickup note','to the cup label before taking it.');
 const phoneTL=`tl.fromTo('#device',{rotation:-11,y:35,svgOrigin:'164 440'},{rotation:0,y:0,duration:1.1,ease:'power3.out'},.08).fromTo('#drink',{x:100,opacity:0},{x:0,opacity:1,duration:.72,ease:'power2.out'},.82).fromTo('#match',{opacity:0},{opacity:1,duration:.38},1.65);`;
 return [['chat-takeover',chat,'',chatTL],['snap-zoom',bag,bagDefs,bagTL],['phone-mockup',phone,'',phoneTL]];
}
