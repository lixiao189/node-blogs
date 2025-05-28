import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
	site: "https://blog.node189.top/",
	prefetch: true,
	trailingSlash: "never",
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [
			[
				rehypeKatex,
				{
					// Katex plugin options
				},
			],
		],
	},
	integrations: [
		expressiveCode({
			themes: ["dracula", "one-light"],
			themeCssSelector: (theme) => `.${theme.type}`,
		}),
		mdx({}),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
	],
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
	},
});
