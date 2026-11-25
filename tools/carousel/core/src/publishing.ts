import {z} from 'zod';
export const platforms=['instagram','linkedin','facebook','threads','tiktok','x','bluesky'] as const;
export const postCopySchema=z.object({caption:z.string().max(5000),hashtags:z.array(z.string().trim().min(1).max(100)).max(30)}).strict();
export const publishingSchema=z.object({documentTitle:z.string().max(200).default(''),posts:z.object(Object.fromEntries(platforms.map(p=>[p,postCopySchema.optional()])) as Record<typeof platforms[number],z.ZodOptional<typeof postCopySchema>>).strict(),internalTags:z.array(z.string().trim().min(1).max(100)).max(50).default([])}).strict();
export type Publishing=z.infer<typeof publishingSchema>;
export function postText(post:z.infer<typeof postCopySchema>){return [post.caption.trim(),post.hashtags.map(t=>'#'+t.replace(/^#+/,'')).join(' ')].filter(Boolean).join('\n\n');}
export function publishingText(p:Publishing){return ['DOCUMENT TITLE',p.documentTitle||'(not set)',...platforms.flatMap(platform=>p.posts[platform]?['',platform.toUpperCase(),postText(p.posts[platform]!)]:[])].join('\n');}
