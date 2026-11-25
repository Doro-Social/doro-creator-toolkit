import {editableMotions} from './editable.ts';
import source from '../catalog-source.json';
import studioDirections from '../studio-directions.json';
import archive from '../archive.json';
type Media={src:string;poster:string;note:string};
const coffee:Record<string,string>={
 'exploded-view':'Inside a moka pot: the brewer separates to reveal the water chamber, grounds basket and coffee chamber.',
 'comparison-wipe':'Compare the grind: reveal fine particles beside coarse grounds at the same magnification.',
 'route-trace':'Find the pickup bar: trace the path from Rill’s front door to the pickup shelf.',
 'b-roll-overlay':'After the roast: an illustrated cooling tray runs beneath a stationary field label.',
 'green-screen':'Start at zero: a keyed hand demonstrates taring the scale with an empty cup in place.',
 'digital-zoom':'Read the notch: a slow move from the grinder face to setting 12 shows how to read the fixed pointer.',
 'headline-storm':'Affogato: hot shot and cold scoop converge beside a dish of vanilla gelato.',
 'checklist-pop':'Cold brew on ice: three steps show how to serve the house concentrate.',
 'zoom-through-cut':'Before the tamp: a passing tamper conceals the cut from loose grounds to a pressed puck.',
 'chat-takeover':'Coffee without milk: a sample counter conversation leads to an iced Americano.',
 'snap-zoom':'Check the grind: a quick push into the bag label reveals that this bag contains ground coffee.',
 'phone-mockup':'Find your cup: compare the pickup code on a phone receipt with the code on the cup.',
 'magazine-cover':'Orchard: the autumn cover pairs an illustrated pear latte with its recipe notes.',
 'growth-curve':'Pour to the line: follow the scale from a 50 g bloom to 150 g and 250 g total water.',
 'checklist-tally':'Bag check: the pickup slip counts the blend, grind and weight before the ready stamp lands.',
 'frame-escape':'Follow the spout: the kettle crosses its intact illustration frame and pours a narrow stream onto the coffee grounds.',
 'zoom-portal':'Inside the cherry: an expanding cutaway reveals the paired seeds inside a coffee cherry.',
 'orbit':'One base, three cups: espresso, Americano and latte orbit their common espresso base.',
 'liquid-glass':'Espresso tonic: watch the espresso settle above the tonic, ice and fluted glass.',
 'frame-break':'Crack-cap mocha: tap the chocolate lid with a spoon, then stir the pieces into the drink.',
 'paper-cutout':'Two order tickets compare a short, coffee-forward cortado with a milkier latte.',
};
const featured=Object.keys(coffee);
export const gallery=[...source.styles,...studioDirections].map(s=>{
 const local=coffee[s.id], previous=(archive as Record<string,Media>)[s.id];
 return {...s,editableTreatment:editableMotions.find(m=>m.id===s.id)??null,status:local?'coffee-preview':previous?'doro-preview':s.id==='digital-zoom'?'basic-preview':'pending',
 media:local?{src:'/motion-studies/'+s.id+'.mp4',poster:'/motion-studies/'+s.id+'.jpg',note:local}:previous??null};
}).sort((a,b)=>(featured.includes(a.id)?featured.indexOf(a.id):99)-(featured.includes(b.id)?featured.indexOf(b.id):99));
