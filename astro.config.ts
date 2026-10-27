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
			filter: (page) => !page.includes("/og-image/"),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
	},
});
