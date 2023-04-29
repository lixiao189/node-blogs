---
title: "如何在 Arm 架构的 Mac 上检测 C++ 程序内存泄露"
publishDate: "29 Apr 2023"
description: "之前用的 clang 自带的内存泄露检测工具，但是貌似在 Arm Mac 上检测不了了，于是只能找到新的解决方案"
tags: ["C++"]
---

最近一直在考虑怎么检测 C++ 的内存泄露问题，虽然说用了智能指针能有效缓解，但是还是很担心内存泄露，后面学高数的时候刷 YouTube 发现了这个视频：[教程视频](https://www.youtube.com/watch?v=bhhDRm926qA)

~~确实，如果 Arm Mac 上没有内存泄露检测工具，那么苹果公司的人要如何调试呢~~ 😂

这里就借用这个视频中的方案来解决 C++ 内存泄露。

假如说我们现在有这么一个会内存泄露的代码：
![内存泄露的代码](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/kIydIl.png)

然后用以下命令编译

```bash
clang++ main.cc -o main -g -std=c++17
```

> 在这个地方一定要注意编译的时候要带上 -g 参数提供源代码信息。这样才能让检测工具知道是源代码第几行有问题

最后我们用这个命令来执行内存泄露检测：

```bash
leaks --atExit -- ./main
```

最后可以看到内存泄露报告
![内存泄露报告](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/vPwuLf.png)

可以看到在源代码中的第 19 行、第 20 行、第 21 行的分配的内存因为没有被及时回收被检测出来了。
