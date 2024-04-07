---
title: "nvim mason 插件无法在 arm64 Linux 上安装 clangd"
publishDate: "7 Apr 2024"
description: "mason 的作者貌似并不想解决 arm Linux 上使用 clangd 的问题，这里给出一个解决方案"
tags: ["config", "nvim", "clangd"]
---

首先我是使用 debian 的用户，在 debian 中我们只需要使用 apt 就能安装一个 clangd

```bash
sudo apt install clangd
```

然后使用软链接，链接系统的 clangd 进 neovim 的 lsp 安装目录下面

```bash
ln -s /usr/bin/clangd ~/.local/share/nvim/mason/bin/clangd
```

![软链接到 Neovim lsp 目录下](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/dTI78A.png)

但是这样 Mason 还是不知道自己已经有了 lsp 的，我们接下来还需要创建一个临时文件夹来让 Mason 以为自己已经装上了 clangd

```bash
mkdir /home/node/.local/share/nvim/mason/packages/clangd
```

![欺骗 Neovim](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/mBX8A9.png)

