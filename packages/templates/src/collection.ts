import {coffeeSlides,coffeeBrand} from './coffee.ts';
export const coffeeCollection=[
 {id:'coffee-ordering',businessId:'rill-coffee',category:'education',name:'The black coffee guide',description:'Help a guest choose espresso or Americano.',brand:coffeeBrand,slides:coffeeSlides},
 {id:'coffee-announcement',businessId:'rill-coffee',category:'announcement',name:'A new way to order',description:'Explain a fictional menu addition and how to order it.',brand:coffeeBrand,slides:[
 {eyebrow:'DEMO MENU UPDATE',headline:'Your Americano. Now over ice.',body:'Our fictional Rill Coffee menu has a new option: espresso, cold water and ice.',visual:'iced-americano',layout:'statement',motion:'none',duration:7},
 {eyebrow:'WHAT IS IN THE CUP',headline:'Same espresso. A cooler drink.',body:'An iced Americano combines espresso with cold water and ice. It has no milk unless you ask to add it.',visual:'iced-americano',layout:'editorial',motion:'none',duration:8},
 {eyebrow:'AT THE COUNTER',headline:'Ask for an iced Americano.',body:'Want a hot drink instead? Order a regular Americano. Both begin with espresso.',visual:'coffee-pair',layout:'editorial',motion:'none',duration:7}]},
 {id:'coffee-showcase',businessId:'rill-coffee',category:'showcase',name:'One base, three cups',description:'A simple menu showcase that helps customers pick a drink.',brand:coffeeBrand,slides:[
 {eyebrow:'THE RILL COFFEE DEMO MENU',headline:'Three cups. One espresso base.',body:'Choose the size and temperature of your drink. Here is what changes in each cup.',visual:'coffee-pair',layout:'statement',motion:'none',duration:7},
 {eyebrow:'SHORT & HOT',headline:'Espresso',body:'A small, concentrated drink. Pick this when you want a short coffee with no added water or milk.',visual:'espresso',layout:'spotlight',motion:'none',duration:7},
 {eyebrow:'LONGER & HOT',headline:'Americano',body:'Espresso with added hot water. Pick this when you want a longer black coffee.',visual:'americano',layout:'spotlight',motion:'none',duration:7},
 {eyebrow:'LONGER & COLD',headline:'Iced Americano',body:'Espresso, cold water and ice. Pick this when you want the longer drink served cold.',visual:'iced-americano',layout:'spotlight',motion:'none',duration:7}]},
 {id:'coffee-story',businessId:'rill-coffee',category:'story',name:'How we explain the menu',description:'A fictional brand story about making ordering easier.',brand:coffeeBrand,slides:[
 {eyebrow:'A FICTIONAL RILL COFFEE STORY',headline:'A menu should help you choose.',body:'At our imaginary coffee shop, we start with the drink you want, then explain its name.',visual:'coffee-pair',layout:'statement',motion:'none',duration:7},
 {eyebrow:'START WITH A QUESTION',headline:'Short or long? Hot or iced?',body:'Those two choices give us a useful starting point. Then we explain what goes into the cup.',visual:'iced-americano',layout:'editorial',motion:'none',duration:7},
 {eyebrow:'MAKE THE NAME USEFUL',headline:'Explain the cup, not just the label.',body:'Espresso is the short drink. An Americano adds water. The iced version adds cold water and ice.',visual:'coffee-pair',layout:'editorial',motion:'none',duration:8},
 {eyebrow:'YOUR NEXT COFFEE',headline:'Tell the barista what you enjoy.',body:'Start with short or long, hot or cold. Ask what is in the drink before you order.',visual:'none',layout:'statement',motion:'none',duration:7}]}
] as const;
