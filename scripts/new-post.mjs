#!/usr/bin/env node
// Scaffold a new draft post.
//
//   pnpm new "文章标题"                     -> src/content/post/<slug>.md
//   pnpm new "文章标题" --slug my-post      -> custom URL slug
//   pnpm new "文章标题" --folder            -> src/content/post/<slug>/index.md, images go next to it
//   pnpm new "文章标题" --tags rust,wasm

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		slug: { type: "string", short: "s" },
		tags: { type: "string", short: "t", default: "" },
		folder: { type: "boolean", short: "f", default: false },
	},
});

const title = positionals.join(" ").trim();
if (!title) {
	console.error('Usage: pnpm new "文章标题" [--slug my-post] [--tags a,b] [--folder]');
	process.exit(1);
}

const slug =
	values.slug ??
	title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

if (!slug) {
	console.error("标题里没有可用作 URL 的英文字符，请用 --slug 指定，例如 --slug rust-wasm-cache");
	process.exit(1);
}

const base = join("src/content/post", values.folder ? join(slug, "index.md") : `${slug}.md`);
if (existsSync(base)) {
	console.error(`${base} 已存在`);
	process.exit(1);
}

// Local date, not UTC, so late-night posts get the right day
const today = new Date().toLocaleDateString("sv-SE");
const tags = values.tags
	.split(",")
	.map((t) => t.trim())
	.filter(Boolean);

const content = `---
title: ${JSON.stringify(title)}
description: "TODO: 用一两句话概括这篇文章，会出现在搜索结果和分享卡片里"
publishDate: ${today}
tags: ${JSON.stringify(tags)}
draft: true
---

## 背景

`;

mkdirSync(dirname(base), { recursive: true });
writeFileSync(base, content);
console.log(`✓ 已创建 ${relative(process.cwd(), base)}`);
console.log(`  预览：pnpm dev 后打开 http://localhost:4321/posts/${slug}`);
console.log("  写完后补上 description 并删掉 draft: true 再发布");
