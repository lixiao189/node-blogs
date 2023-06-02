---
title: "VS code 如何在调试 python 的时候进入第三方库"
publishDate: "2 Jun 2023"
description: "VS code 如何在调试的时候默认无法进入第三方库的函数里，这对我们想要分析第三方库源代码的时候非常不方便"
tags: ["VSCode", "config", "Python"]
---

## 起因

最近在看 angr 这个符号执行库的源代码，但是这个源代码因为用的面向对象写的，看的非常迷糊，我就想通过写一个 demo，然后用调试器看 angr 到底执行了什么代码。

但是在用 vs code 添加调试的时候，一开始 vs code 是没法步进 angr 库的函数里的。

![步进失败](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/soHy59.png)

后面我查阅了资料，发现要修改一个 vs code 设置就行了。

## 解决方案

![create-launchjson-file](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/create-launchjson-file.png)

首先我们点击这个地方创建一个 `launch.json` 文件

然后在弹出来的窗口里选择 `Python File`

![chose python file](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/5Ty2Yi.png)

然后将这个地方的 `justMyCode` 设置为 `false`

![justmycode](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/QGMghX.png)

这样修改以后我们就能愉快调试了。
