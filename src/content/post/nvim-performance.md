---
title: "提升 neovim 的性能问题"
publishDate: "6 May 2024"
description: "Neovim 在使用 Lsp 以后非常卡顿，后面经过排查是 log 日志的问题"
tags: ["nvim", "config"]
---

最近尝试在 neovim 中使用 Lsp，但是发现非常卡顿，后面经过排查是 log 日志的问题

> 此事在 [lazyvim discussion](https://github.com/LazyVim/LazyVim/discussions/326#discussioncomment-11453947) 中亦有记载

在 Neovim 的配置文件中添加如下代码，关闭 log 日志

```lua
vim.lsp.set_log_level("off")
```
