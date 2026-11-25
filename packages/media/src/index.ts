import sharp from 'sharp';
import {sanitizeLogoSVG} from './svg.ts';
import {z} from 'zod';
import {AppError} from '../../core/src/schema.ts';
export const uploadSchema=z.object({base64:z.string().max(14000000),alt:z.string().max(200).default(''),kind:z.enum(['photo','logo']).optional()}).strict();
export async function normalizeImage(input:z.infer<typeof uploadSchema>){
 let bytes=Buffer.from(input.base64,'base64');if(!bytes.length||bytes.length>10*1024*1024)throw new AppError('INVALID_IMAGE','Choose a JPEG, PNG or WebP image up to 10 MB.');
 try{const raster=bytes.subarray(0,3).equals(Buffer.from([255,216,255]))||bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP');const svg=!raster;if(svg){if(input.kind!=='logo')throw new AppError('INVALID_IMAGE','Use JPEG, PNG or WebP for slide photos. Simple SVG files are supported for business logos only.');bytes=sanitizeLogoSVG(bytes);}
 let source=sharp(bytes,{limitInputPixels:40000000,animated:false});const meta=await source.metadata();if(!['jpeg','png','webp',...(svg?['svg']:[])].includes(meta.format||'')||(meta.pages||1)>1)throw new Error('Unsupported image');
 if(svg&&(!meta.width||!meta.height||meta.width*meta.height>40000000))throw new AppError('INVALID_IMAGE','This SVG has invalid or oversized dimensions. Export a smaller logo.');
 if(svg)source=sharp(bytes,{limitInputPixels:40000000,density:Math.min(100000,72*Math.max(1,2000/Math.max(meta.width!,meta.height!)))});
 const {data,info}=await source.rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});
 if(data.length>1000000)throw new AppError('IMAGE_TOO_LARGE','This image is too detailed to embed. Resize it or choose a smaller image.');
 return {src:'data:image/webp;base64,'+data.toString('base64'),alt:input.alt,width:info.width,height:info.height};
 }catch(e){if(e instanceof AppError)throw e;throw new AppError('INVALID_IMAGE','Could not read this image. Use a still JPEG, PNG or WebP under 40 megapixels.');}
}
