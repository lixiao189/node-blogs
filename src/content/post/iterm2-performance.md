---
title: "提升 iterm2 的性能问题"
publishDate: "6 May 2024"
description: "itemr2 在使用了 tmux 和 ssh 一类的工具以后往往很卡顿，这里提一个可以优化的点来改善使用体验"
tags: ["iterm2", "config"]
---

这几天尝试着使用了一下 alacritty 写东西，延迟很低很丝滑，但是 iterm2 理论上也有 GPU 加速，为什么还会有这么卡顿的感觉。

后面尝试着修改了一些设置，这里可以记录下可以改善延迟的点：

### Instant Replay

首先按照下图的设置调大这个缓存，这样就可以很明显的改善卡顿

![qYpM0c](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/qYpM0c.png)

首先我在这个地方修改了一下我的 instant replay 缓存大小，这个空间主要是用来存放回放数据的，如果可以的话
我其实是想关了这个功能，但是好像搜了一圈发现并没有能关掉这个功能的地方。
