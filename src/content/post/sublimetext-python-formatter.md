---
title: "Sublime text 配置 python LSP 格式化"
publishDate: "30 Jan 2024"
description: "Sublime Text Lsp 安装了 pyright 以后，发现没有自带补全"
tags: ["Sublime Text", "config"]
---

pyright 不知道是什么原因，官方并没有提供 python format 的选项，所以一开始我写 python 代码都只能依赖 Sublime Text 的第三方格式化工具来处理这个问题。

但是后面我查询到 pylsp 这个 lsp 插件下有解决方案，还是挺骚的。[https://github.com/sublimelsp/LSP-pylsp]

大概思路就是我们只需要, 下载他们家的 LSP，然后关掉补全，和 Pyright 一起用，就可以丝滑格式化了（md 这太骚了）。

总之，尝试一下以后发现确实可以格式化力。同时还能拥有 Pylsp 的 Lint。

![Dor2XQ](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/Dor2XQ.png)