---
title: "修复在 Tmux 中的颜色问题"
publishDate: "5 May 2024"
description: "在某次用 alacritty 连接到 ssh 上的时候看到 tmux 下应用显示的颜色不太对"
tags: ["tmux", "config"]
---

这几天因为忍受不了 ssh + tmux + iterm2 的龟速, 所以最近使用 alacritty 在 Linux 服务器上进行开发, 但是突然发现好像 vim 的颜色显示不太对, 但是退出 tmux 了以后 vim 的颜色显示就是正常的.

后面看到了这个文章 [https://gist.github.com/andersevenrud/015e61af2fd264371032763d4ed965b6](https://gist.github.com/andersevenrud/015e61af2fd264371032763d4ed965b6)

在这个文章里面把 tmux 强行设置为 `tmux-256color`, 就能上 tmux 中的程序颜色正常了

配置如下:

```bash
set -g default-terminal "tmux-256color"
set -ag terminal-overrides ",xterm-256color:RGB"
```

后面发现我现在使用的 `oh my tmux` 默认是设置为 `screen 256` 的,可能这就是颜色显示不太对的原因,不知道为什么要这么设置

![default terminal in tmux](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/NUw7A4.png)
