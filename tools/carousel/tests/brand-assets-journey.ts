import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {chromium, expect} from '@playwright/test';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {startLocalApp, freePort} from '../../../tests/helpers/local-app.ts';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'creator-brand-assets-'));
const workspace = path.join(root, 'projects');
const port = await freePort();
let app = await startLocalApp(workspace, port);
const browser = await chromium.launch();
const client = new Client({name:'brand-asset-journey',version:'1'});
async function tool(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({name, arguments:args});
  assert.ok(!result.isError, JSON.stringify(result));
  return JSON.parse((result.content as {text:string}[])[0].text);
}
try {
  await client.connect(new StdioClientTransport({command:process.execPath,
    args:['--import','tsx',path.resolve('packages/agent-tools/src/index.ts')],
    env:{...process.env as Record<string,string>, ACC_URL:app.url}}));
  const draft = await tool('create_project',{title:'First post'});
  const first = await tool('save_brand_kit',{label:'Clay Street',brand:{...draft.brand,name:'Clay Street'}});
  const second = await tool('save_brand_kit',{label:'North Market',brand:{...draft.brand,name:'North Market'}});
  await tool('apply_brand_kit',{kitId:first.id,projectId:draft.id,expectedRevision:0});
  const page = await browser.newPage();
  await page.goto(app.url+'/?project='+draft.id);
  await page.getByRole('button',{name:/Brand & assets/}).click();
  await expect(page.getByLabel('Saved brand kit')).toHaveValue(first.id);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><rect width="120" height="60" fill="#009966"/></svg>';
  const source = path.join(root,'studio-mark.svg');
  await fs.writeFile(source,svg);
  await page.getByLabel('Choose an image').setInputFiles(source);
  await page.getByLabel('Asset name').fill('Studio mark');
  await page.getByRole('button',{name:'Save to brand',exact:true}).click();
  await page.getByRole('button',{name:'Use as project logo'}).click();
  await expect(page.getByText('Project logo updated.',{exact:true})).toBeVisible();
  const [asset] = await tool('list_brand_assets',{kitId:first.id});
  assert.equal(asset.label,'Studio mark');
  const again = await tool('save_brand_asset',{kitId:first.id,filePath:source,kind:'logo',label:'Studio mark'});
  assert.equal(again.id,asset.id);
  assert.equal((await tool('list_brand_assets',{kitId:first.id})).length,1);
  const cli = execFileSync(process.execPath, ['--import','tsx','packages/cli/src/index.ts','save-brand-asset',first.id,'logo','Studio mark',source], {
    env:{...process.env,ACC_URL:app.url}, encoding:'utf8'
  });
  assert.equal(JSON.parse(cli).id,asset.id);
  await fs.unlink(source);
  await app.stop(); app=await startLocalApp(workspace,port);
  const location = await tool('resolve_brand_asset',{kitId:first.id,assetId:asset.id});
  assert.equal(await fs.readFile(location.originalPath,'utf8'),svg);
  assert.deepEqual(await tool('list_brand_assets',{kitId:second.id}),[]);
  const followup = await tool('create_project',{title:'Second post'});
  const linked = await tool('apply_brand_kit',{kitId:first.id,projectId:followup.id,expectedRevision:0});
  const use = {projectId:linked.id,kitId:first.id,assetId:asset.id,target:'photo',slideId:linked.slides[0].id,expectedRevision:linked.revision};
  const used = await tool('apply_brand_asset',use);
  assert.equal(used.slides[0].photo.alt,'Studio mark');
  assert.equal(used.slides[0].photo.fit,'contain');
  assert.ok((await client.callTool({name:'apply_brand_asset',arguments:use})).isError);
  const switched = await tool('apply_brand_kit',{kitId:second.id,projectId:linked.id,expectedRevision:used.revision});
  assert.ok((await client.callTool({name:'apply_brand_asset',arguments:{...use,expectedRevision:switched.revision}})).isError);
  assert.ok((await client.callTool({name:'resolve_brand_asset',arguments:{kitId:second.id,assetId:asset.id}})).isError);
  await page.goto(app.url+'/?project='+switched.id);
  await page.getByRole('button',{name:/Brand & assets/}).click();
  await expect(page.getByRole('heading',{name:'Assets for North Market'})).toBeVisible();
  await expect(page.getByText('No saved assets yet.')).toBeVisible();
  const portable = await (await fetch(app.url+'/api/projects/'+draft.id+'/download')).json();
  assert.ok(portable.brand.logo.src.startsWith('data:image/webp;base64,'));
  console.log('Browser import and application, MCP reuse, original after restart, duplicate prevention, stale edits, brand isolation and portable snapshots passed.');
} finally {
  await client.close(); await browser.close(); await app.stop();
  await fs.rm(root,{recursive:true,force:true});
}
