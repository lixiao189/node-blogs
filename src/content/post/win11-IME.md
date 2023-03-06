---
title: "Windows11 无法正常切换中英文输入法修复"
publishDate: "6 Mar 2023"
description: "最近突然 Windows11 更新了，结果发现了中文输入功能无法切换中英文了，在这里纪录解决过程"
tags: ["Windows", "config"]
---

感谢这个老哥的教程：[https://blog.csdn.net/linyongui/article/details/119286792](https://blog.csdn.net/linyongui/article/details/119286792)

首先在设置里打开这个页面
![打开语言设置窗口](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/rkaQ03.png)

下面有一个 `Administrative language settings`

点击以后打开了一个新的窗口

![打开区域设置按钮](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/1v8dwM.png)

点击 Change system locale 这个按钮

在打开的窗口里勾选上 Beta: Use Unicode UTF-8 for worldwide language support
![勾选 UTF-8 选项](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/tr5TdB.png)

之后重启下应该就能正常使用了
