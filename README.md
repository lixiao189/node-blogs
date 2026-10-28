# Node Sans Blog

https://blog.node189.top · 基于 [Astro 7](https://astro.build) + Tailwind CSS 4，部署在 Vercel。

最早 fork 自 [astro-theme-cactus](https://github.com/chrismwilliams/astro-theme-cactus)，已按 Astro 官方推荐的结构重写。

## 常用命令

| 命令                        | 作用                                                             |
| :-------------------------- | :--------------------------------------------------------------- |
| `pnpm dev`                  | 本地预览，默认 http://localhost:4321                             |
| `pnpm new "标题"`           | 新建一篇草稿（见下文）                                           |
| `pnpm check`                | 类型检查 + 校验所有文章的 frontmatter                            |
| `pnpm build`                | 清空内容缓存后完整构建到 `dist/`                                 |
| `pnpm clean`                | 清空 Astro 内容缓存，改了代码块等渲染配置后 dev 页面样式不对时用 |
| `pnpm preview`              | 本地预览构建产物                                                 |
| `pnpm lint` / `pnpm format` | Biome 检查 / Prettier 格式化                                     |

需要 Node 22.23+ 与 pnpm。

## 写文章

### 1. 新建

```bash
pnpm new "Trunk 增量编译失效排查" --slug trunk-incremental --tags rust,wasm
```

会生成 `src/content/post/trunk-incremental.md`，`draft: true`。`--slug` 决定文章 URL（`/posts/trunk-incremental`），标题全是中文时必须指定。

文章需要配图时加 `--folder`，生成 `src/content/post/<slug>/index.md`，图片直接放在同一个目录里用相对路径引用，构建时会自动压缩成 webp 并加上宽高：

```md
![Ghidra 反编译结果](./ghidra.png)
```

### 2. Frontmatter

```yaml
---
title: "文章标题" # 必填，80 字以内
description: "一两句话摘要" # 必填，用于搜索结果、RSS 和分享卡片
publishDate: 2026-10-28 # 必填，也接受 "28 Oct 2026"
updatedDate: 2026-11-02 # 可选，大幅修改后填写，会显示「更新于」并告诉搜索引擎
tags: ["rust", "wasm"] # 可选，会自动转小写去重
draft: true # 可选，草稿只在 pnpm dev 中可见，不会被构建发布
cover: ./cover.png # 可选，文章目录内的封面图
coverAlt: "封面描述"
ogImage: "/custom-card.png" # 可选，覆盖自动生成的分享卡片
noindex: true # 可选，占位文仍可访问，但不进 sitemap、也不要求搜索引擎收录
---
```

字段写错时 `pnpm dev` / `pnpm check` 会直接给出中文提示。`description` 还是 `TODO` 开头时只能保持草稿状态。

文件名或目录名以 `_` 开头的会被忽略，适合放还没想好的草稿碎片。

### 3. 可用的 Markdown 扩展

- **提示块**，GitHub 同款语法：

  ```md
  > [!NOTE]
  > 普通说明

  > [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
  ```

- **数学公式**：`$O(VE)$` 行内，`$$ ... $$` 独立成行，使用 KaTeX 渲染
- **代码块**：由 Expressive Code 渲染，自带复制按钮，支持标题与行高亮：

  ````md
  ```rust title="src/main.rs" {2}
  fn main() {
      println!("hi");
  }
  ```
  ````

- **目录**：`##` 与 `###` 标题会自动生成目录（桌面端在右侧悬浮，移动端可折叠），标题旁的 `#` 可复制锚点链接
- **MDX**：需要组件时把后缀改成 `.mdx`

### 4. 发布

补好 `description`，删掉 `draft: true`，提交推送即可。

## 自动生成的内容

- 每篇文章的分享卡片 `/og-image/<slug>.png`（含中文字体，构建时从 Google Fonts 按需取子集）
- `/rss.xml` 全文 RSS、`/sitemap-index.xml`、`/robots.txt`
- 每页的 canonical、Open Graph、Twitter Card，以及文章的 `BlogPosting` / `BreadcrumbList` 结构化数据
- 预计阅读时间、上一篇 / 下一篇导航、「在 GitHub 上编辑」链接

## 目录结构

```
src/
├── content/post/        # 文章（.md / .mdx，或 <slug>/index.md 目录）
├── content.config.ts    # 文章 frontmatter schema
├── site.config.ts       # 站点信息、导航、社交链接、友链
├── lib/                 # 文章查询、日期格式化等纯函数
├── components/
│   ├── layout/          # 页头、页脚、主题切换
│   ├── post/            # 文章列表项、标签、目录、上下篇
│   └── seo/BaseHead.astro
├── layouts/             # BaseLayout / PostLayout
├── pages/               # 路由
└── styles/global.css    # Tailwind 4 主题变量与正文排版
```

改站点名称、导航、友链只需要编辑 `src/site.config.ts`；改配色编辑 `src/styles/global.css` 顶部的 CSS 变量。
