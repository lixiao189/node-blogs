import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const uniqueLowercase = (tags: string[]) => [
	...new Set(tags.map((tag) => tag.trim().toLowerCase())),
];

const post = defineCollection({
	// Files or folders starting with "_" are ignored, handy for scratch notes
	loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/post" }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().max(80, { error: "标题请控制在 80 字以内，搜索结果会截断过长的标题" }),
				description: z
					.string()
					.min(10, { error: "description 太短，它会出现在搜索结果和分享卡片里" })
					.max(200),
				// Accepts "28 Oct 2026", "2026-10-28" or a YAML date
				publishDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
				tags: z.array(z.string()).default([]).transform(uniqueLowercase),
				// Drafts show up in `pnpm dev` but are left out of production builds
				draft: z.boolean().default(false),
				// Local image next to the post, used as the cover and social card
				cover: image().optional(),
				coverAlt: z.string().optional(),
				// Absolute or /public path to override the generated social card
				ogImage: z.string().optional(),
				// Kept on the site for readers, but left out of the sitemap and Google's index
				noindex: z.boolean().default(false),
			})
			.refine((post) => post.draft || !post.description.startsWith("TODO"), {
				error: "发布前请把 description 里的 TODO 换成真正的摘要（或保留 draft: true）",
				path: ["description"],
			}),
});

export const collections = { post };
