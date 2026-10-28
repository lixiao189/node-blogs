import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { defineConfig } from "astro/config";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkMath from "remark-math";

// Same punctuation stripping as github-slugger, which Astro uses for post ids.
// A fresh pass per segment avoids the shared slug() counter appending "-1".
function segmentSlug(segment: string) {
	return segment
		.normalize()
		.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'"!#$%&()*+,./:;<=>?@[\]^`{|}~]/g, "")
		.replace(/\s/g, "-")
		.toLowerCase();
}

type PostMeta = { lastmod: string; noindex: boolean };

function calendarDay(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.valueOf())) return;
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

/** Published posts keyed by the same id Astro puts in `/posts/<id>`. */
function loadPostSitemapMeta() {
	const root = join(process.cwd(), "src/content/post");
	const posts = new Map<string, PostMeta>();
	const walk = (dir: string) => {
		for (const name of readdirSync(dir)) {
			if (name.startsWith("_")) continue;
			const full = join(dir, name);
			if (statSync(full).isDirectory()) {
				walk(full);
				continue;
			}
			if (!/\.(md|mdx)$/.test(name)) continue;
			const raw = readFileSync(full, "utf8");
			const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
			const block = fm?.[1];
			if (!block || /^draft:\s*true\s*$/m.test(block)) continue;
			const published = block.match(/^publishDate:\s*["']?(.+?)["']?\s*$/m)?.[1];
			if (!published) continue;
			const updated = block.match(/^updatedDate:\s*["']?(.+?)["']?\s*$/m)?.[1];
			const lastmod = calendarDay(updated ?? published);
			if (!lastmod) continue;
			const rel = relative(root, full).split(sep).join("/");
			const id = rel
				.replace(/\.mdx?$/, "")
				.split("/")
				.map(segmentSlug)
				.join("/")
				.replace(/\/index$/, "");
			posts.set(id, { lastmod, noindex: /^noindex:\s*true\s*$/m.test(block) });
		}
	};
	walk(root);
	return posts;
}

const postMeta = loadPostSitemapMeta();
let newestPost = "";
for (const post of postMeta.values()) {
	if (post.lastmod > newestPost) newestPost = post.lastmod;
}

// Markdown images are mostly remote screenshots; defer them until they near the viewport
function rehypeLazyImages() {
	// biome-ignore lint/suspicious/noExplicitAny: minimal hast walk, no extra types dependency
	const walk = (node: any) => {
		if (node.type === "element" && node.tagName === "img") {
			node.properties.loading ??= "lazy";
			node.properties.decoding ??= "async";
		}
		node.children?.forEach(walk);
	};
	return walk;
}

// https://astro.build/config
export default defineConfig({
	site: "https://blog.node189.top",
	trailingSlash: "never",
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "hover",
	},
	// Old paginated listings were merged into single archive pages
	redirects: {
		"/posts/2": "/posts",
		"/posts/3": "/posts",
		"/posts/4": "/posts",
		"/posts/5": "/posts",
		"/tags/config/2": "/tags/config",
	},
	markdown: {
		// remark-math / rehype-katex need the unified processor (Astro 7 defaults to Sätteri)
		processor: unified({
			remarkPlugins: [remarkMath, remarkAlert],
			rehypePlugins: [
				rehypeHeadingIds,
				[
					rehypeAutolinkHeadings,
					{
						behavior: "append",
						properties: { className: ["heading-anchor"], ariaHidden: true, tabIndex: -1 },
						content: { type: "text", value: "#" },
					},
				],
				rehypeKatex,
				rehypeLazyImages,
			],
		}),
	},
	integrations: [
		expressiveCode({
			themes: ["dracula", "one-light"],
			themeCssSelector: (theme) => `.${theme.type}`,
			useDarkModeMediaQuery: false,
			styleOverrides: {
				borderRadius: "0.625rem",
				borderWidth: "1px",
				borderColor: "var(--theme-border)",
				// Light theme shares the page background, so tint it to stand apart
				codeBackground: ({ theme }) => (theme.type === "light" ? "#f4f4f5" : theme.bg),
				codeFontFamily:
					"ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace",
				codeFontSize: "0.85rem",
				codeLineHeight: "1.7",
				codePaddingBlock: "1rem",
				codePaddingInline: "1.25rem",
				frames: {
					shadowColor: "transparent",
					frameBoxShadowCssValue: "none",
				},
			},
		}),
		mdx(),
		sitemap({
			// Tag archives are thin listings; Google already crawled them and left them out.
			// noindex posts stay on the site but are not submitted.
			filter: (page) => {
				const path = new URL(page).pathname;
				if (path.startsWith("/og-image/")) return false;
				if (path === "/tags" || path.startsWith("/tags/")) return false;
				const slug = path.startsWith("/posts/")
					? decodeURIComponent(path.slice("/posts/".length))
					: "";
				return !postMeta.get(slug)?.noindex;
			},
			serialize(item) {
				const path = new URL(item.url).pathname;
				const slug = path.startsWith("/posts/")
					? decodeURIComponent(path.slice("/posts/".length))
					: "";
				const lastmod =
					postMeta.get(slug)?.lastmod ??
					(path === "/" || path === "/posts" || path === "/about" ? newestPost : undefined);
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
	},
});
