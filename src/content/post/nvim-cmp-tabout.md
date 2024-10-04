---
title: "nvim cmp tabout 实现"
publishDate: "4 Oct 2024"
description: "在 Neovim cmp 中实现了一波 tabout 功能，这样可以按下 tab 直接跳出括号"
tags: ["config", "nvim"]
---

目前我的 Tab 按键绑定如下，使用了 Neovim 的原生 snippet 功能，逻辑是：

1. 如果有 snippet 区块能跳转的话，那么就直接跳出括号
2. 否则，判断是否是括号的另外一边，如果是，直接跳出
3. 否则，直接按照原来 tab 的逻辑执行

```lua
-- Keymap for snippet
local function is_pair()
    local col = vim.fn.col('.') - 1
    local next_char = vim.fn.getline('.'):sub(col + 1, col + 1)
    return next_char:match("[%)%]}>\"';`]") ~= nil
end
vim.keymap.set({ 'i', 's' }, '<Tab>', function()
    if vim.snippet.active({ direction = 1 }) then
        return '<cmd>lua vim.snippet.jump(1)<cr>'
    elseif is_pair() then -- Tabout
        vim.api.nvim_input('<Right>')
    else
        return '<Tab>'
    end
end, { expr = true })
vim.keymap.set({ 'i', 's' }, '<S-Tab>', function()
    if vim.snippet.active({ direction = -1 }) then
        return '<cmd>lua vim.snippet.jump(-1)<cr>'
    end
end, { expr = true })
```
