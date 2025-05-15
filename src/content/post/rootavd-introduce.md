---
title: "如何在 Android Studio 上的虚拟机安装 root AVD"
publishDate: "15 May 2025"
description: "root AVD 能将您的Android Studio虚拟设备（AVD）root，通过Magisk（稳定版、测试版或预览版）"
tags: ["RE"]
---

首先我们 git clone 这个项目

```bash
git clone https://gitlab.com/newbit/rootAVD.git --depth=1
```

然后进入仓库目录, 并执行脚本

```bash
cd rootAVD
./rootAVD.sh ListAllAVDs
```

执行结果如下:

![3DFfMF](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/3DFfMF.png)

可以看到这个命令列出了所有可以对虚拟机进行的操作，我们这里需要在虚拟机上完成 magisk 的安装，选择执行第一个就行了

复制命令，粘贴以后执行, 注意命令执行的时候需要开启安卓虚拟机

之后可以看到代码会让你选择 magisk 版本，我们在这个地方选择最新版本比较好

![HLzIbk](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/HLzIbk.png)

最后虚拟机会进入重启，如果重启黑屏了我们需要把虚拟机设置为冷启动，这样完整重启一下就能完成 root 了

![T8Xui6](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/T8Xui6.png)
