---
title: "flare on 4 payload.dll 题解"
publishDate: "27 Aug 2024"
description: "一个关于 DLL 的逆向题目, 在这里记录下 DLL 逆向相关的知识"
tags: ["RE", "CTF"]
---

首先是在 Windows 上如何直接调用 dll 中的函数, 我们这里要借助一个命令 `rundll32`

在 Windows 上输入以下命令可以调用 dll 中指定的函数

```bash
rundll32 /path/to/dll function-name param1 ...
```

在 IDA 中我们可以看到函数的默认导出函数为 `DllEntryPoint`

![lDCODa](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/lDCODa.png)

但是在 windows 终端中运行这个函数的时候可以发现没有运行成功, 怀疑可能是某个地方修改了函数名

![oBlPay](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/oBlPay.png)

这里尝试使用一个技巧就是在 cmd 这个命令行提示符中, 我们使用 #1 来当作函数名,可以直接执行 dll 中的第一个函数

![AEv4k9](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/AEv4k9.png)

然后接下来我们可以使用 IDA 搜索这个字符串, 很顺利找到一个函数

![PAXx6C](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/PAXx6C.png)

接下来我们用 IDA patch 掉这个 IF 判断,让他直接强行执行后面的代码

![6UBl3h](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/6UBl3h.png)

可以看到输出了一部分 flag

接下来就是要找到其余的 flag 在什么地方.

因为这个题目中的代码修改了 PE 文件函数导出表, 所以考虑搜 `VirtualProtectEx` 函数被哪个地方的代码引用了,
这个地方应该有控制函数最后执行代码的信息

最后我们搜索到在这个函数修改了 PE 表

![hP3ehy](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/hP3ehy.png)

然后通过调试可以发现, 这个函数的返回结果是和输出的时候的 flag 下标对应上的,所以大胆猜测这个函数是控制输出的 flag 的下标的.

![xaLhBN](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/xaLhBN.png)

我们调试的时候在执行完函数的地方下一个断点,然后修改 rax 寄存器来修改函数的返回值,可以看到修改以后输出内容有对应变化.

考虑到这个函数的输出范围来 `0 ~ 25`, 所以这个地方我们直接依次尝试修改 rax 寄存器为 `0 ~ 25` 最后可以得到所有的 flag 为

```bash
wuuut-exp0rts@flare-on.com
```
