---
title: "Ghidra 如何设置点击变量高亮所有同名变量"
publishDate: "27 May 2023"
updatedDate: "28 Oct 2026"
description: "Ghidra 默认用鼠标中键才高亮同名变量。把 Cursor Text Highlight 的 Mouse Button To Activate 改成 LEFT，范围只在当前函数。"
tags: ["RE", "config"]
---

IDA 里点一下变量，同名的地方会一起亮。Ghidra 也有这个功能，只是默认绑在鼠标中键上。触控板和不少鼠标没有中键，看起来就像没有。

它的名字是 **Cursor Text Highlight**，不是右键菜单里那个手动涂色的 Highlight。前者点一下就亮，点到别处就换；后者要自己选颜色，会留在当前程序里。

## 改成左键

在 Code Browser 里打开 **Edit → Tool Options**，左上角搜索 `highlight`，找到 **Mouse Button To Activate**。选项树里的位置是 **Listing Fields → Cursor Text Highlight**。

![Untitled](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/Untitled.png)

默认值是 `MIDDLE`。

![tmp](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/tmp.png)

改成 `LEFT`，点 OK。不用重启 Ghidra，也不用重新分析。这是工具选项，不是某个程序的设置：换一个二进制打开仍然有效；换电脑，或者删掉 `~/.ghidra` 里对应版本的工具配置，就要重设。

改完后，在 Listing 或反编译窗口用左键点变量、寄存器或立即数，相同文本会高亮。两个窗口共用这一项，不用各改一次。点到另一处文本，高亮换成新的。

## 它亮的不是「整个程序里的同名变量」

范围是**当前函数**。别的函数里也叫 `local_18` 的变量不会亮。

匹配的是光标下的文本，不是数据流。两个名字一样、其实无关的局部变量会一起亮。寄存器稍好一点：同一组里的 **Scope Register Operand** 打开后，读和写用不同颜色，不单是把名字涂满。

所以它适合快速看「这个名字在这个函数里出现了哪几次」，不适合代替右键的 **References** 或反编译里对变量的重命名。

## 什么时候留着中键

左键本来用来移动光标和选中。改成 `LEFT` 之后每次点击都会重画高亮，函数很长时会闪。鼠标有中键就保持 `MIDDLE`，按下滚轮来高亮。

macOS 触控板没有中键，可以在系统设置里把三指点按当作中键，这样左键还能用来导航。三指点按也不想开，再用 `LEFT`。

想给一条路径留一个不会随点击消失的颜色，用右键的 Highlight。那和 Mouse Button To Activate 无关。

> 感谢 [https://www.youtube.com/watch?v=dW8YFRX2BGk](https://www.youtube.com/watch?v=dW8YFRX2BGk)
