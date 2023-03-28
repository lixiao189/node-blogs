---
title: "给 clangd 添加 C++ 17 支持"
publishDate: "15 Mar 2023"
description: "给 clangd 添加 C++ 17 的支持"
tags: ["clangd", "C++", "config"]
---

最近刚刚给我的 emacs 装上了 lsp-mode 基本上可以当一个小开发工具使用了。

然而突然发现 Mac OS 自带的 clang++ 默认编译的时候是不带 c++17 的支持

后面翻了个文档以后在发现了添加 clangd 配置文件可以解决问题

路径如下：
- Windows: `%LocalAppData%\clangd\config.yaml, typically C:\Users\Bob\AppData\Local\clangd\config.yaml.`
- macOS: `~/Library/Preferences/clangd/config.yaml`
- Linux and others: `$XDG_CONFIG_HOME/clangd/config.yaml, typically ~/.config/clangd/config.yaml.`

如果有多个配置 If 条件的话，可以用 `---` 将他们隔开

配置文件如下：

```yaml
If:
  PathMatch: [.*\.cc, .*\.cpp, .*\.c++]
CompileFlags:
  Add: [-std=c++17]
```
