import {editableMotions} from '../../../tools/carousel/motion/src/editable.ts';
import {layouts} from '../../../tools/carousel/core/src/layouts.ts';
import {createBundle,readBundle,bundleSummary} from '../../../tools/carousel/core/src/bundle.ts';
import {lockWorkspace} from '../../../tools/carousel/core/src/workspace-lock.ts';
import {prepareHandoff,handoffSchema} from '../../../tools/carousel/exports/src/handoff.ts';
import {Brands,kitInput} from '../../../tools/carousel/core/src/brands.ts';
import {BrandAssets,assetUpload,assetKinds,assetId} from '../../media/src/brand-assets.ts';
import {normalizeImage,uploadSchema} from '../../media/src/index.ts';
import {Exports,exportSchema} from '../../../tools/carousel/exports/src/index.ts';
import {canvasPresets} from '../../../tools/carousel/core/src/canvas.ts';
import express from 'express';
import {createServer as createHttpServer} from 'node:http';
import {gallery as motions} from '../../../tools/carousel/motion/src/gallery.ts';
import path from 'node:path';
import fs from 'node:fs/promises';
import type {ViteDevServer} from 'vite';
import {Store} from '../../../tools/carousel/core/src/store.ts';
import {AppError,batchSchema} from '../../../tools/carousel/core/src/schema.ts';
import {createProject,templates} from '../../../tools/carousel/templates/src/index.ts';
import {z} from 'zod';
import {createProjectSchema} from '../../../tools/carousel/templates/src/coffee.ts';
const production=process.argv.includes('--production');
const port=Number(process.env.PORT||4310);
if(!Number.isInteger(port)||port<1||port>65535){console.error('PORT must be a whole number from 1 to 65535.');process.exit(1);}
const builtUI=path.resolve('dist/studio');
if(production){try{await fs.access(path.join(builtUI,'index.html'));}catch{console.error('The built app is missing. Run npm run build, then npm start.');process.exit(1);}}
const app=express();const store=new Store(path.resolve(process.env.ACC_WORKSPACE||'.workspace/projects'));
const releaseWorkspace=await lockWorkspace(store.root);
await store.initialize();
const brands=new Brands(path.join(path.dirname(store.root),'brands'));
const assets=new BrandAssets(path.join(path.dirname(store.root),'brand-assets'));
const exportsService=new Exports(path.join(path.dirname(store.root),'exports'));await exportsService.initialize();
app.use((req,res,next)=>{const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host))return res.status(403).json({code:'INVALID_HOST',message:'Use the local application URL.'});if(req.headers.origin&&req.headers.origin!==`http://${host}`)return res.status(403).json({code:'INVALID_ORIGIN',message:'Open the app locally to continue.'});next();});
app.use(express.json({limit:'48mb'}));
app.get('/api/health',(_req,res)=>res.json({status:'ready',app:'doro-creator-toolkit',version:'0.1.0'}));
app.get('/api/capabilities',(_req,res)=>res.json({version:'0.1.0',editableMotions,operations:['list','read','create','batch','duplicate','import','archive','restore','trash','history','validate','export','list_exports','get_export','cancel_export','download'],editRetries:{requestId:true,durable:true,returnsOriginalSnapshot:true},projectBundles:{version:1,maxBytes:50331648,embeddedMedia:true},doro:{available:false,localHandoff:true,message:'Local review packets are available. Sending requires a connected agent and approval.'},brandAssets:{kinds:assetKinds,localOriginals:true,brandScoped:true},brandKits:{available:true,snapshot:true,typography:['editorial','modern']},templates,layouts,animations:motions,canvasPresets,media:{formats:['jpeg','png','webp'],logoFormats:['jpeg','png','webp','svg'],svg:{maxBytes:1048576,simpleOutlinedShapes:true,externalResources:false,normalizedTo:'webp'},maxUploadBytes:10485760,maxPixels:40000000,embedded:true},exports:['jpg','png','pdf','video','clips']}));
app.get('/api/brands',async(_req,res)=>res.json(await brands.list()));
app.post('/api/brands',async(req,res)=>res.status(201).json(await brands.save(kitInput.parse(req.body))));
app.post('/api/brands/:id',async(req,res)=>{const b=kitInput.extend({expectedRevision:z.number().int().nonnegative()}).strict().parse(req.body);res.json(await brands.save({label:b.label,brand:b.brand},req.params.id,b.expectedRevision));});
app.post('/api/projects/:id/brand-kit',async(req,res)=>{const b=z.object({kitId:z.string().uuid(),expectedRevision:z.number().int().nonnegative()}).strict().parse(req.body);const kit=await brands.read(b.kitId);res.json(await store.batch(req.params.id,batchSchema.parse({expectedRevision:b.expectedRevision,commands:[{type:'brand',brand:{...kit.brand,kitId:kit.id}}]})));});
app.get('/api/brands/:id/assets', async (req,res) => {
  await brands.read(req.params.id);
  res.json(await assets.list(req.params.id));
});
app.post('/api/brands/:id/assets', async (req,res) => {
  await brands.read(req.params.id);
  res.status(201).json(await assets.save(req.params.id, assetUpload.parse(req.body)));
});
app.get('/api/brands/:id/assets/:assetId', async (req,res) => {
  res.json(await assets.resolve(req.params.id, req.params.assetId));
});
app.get('/api/brands/:id/assets/:assetId/preview', async (req,res) => {
  const asset = await assets.resolve(req.params.id, req.params.assetId);
  res.type('image/webp').send(await fs.readFile(asset.previewPath));
});
app.post('/api/projects/:id/brand-asset', async (req,res) => {
  const input = z.object({
    expectedRevision:z.number().int().nonnegative(), kitId:z.string().uuid(), assetId,
    target:z.enum(['logo','photo']), slideId:z.string().uuid().optional(),
  }).strict().parse(req.body);
  const project = await store.read(req.params.id);
  if (input.expectedRevision !== project.revision) throw new AppError('REVISION_CONFLICT','This draft changed. Reload it before applying an asset.');
  if (input.kitId !== project.brand.kitId) throw new AppError('BRAND_MISMATCH','Apply this brand kit to the project first.');
  const asset = await assets.resolve(input.kitId, input.assetId);
  const bytes = await fs.readFile(asset.previewPath);
  const image = {src:'data:image/webp;base64,'+bytes.toString('base64'), alt:asset.label, width:asset.width, height:asset.height};
  const command = input.target === 'logo'
    ? {type:'brand', brand:{...project.brand,logo:image}}
    : {type:'editSlide', slideId:input.slideId, patch:{photo:{...image,fit:asset.kind==='photo'?'cover':'contain',x:50,y:50}}};
  res.json(await store.batch(req.params.id, batchSchema.parse({expectedRevision:input.expectedRevision,commands:[command]})));
});
app.post('/api/media',async(req,res)=>res.json(await normalizeImage(uploadSchema.parse(req.body))));
const searchSchema=z.object({query:z.string().max(200).optional(),category:z.string().max(100).optional()}).strict();
function searchCatalog<T extends {id:string;name:string;category:string}>(items:readonly T[],raw:unknown){const {query='',category}=searchSchema.parse(raw);return items.filter(item=>(!category||item.category===category)&&JSON.stringify(item).toLowerCase().includes(query.trim().toLowerCase()));}
app.get('/api/templates',(req,res)=>res.json({templates:searchCatalog(templates,req.query),categories:[...new Set(templates.map(t=>t.category))]}));
app.get('/api/animations',(req,res)=>res.json({animations:searchCatalog(motions,req.query),categories:[...new Set(motions.map(t=>t.category))],status:'preview-library',templateIntegration:false}));
app.get('/api/trash',async(_req,res)=>res.json(await store.trash()));
app.post('/api/project-bundles/preview',express.raw({type:'application/zip',limit:'48mb'}),async(req,res)=>res.json(bundleSummary(readBundle(req.body))));
app.post('/api/project-bundles/import',express.raw({type:'application/zip',limit:'48mb'}),async(req,res)=>res.status(201).json(await store.importProject(readBundle(req.body),z.string().uuid().optional().parse(req.query.requestId))));
app.get('/api/projects/:id/bundle',async(req,res)=>res.type('application/zip').attachment('carousel-project.zip').send(createBundle(await store.read(req.params.id))));
app.post('/api/projects/import',async(req,res)=>res.status(201).json(await store.importProject(req.body,z.string().uuid().optional().parse(req.query.requestId))));
app.post('/api/projects/:id/duplicate',async(req,res)=>res.json(await store.duplicate(req.params.id,z.object({requestId:z.string().uuid().optional()}).strict().parse(req.body).requestId)));
app.post('/api/projects/:id/archive',async(req,res)=>res.json(await store.archive(req.params.id,z.object({expectedRevision:z.number().int().nonnegative()}).strict().parse(req.body).expectedRevision)));
app.post('/api/projects/:id/restore',async(req,res)=>res.json(await store.restore(req.params.id)));
app.post('/api/projects/:id/history',async(req,res)=>{const b=z.object({expectedRevision:z.number().int().nonnegative(),direction:z.enum(['undo','redo'])}).strict().parse(req.body);res.json(await store.undoRedo(req.params.id,b.expectedRevision,b.direction));});
app.get('/api/projects/:id/download',async(req,res)=>{res.attachment('carousel-project.json').json(await store.read(req.params.id));});
app.post('/api/projects/:id/handoff',async(req,res)=>res.json(await prepareHandoff(await store.read(req.params.id),handoffSchema.parse(req.body),exportsService)));
app.get('/api/projects/:id/exports',async(req,res)=>{await store.read(req.params.id);res.json(exportsService.list(req.params.id));});
app.post('/api/projects/:id/validate',async(req,res)=>{const p=await store.read(req.params.id);res.json({reviewVersion:1,projectId:p.id,revision:p.revision,findings:await exportsService.inspect(p),limitations:['Automated checks do not verify facts, teaching quality or every visual overlap.','Reading time is a whitespace word-count estimate at 180 words per minute.','Font coverage checks identify characters absent from the bundled primary font; they do not certify fallback fonts or complex-script shaping.']});});
app.post('/api/projects/:id/exports',async(req,res)=>res.status(202).json(await exportsService.start(await store.read(req.params.id),exportSchema.parse(req.body))));
app.get('/api/exports/:id', (req,res)=>res.json(exportsService.get(req.params.id)));
app.post('/api/exports/:id/cancel',async(req,res)=>res.json(await exportsService.cancel(req.params.id)));
app.get('/api/exports/:id/files/:name',(req,res)=>res.download(exportsService.file(req.params.id,req.params.name),req.params.name,{dotfiles:'allow'}));
app.get('/api/library',async(_req,res)=>res.json(await store.catalog()));
app.get('/api/projects',async(_req,res)=>res.json(await store.list()));
app.post('/api/projects',async(req,res)=>{const b=createProjectSchema.parse(req.body);res.status(201).json(b.requestId?await store.createRequested(createProject(b),b.requestId,b):await store.create(createProject(b)));});
app.get('/api/projects/:id',async(req,res)=>res.json(await store.read(req.params.id)));
app.post('/api/projects/:id/commands',async(req,res)=>res.json(await store.batch(req.params.id,batchSchema.parse(req.body))));
app.use('/api',(_req,res)=>res.status(404).json({code:'NOT_FOUND',message:'This action is not available.'}));
const server=createHttpServer(app);
let vite:ViteDevServer|undefined;
if(production){app.use(express.static(builtUI,{index:false}));app.get(/.*/, (req,res)=>{if(path.extname(req.path))return res.status(404).send('File not found.');res.sendFile(path.join(builtUI,'index.html'));});}
else{const {createServer}=await import('vite');vite=await createServer({server:{middlewareMode:true,hmr:{server},watch:{ignored:[assets.root.replaceAll('\\','/')+'/**',store.root.replaceAll('\\','/')+'/**',path.join(path.dirname(store.root),'exports').replaceAll('\\','/')+'/**',path.join(path.dirname(store.root),'brands').replaceAll('\\','/')+'/**']}},appType:'spa'});app.use(vite.middlewares);}
app.use((err:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{const status=err instanceof AppError?(err.code==='REVISION_CONFLICT'?409:['ASSET_NOT_FOUND','KIT_NOT_FOUND','PROJECT_NOT_FOUND'].includes(err.code)?404:400):err instanceof z.ZodError?400:typeof err==='object'&&err!==null&&'status' in err&&[400,413].includes(Number(err.status))?Number(err.status):500;res.status(status).json({code:status===413?'FILE_TOO_LARGE':err instanceof AppError?err.code:err instanceof z.ZodError?'INVALID_INPUT':'INTERNAL_ERROR',message:status===413?'This request exceeds the 48 MB limit. Use a smaller project or image.':status===500?'Something went wrong. Your last saved project is preserved.':(err as Error).message,details:err instanceof AppError?err.details:err instanceof z.ZodError?err.issues:undefined});});
server.listen(port,'127.0.0.1',()=>console.log(`Doro Creator Toolkit: http://127.0.0.1:${port}`));server.on('error',async e=>{await releaseWorkspace();console.error(`Could not start the app: ${e.message}. Choose another PORT if it is occupied.`);process.exit(1);});
for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>{server.close();void (async()=>{await exportsService.shutdown();await vite?.close();await releaseWorkspace();process.exit(0);})();});
