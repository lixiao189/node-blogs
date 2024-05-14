---
title: "解决 IDEA 中 ant design 标签没有代码提示问题"
publishDate: "14 May 2024"
description: "解决IDEA中 ant design 和 element UI 标签没有代码提示问题"
tags: ["Vue"]
---

> 本文参考 https://blog.csdn.net/yssa1125001/article/details/105446180

最近公司里开发是使用 vue2，JB IDE 打开是没有对这些库做补全支持的，这里记录一下怎么让 JB IDE 解析这些第三方组件库中的组件。

首先是选中 settings

[![pkm227V.png](https://s21.ax1x.com/2024/05/14/pkm227V.png)](https://imgse.com/i/pkm227V)

然后再在这个地方点击 add 添加库，让 JB IDE 去扫描

[![pkm2oc9.png](https://s21.ax1x.com/2024/05/14/pkm2oc9.png)](https://imgse.com/i/pkm2oc9)

然后点击上面的加号，选择 attach directories

[![pkm2b0x.png](https://s21.ax1x.com/2024/05/14/pkm2b0x.png)](https://imgse.com/i/pkm2b0x)

[![pkmRKun.png](https://s21.ax1x.com/2024/05/14/pkmRKun.png)](https://imgse.com/i/pkmRKun)

然后选中 ant-design-vue 这个库的文件夹，添加进去即可在 ide 中使用对应的组件了
[![pkm2jhD.png](https://s21.ax1x.com/2024/05/14/pkm2jhD.png)](https://imgse.com/i/pkm2jhD)
