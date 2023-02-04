---
title: "花指令行为大赏"
publishDate: "4 Feb 2023"
description: "记录一些花指令的原理，有些花指令还是很恼人的"
tags: ["CTF", "RE"]
---

好家伙，今天本来想开一个 CTF 做做，结果这个题目不知道为啥，把源代码都丢上来了。艹······

不过给了就好好学学吧，可以看到这个代码里面是带了一堆花指令的。刚好我一直弄不明白花指令是个什么东西，现在刚好有现成的源代码学习，这下终于给整明白了。

那么，这个文章就用来记录一下我遇到的一些花指令吧，先从这个题目中的花指令开始

## 花指令 1 鉴赏

```cpp
_asm {
	call sub2
	_emit 0xEB
	jmp label2
sub2:
	add dword ptr[esp],1 ; esp 处指定的数字 + 1，返回的时候 eip 会跳过 _emit 0xE8
	retn
label2:
}
```

我们先来看看这段代码是如何运行的，这段代码中可能 \_emit 这个伪代码有点陌生，这个东西主要是用来在汇编中插入数据用的，相当于在 `call sub2` 和 `jmp label2` 这个指令中间插入了 0xEB 这个数据

然后我们来看看这个代码是如何执行的，首先这个代码执行 `call sub2` ，执行这个代码的时候首先会将 eip 指向 \_emit 0xEB 这个数据，然后会将 eip 的值 push 入系统栈。然后转到 sub2 这个地方继续执行。

然后在 sub2 这个地方，代码将 esp 指向的数据 +1，而这个数据其实就是刚刚 push 入栈的先前 eip 数据，将 eip 数据 + 1 了以后，之后在执行 retn 的时候 `pop eip`，就会跳过 `_emit 0xEB`，执行 `jmp label2`，

所以可以看到这个地方 \_emit 0xEB 插入了一个寂寞，但是做反逆向的人可不是乱加的，这可是有备而来。

因为 0xEB 对应的汇编指令是 jmp 指令，就算是 IDA 采用了什么牛逼哄哄的递归下降反汇编算法，毕竟不是真的执行代码，所以他还是会在分析 `call sub2` 这个指令之后，一边分析 sub2 的子过程代码，还会直接分析 `call sub2` 后的代码，于是 `_emit 0xEB` 插入的数据还是会被当成 jmp 指令来分析，然后导致 IDA 的分析出错。