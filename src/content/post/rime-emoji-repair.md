---
title: "Rime emoji 修复"
publishDate: "4 Feb 2023"
description: "最近突然 Rime 输入法突然更新，结果发现了 emoji 输入功能裂开了，在这里纪录解决过程" 
tags: ["Mac", "Rime", "config"]
---

最近更新了一波 Rime 中文输入法，
突然发现了我的输入法的 emoji 功能突然失效了。

后面在电报群的群友指导下，发现是 emoji 中可能出现了 key 冲突的问题,
后来用官方的 emoji 词典替换了原来配置文件中的 emoji 词典, 就能正常了。

这里放上官方词典的下载地址：

[https://raw.githubusercontent.com/rime/rime-emoji/master/opencc/emoji_word.txt](https://raw.githubusercontent.com/rime/rime-emoji/master/opencc/emoji_word.txt)

这样就能正常使用了

![image.png](https://s2.loli.net/2023/02/04/iamAcHnkpx25IN8.png)
