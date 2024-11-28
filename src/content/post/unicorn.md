---
title: "Unicorn 从入门到入土"
publishDate: "28 Nov 2024"
description: "现在 CTF 线下赛有蓝军题目，第一次接触木马的溯源反制"
tags: ["RE", "CTF"]
---

最近去打了一次鹏城杯的线下赛，赛场上碰到了一个木马 DinodasRAT, 这个 C2 客户端
使用了一坨比较复杂的加密函数，因此我们这个地方解密流量可以使用 unicorn 进行解密

首先是数据包的格式，因为程序过于复杂，比赛结束了也没分析出来，这边直接拿网络上
的分析结论：首先会有 0x30 开头的一个固定字节，然后接下来 4 个字节是数据包的长度
最后就是加密数据了。来源：
[先知社区: 以中国为目标的DinodasRAT Linux后门剖析及通信解密尝试](https://xz.aliyun.com/t/14396?time__1311=GqAxuD9DgDRDcGDlxGo4%2BxCwhhruE%2BRe%2BcpD)

接下来就是调用 unicorn 进行解密，我们可以使用 unicorn 直接模拟执行函数代码。

但是缺陷就是如果遇到系统调用，这个工具没法直接运行，还有就是函数运行的时候因为
是使用寄存器传入参数的，因此我们需要手动模拟寄存器赋值，这样来进行模拟函数传参。

然后我们还需要把密钥和密文数据模拟传入内存中, 最后还要传入加密函数相关的代码进入内存。

接下来以这个木马文件为例演示一下：

我们需要用 unicorn 来调用解密函数，我们可以看到这个函数的地址为 `0x426090-0x4262BB`
![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/CR45s9.png)
同时还调用了一个 tea 解密函数，地址为 `0x426010-0x426085`
我们使用如下代码来把几个函数加载进 unicorn 模拟器的内存

```python
# Create the simulator
base = 0x400000
uc = Uc(UC_ARCH_X86, UC_MODE_64)
uc.mem_map(base, 1024 * 1024)


def write_code(base, start, end):
    func_start_offset = start - base
    func_end_offset = end - base
    func_code = code[func_start_offset : func_end_offset + 1]
    uc.mem_write(start, func_code)


write_code(base, 0x426090, 0x4262BB)  # tea decode caller
write_code(base, 0x426010, 0x426085)  # tea decode
```

然后可以看到这个地方需要依次传入 v 密文, 密文长度，k 密钥, 结果，和结果长度

我们可以在内存中对这几个变量开辟对应的内存来进行存储，然后把这些内存地址和变量值依次写入
`rdi, rsi, rdx, rcx, r8` 寄存器, 用来模拟 x64 Linux 系统的函数调用传参过程

```python
data_start = 0x431F00

# Write the data
data_addr = data_start
uc.mem_write(data_addr, bytes(data))

# Write the key
key_addr = data_addr + len(data)
uc.mem_write(key_addr, bytes(key))

# Calc the result buffer address
res_addr = key_addr + len(key)

# Calc the end number addr
end_number_addr = res_addr + len(data) + 1
end_number = 0x1000
uc.mem_write(end_number_addr, end_number.to_bytes(4, "little"))

# Pass the parameters
uc.reg_write(UC_X86_REG_RDI, data_addr)
uc.reg_write(UC_X86_REG_RSI, len(data))
uc.reg_write(UC_X86_REG_RDX, key_addr)
uc.reg_write(UC_X86_REG_RCX, res_addr)
uc.reg_write(UC_X86_REG_R8, end_number_addr)
```

最后设置栈空间, 和 RIP 寄存器

```python
# Calc the stack address
stack_len = 0x1000
stack_addr = end_number_addr + 8 + stack_len

uc.reg_write(UC_X86_REG_RIP, func_start)
uc.reg_write(UC_X86_REG_RSP, stack_addr)
uc.reg_write(UC_X86_REG_RBP, stack_addr)
```

最后所有代码如下：

```python
from os import _exit

from unicorn import UC_ARCH_X86, UC_MODE_64, Uc
from unicorn.unicorn import UcError
from unicorn.x86_const import (
    UC_X86_REG_R8,
    UC_X86_REG_RBP,
    UC_X86_REG_RCX,
    UC_X86_REG_RDI,
    UC_X86_REG_RDX,
    UC_X86_REG_RIP,
    UC_X86_REG_RSI,
    UC_X86_REG_RSP,
)

data = []  # 这个地方填入加密数据
data = data[0x30:]
data = data[5:]

key = [
    0xA1,
    0xA1,
    0x18,
    0xAA,
    0x10,
    0xF0,
    0xFA,
    0x16,
    0x06,
    0x71,
    0xB3,
    0x08,
    0xAA,
    0xAF,
    0x31,
    0xA1,
]

# Get the code
with open("./config", "rb") as f:
    code = f.read()

# Create the simulator
base = 0x400000
uc = Uc(UC_ARCH_X86, UC_MODE_64)
uc.mem_map(base, 1024 * 1024)


def write_code(base, start, end):
    func_start_offset = start - base
    func_end_offset = end - base
    func_code = code[func_start_offset : func_end_offset + 1]
    uc.mem_write(start, func_code)


write_code(base, 0x426090, 0x4262BB)  # tea decode caller
write_code(base, 0x426010, 0x426085)  # tea decode

func_start = 0x426090
func_end = 0x4262BB
data_start = 0x431F00

# Write the data
data_addr = data_start
uc.mem_write(data_addr, bytes(data))

# Write the key
key_addr = data_addr + len(data)
uc.mem_write(key_addr, bytes(key))

# Calc the result buffer address
res_addr = key_addr + len(key)

# Calc the end number addr
end_number_addr = res_addr + len(data) + 1
end_number = 0x1000
uc.mem_write(end_number_addr, end_number.to_bytes(4, "little"))

# Calc the stack address
stack_len = 0x1000
stack_addr = end_number_addr + 8 + stack_len

uc.reg_write(UC_X86_REG_RIP, func_start)
uc.reg_write(UC_X86_REG_RSP, stack_addr)
uc.reg_write(UC_X86_REG_RBP, stack_addr)

# Pass the parameters
uc.reg_write(UC_X86_REG_RDI, data_addr)
uc.reg_write(UC_X86_REG_RSI, len(data))
uc.reg_write(UC_X86_REG_RDX, key_addr)
uc.reg_write(UC_X86_REG_RCX, res_addr)
uc.reg_write(UC_X86_REG_R8, end_number_addr)


# Excute the code
try:
    uc.emu_start(func_start, func_end)
except UcError as e:
    print(e)
    print(uc.mem_read(res_addr, len(data)))
    _exit(-1)
print(uc.mem_read(res_addr, len(data)))
```
