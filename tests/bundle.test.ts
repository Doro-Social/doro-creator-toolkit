import {it,expect} from 'vitest';
import AdmZip from 'adm-zip';
import sharp from 'sharp';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createBundle,readBundle} from '../packages/core/src/bundle.ts';
import {createProject} from '../packages/templates/src/index.ts';
import {Store} from '../packages/core/src/store.ts';

it('round trips media, order, crop, branding and motion into an independent workspace',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'bundle ü-'));try{const p=createProject({title:'Portable fixture'});const bytes=await sharp({create:{width:4,height:3,channels:3,background:'#00aaaa'}}).webp().toBuffer();const image={src:'data:image/webp;base64,'+bytes.toString('base64'),alt:'Test image',width:4,height:3};p.brand.logo=image;p.slides[0].photo={...image,fit:'contain',x:25,y:70};p.slides[0].motion='fade';p.slides[0].duration=9;p.slides.push({...p.slides[0],id:crypto.randomUUID(),headline:'Second slide'});const decoded=readBundle(createBundle(p));expect(decoded).toEqual(p);const imported=await new Store(root).importProject(decoded);expect(imported.id).not.toBe(p.id);expect(imported.slides.map(s=>s.id)).not.toEqual(p.slides.map(s=>s.id));expect(imported.brand).toEqual(p.brand);expect(imported.slides.map(({id,...s})=>s)).toEqual(p.slides.map(({id,...s})=>s));}finally{await rm(root,{recursive:true,force:true});}
});
it('rejects unexpected paths, scripts, symlinks and corrupt project hashes',()=>{
 const good=createBundle(createProject({title:'Integrity'}));
 for(const name of ['../escape','/absolute','run.js']){const zip=new AdmZip(good);zip.deleteFile('README.txt');zip.addFile(name,Buffer.from('bad'));expect(()=>readBundle(zip.toBuffer())).toThrow();}
 const symlink=new AdmZip(good);symlink.getEntry('README.txt')!.attr=(0xa000<<16)>>>0;expect(()=>readBundle(symlink.toBuffer())).toThrow();
 const bad=new AdmZip(good);bad.updateFile('project.json',Buffer.from('{}'));expect(()=>readBundle(bad.toBuffer())).toThrow(/checksum/);
 expect(()=>readBundle(Buffer.from('not a zip'))).toThrow();
});
it('rejects declared oversize entries before inflation and unsupported bundle versions',()=>{
 const good=createBundle(createProject({title:'Limits'}));const big=new AdmZip(good);big.getEntry('project.json')!.header.size=49*1024*1024;expect(()=>readBundle(big.toBuffer())).toThrow();
 const newer=new AdmZip(good);const m=JSON.parse(newer.readAsText('manifest.json'));m.version=2;newer.updateFile('manifest.json',Buffer.from(JSON.stringify(m)));expect(()=>readBundle(newer.toBuffer())).toThrow(/unsupported/);
});
