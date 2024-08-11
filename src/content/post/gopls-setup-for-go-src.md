---
title: "如何使用基于 LSP 的开发环境阅读 Golang 源代码"
publishDate: "11 Aug 2024"
description: "golang lsp 默认是无法阅读 golang 源代码的，此事在官网亦有记载"
tags: ["config", "nvim", "VSCode"]
---

本文参考：[https://go.googlesource.com/tools/+/refs/heads/master/gopls/doc/advanced.md#working-on-the-go-source-distribution](https://go.googlesource.com/tools/+/refs/heads/master/gopls/doc/advanced.md#working-on-the-go-source-distribution)

本文假设 golang 源代码路径是 `/path/to/go`

首先我们先调用 `./make.bash` 脚本来编译一份 go

然后将编译出来的 go 编译器添加进 PATH 变量，这样默认解析代码的时候就会使用编译出来的版本

```bash
export PATH=/path/to/go/bin:$PATH
```

然后接下来几步应该都是必须的

首先查看一下 golang 源代码的路径，然后将其设置为 GOROOT 环境变量

```bash
export GOROOT="/path/to/go/"
```

最后我们在 `src` 文件夹下创建一个 `go.work` 文件，让 gopls 识别多个 `go.mod` 文件的项目

```bash
cd /path/to/go/src
go work init . cmd
```

这样用 Neovim 或者 vs code 打开项目就是正确解析的了
