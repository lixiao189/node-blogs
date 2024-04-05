---
title: "nvim cmp 输入卡顿优化"
publishDate: "5 Apr 2024"
description: "nvim cmp 默认状态下输入非常卡顿，这里提供如何改进性能"
tags: ["config", "nvim"]
---

最近在使用 Neovim 写代码，之前用了一段时间 coc-nvim 感觉还是很满意的，但是毕竟 coc-nvim 还需要一个外置的 node，所以又想用回 Neovim 的自带 lsp 了。

默认情况下自带的 Lsp 需要安装一堆牛马插件，不是很好用，不如 coc-nvim 一把梭。

后面发现了还有一个非常优雅的插件 [lsp-zero](https://lsp-zero.netlify.app/v3.x/)

在这个插件中我们只需要使简单几步就能一把梭配置好 lsp 了，非常好用。

但是之后还是发现了 lsp 比较卡顿的问题没有解决。

后面发现 nvim cmp 插件提供了可以调整性能的参数，我们只需要减少 lsp 的暂停时间, 就可以有效减少输入的卡顿感。

在 `cmp.setup({})` 中插入如下代码：

```lua
performance = {
    max_view_entries = 10,
    debounce = 5,
    throttle = 5,
},
```

具体详情可以看我的 GitHub 上的配置仓库 [https://github.com/lixiao189/dotfiles/blob/main/nvim/lua/plugins/lsp/cmp.lua](https://github.com/lixiao189/dotfiles/blob/main/nvim/lua/plugins/lsp/cmp.lua)
