import {DOMParser,XMLSerializer,type Element} from '@xmldom/xmldom';
import {AppError} from '../../common/src/errors.ts';
const namespace='http://www.w3.org/2000/svg';
const elements=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','defs','linearGradient','radialGradient','stop','title','desc']);
const attributes=new Set(['xmlns','id','viewBox','width','height','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','d','points','transform','fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','opacity','color','preserveAspectRatio','gradientUnits','gradientTransform','offset','stop-color','stop-opacity','fx','fy','fr','spreadMethod']);
function invalid(detail:string):never{throw new AppError('UNSUPPORTED_SVG',detail+' Use a simple SVG with outlined shapes, or export your logo as a transparent PNG.');}
/** Accept an intentionally small inert subset; never send original XML to the renderer. */
export function sanitizeLogoSVG(bytes:Buffer):Buffer{
 if(bytes.length>1024*1024)invalid('SVG logos must be under 1 MB.');
 const source=bytes.toString('utf8');if(source.includes('\0')||/<!DOCTYPE|<!ENTITY/i.test(source))invalid('SVG document types and entities are not supported.');
 let doc;try{doc=new DOMParser({onError:()=>{throw new Error('Invalid XML');}}).parseFromString(source,'image/svg+xml');}catch{invalid('This SVG could not be read.');}
 const root=doc.documentElement;if(!root||root.nodeName!=='svg')invalid('Choose an SVG logo.');
 const ids=new Map<string,string>(),references:string[]=[];let count=0;
 function visit(el:Element,depth:number){
  if(++count>5000||depth>40)invalid('This SVG is too complex.');
  if(!elements.has(el.nodeName)||(el.namespaceURI&&el.namespaceURI!==namespace))invalid('This SVG contains unsupported elements.');
  if(el.nodeName==='svg'&&el!==root)invalid('Nested SVG documents are not supported.');
  for(let i=0;i<el.attributes.length;i++){
   const attr=el.attributes.item(i)!;const name=attr.name,value=attr.value.trim();
   if(!attributes.has(name)||attr.prefix)invalid('This SVG contains unsupported attributes, styles or references.');
   if(name==='xmlns'&&value!==namespace)invalid('This SVG uses an unsupported namespace.');
   if(name==='id'){if(!/^[A-Za-z_][\w.-]*$/.test(value)||ids.has(value))invalid('This SVG has invalid or duplicate shape IDs.');ids.set(value,el.nodeName);}
   if(['fill','stroke','color','stop-color'].includes(name)){
    const local=/^url\(#([A-Za-z_][\w.-]*)\)$/.exec(value);
    if(local&&['fill','stroke'].includes(name))references.push(local[1]);
    else if(!/^(?:#[\da-fA-F]{3,8}|[A-Za-z]+|rgba?\([\d.,%\s]+\)|hsla?\([\d.,%\s]+\))$/.test(value))invalid('This SVG contains unsupported paint or external references.');
   }else if(name!=='xmlns'&&/[<>\\]|(?:https?:|file:|data:|url\s*\()/i.test(value))invalid('SVG external references are not supported.');
  }
  for(const child of Array.from(el.childNodes)){
   if(child.nodeType===1)visit(child as Element,depth+1);
   else if(child.nodeType===8)el.removeChild(child);
   else if(child.nodeType===3){if(child.nodeValue?.trim()&&!['title','desc'].includes(el.nodeName))invalid('Convert SVG text to outlined shapes first.');}
   else invalid('This SVG contains unsupported XML content.');
  }
 }
 visit(root,0);
 for(const id of references)if(!['linearGradient','radialGradient'].includes(ids.get(id)||''))invalid('This SVG contains an unsupported paint reference.');
 for(const child of Array.from(doc.childNodes))if(child!==root&&child.nodeType!==8&&!(child.nodeType===3&&!child.nodeValue?.trim())&&!(child.nodeType===7&&child.nodeName==='xml'))invalid('SVG processing instructions are not supported.');
 root.setAttribute('xmlns',namespace);
 return Buffer.from(new XMLSerializer().serializeToString(root));
}
