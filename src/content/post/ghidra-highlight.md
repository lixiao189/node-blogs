---
title: "Ghidra 如何设置点击变量高亮所有同名变量"
publishDate: "27 May 2023"
description: "IDA Pro 上点击一个变量就能有高亮，但是 Ghidra 上默认是没有这个功能的，这里介绍如何设置"
tags: ["RE", "config"]
---

![Untitled](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/Untitled.png)

首先点击 Edit → Tool Options

然后在直接搜索 highlight 设置项，找到这个设置项

![tmp](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/tmp.png)

我们可以看到他默认居然是用鼠标中键来触发这个功能的

我们将 Mouse Button To Activate 修改成 LEFT 就可以使用左键来触发这个好用的小功能了

以上.

> 感谢 [https://www.youtube.com/watch?v=dW8YFRX2BGk](https://www.youtube.com/watch?v=dW8YFRX2BGk) 的教程
