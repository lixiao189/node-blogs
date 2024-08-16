---
title: "nvim 通过 OSC52 开启 SSH 远程复制粘贴功能"
publishDate: "16 Aug 2024"
description: "nvim 在最新的 1.0 大版本更新中支持了通过 OSC52 远程粘贴的功能"
tags: ["config", "nvim"]
---

## Neovim 配置

最近 Neovim 原生支持了 OSC52 远程粘贴功能，支持这个特性了以后，我们就能在 ssh 连接到远程
服务器的情况下粘贴远程服务器中的文字到本地剪贴板中，这个功能还是很方便的。

我们可以用如下命令测试你的终端是否支持 OSC52 远程粘贴特性

```bash
echo -e "\e]52;c;$(base64 <<< php)\a"
```

如果 `php` 出现在了你的终端中了，那么就说明你的终端支持这个特性

默认 Neovim 如果满足如下条件的时候会自动开启这个功能

- Nvim is running in the `TUI`
- `g:clipboard` is unset
- 'clipboard' is not set to "unnamed" or "unnamedplus"
- $SSH_TTY is set

目前我经常使用 orb stack 这个软件开启一个 Linux 虚拟机，但是不知道为啥用 ssh 连接到这个虚拟机的时候
$SSH_TTY 环境变量是空的。所以这个地方我直接根据帮助文档，强行开启这个特性, 配置如下

```lua
vim.g.clipboard = {
      name = 'OSC 52',
      copy = {
        ['+'] = require('vim.ui.clipboard.osc52').copy('+'),
        ['*'] = require('vim.ui.clipboard.osc52').copy('*'),
      },
      paste = {
        ['+'] = require('vim.ui.clipboard.osc52').paste('+'),
        ['*'] = require('vim.ui.clipboard.osc52').paste('*'),
      },
    }
```

## iTerm2 配置

如果你的 iTerm2 终端在这样强行开启以后还是没法粘贴到本地粘贴板，那么可能你需要按照
下图开启如下设置

在如下界面勾选：`Applications in terminal may access clipboard`

![enable copy](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/OPVK7N.png)

## Tmux 配置

很多时候我需要在 Tmux 中复用终端，但是默认情况下 Tmux 并没有支持 OSC52，后面查了下发现需要添加如下配置

```bash
set -g set-clipboard on
```

这样就能支持了远程复制了
