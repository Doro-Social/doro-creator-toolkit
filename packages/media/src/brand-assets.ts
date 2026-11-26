import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {z} from 'zod';
import {AppError} from '../../common/src/errors.ts';
import {normalizeImage, uploadSchema} from './index.ts';

export const assetKinds = ['logo', 'icon', 'photo', 'screenshot'] as const;
export const assetFields = z.object({
  label: z.string().trim().min(1).max(100),
  kind: z.enum(assetKinds),
});
export const assetUpload = assetFields.extend({base64: uploadSchema.shape.base64}).strict();
export const assetId = z.string().regex(/^[a-f0-9]{64}$/);
const assetRecord = assetFields.extend({
  id: assetId, kitId: z.string().uuid(),
  format: z.enum(['png', 'jpg', 'webp', 'svg']),
  width: z.number().int().positive(), height: z.number().int().positive(),
});
export type BrandAsset = z.infer<typeof assetRecord>;

export async function localAssetBody(filePath: string, fields: z.infer<typeof assetFields>) {
  if (!path.isAbsolute(filePath)) throw new Error('Choose an absolute local image path.');
  const stat = await fs.stat(filePath);
  if (!stat.isFile() || stat.size > 10485760) throw new Error('Choose an image file up to 10 MB.');
  return {...fields, base64: (await fs.readFile(filePath)).toString('base64')};
}

// Asset identities and source files belong to the workspace, independent of any project format.
export class BrandAssets {
  constructor(readonly root: string) {}

  private directory(kitId: string, id?: string) {
    const brand = path.join(this.root, z.string().uuid().parse(kitId));
    return id === undefined ? brand : path.join(brand, assetId.parse(id));
  }

  async read(kitId: string, id: string) {
    const dir = this.directory(kitId, id);
    try {
      return assetRecord.parse(JSON.parse(await fs.readFile(path.join(dir, 'asset.json'), 'utf8')));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT')
        throw new AppError('ASSET_NOT_FOUND', 'This image is unavailable in the selected brand.');
      throw e;
    }
  }

  async list(kitId: string) {
    const dir = this.directory(kitId);
    await fs.mkdir(dir, {recursive: true});
    const ids = (await fs.readdir(dir)).filter(name => assetId.safeParse(name).success);
    const records = await Promise.all(ids.map(id => this.read(kitId, id)));
    return records.sort((a,b) => a.label.localeCompare(b.label));
  }

  async save(kitId: string, input: z.infer<typeof assetUpload>) {
    const {label, kind, base64} = assetUpload.parse(input);
    const image = await normalizeImage({base64, alt: label, kind: kind === 'logo' || kind === 'icon' ? 'logo' : 'photo'});
    const original = Buffer.from(base64, 'base64');
    // normalizeImage has already validated the actual file contents.
    const format = original[0] === 0xff ? 'jpg' : original[0] === 0x89 ? 'png' : original.toString('ascii',0,4) === 'RIFF' ? 'webp' : 'svg';
    const id = createHash('sha256').update(JSON.stringify([kind,label])).update(original).digest('hex');
    const record = assetRecord.parse({id, kitId, label, kind, format, width: image.width, height: image.height});
    const brand = this.directory(kitId);
    await fs.mkdir(brand, {recursive: true});
    const pending = await fs.mkdtemp(path.join(brand, '.import-'));
    try {
      await fs.writeFile(path.join(pending, 'original.' + format), original);
      await fs.writeFile(path.join(pending, 'preview.webp'), Buffer.from(image.src.split(',')[1], 'base64'));
      await fs.writeFile(path.join(pending, 'asset.json'), JSON.stringify(record));
      try {
        await fs.rename(pending, this.directory(kitId, id));
      } catch (e) {
        if (!['EEXIST', 'ENOTEMPTY'].includes((e as NodeJS.ErrnoException).code || '')) throw e;
        return await this.read(kitId, id);
      }
      return record;
    } finally {
      await fs.rm(pending, {recursive: true, force: true});
    }
  }

  async resolve(kitId: string, id: string) {
    const asset = await this.read(kitId, id);
    const dir = this.directory(kitId, id);
    return {...asset, originalPath: path.join(dir, 'original.' + asset.format), previewPath: path.join(dir, 'preview.webp')};
  }
}
