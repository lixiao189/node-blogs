---
title: "天堂之门——西湖论剑 Dual personality 题解"
publishDate: "5 Mar 2023"
description: "一个天堂之门逆向题目, 然后还加入了神奇的 Windows 反调试机制, 不愧是西湖论剑啊"
tags: ["CTF", "RE"]
---

### 坐牢感想

md，因为要准备期末考试再加上买了新主机以后~~一直都在玩泰拉瑞亚~~，所以到现在才有题解。

以往 CTF 的 Windows RE 至少调试没啥问题，就算再怎么恶心上调试器就可以做出来了，结果这次
这个天堂之门直接不给你用常规的调试工具调试的。导致这次被卡了很久。

而且因为天堂之门 x86 和 x64 代码混杂，导致 IDA F5 是直接无法工作的。所以这次只能全程看汇编力。
还好出题人够仁慈没有在全程汇编的情况下塞个 AES RC4 啥复杂的算法。

而且我的 Mac 还是 Arm 的，以前 Windows Arm 可以直接运行 RE 题目程序，但是这次因为用了天堂之门
这个邪门的调试技术，导致我虚拟机直接废了，就算用 UTM 虚拟机直接硬装了个 X86 Windows 7 好像也运行不了，
真的吐了。

而且这次还有一个非常让人没想到的检测调试器的手段，导致我就算这几天做了很久也一直被卡。

### 天堂之门

天堂之门技术就是一个在 Windows 程序执行的时候通过类似 jmp 0x33:0x4012d0 这样的指令，让 CS
寄存器直接切换到 0x33，这样 Windows 就会让程序直接运行在 64 位环境。因为这个原因 x64dbg 这样的
普通调试工具直接就 GG 了。

后面我找到 flare on 5 有一个题目 Wow，一样也是天堂之门程序的逆向。

[https://blog.attify.com/flare-on-5-writeup-part5/?utm_source=pocket_saves](https://blog.attify.com/flare-on-5-writeup-part5/?utm_source=pocket_saves)

在这个文章里面，作者是直接使用 windbg 64 位调试的。然后我尝试了一下，发现还真的可以，而且虽然
windbg 是 64 位的调试工具，但是似乎在程序刚开始在 32 位模式下工作的时候，也能正确识别汇编和下断点。

![使用 windbg64 位调试](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/vgl5nT.png)

windbg 教程有不少，网上找找罢。我这里就列举几个比较常用的命令

- `bp 0x1234` 在 0x1234 处下断点
- `bl` 列出所有断点
- `lm` 列出所有模块的内存地址
- `g` 运行到断点

### 反汇编

在经过调试以后，我们可以知道 `0x4011D0` ~ `0x4012E5` 这个地址范围内的代码都是 64 位的 IDA 无法正常反汇编。
所以我们使用 capstone 这个 python 库来进行反汇编

```python
from capstone import Cs
from capstone import CS_ARCH_X86
from capstone import CS_MODE_32
from capstone import CS_MODE_64

uc32 = Cs(CS_ARCH_X86, CS_MODE_32)
uc64 = Cs(CS_ARCH_X86, CS_MODE_64)

f = open('./prog.exe', 'rb')
file = f.read()
f.close()

text_offset = 0x400     # offset of text segement
base_addr = 0x400000    # base addr of prog
text_addr = 0x401000    # address of text enter point

start_addr = 0x4011D0
end_addr = 0x4012E5

code64 = file[text_offset + start_addr -
              text_addr: text_offset + end_addr - text_addr]

code64_insn = list(uc64.disasm(code64, start_addr))

for i in code64_insn:
    print("addr:{:7}|size:{:2}|{:12}{}".format(
        hex(i.address), i.size, i.mnemonic, i.op_str))
```

经过上面的反调试可以输出一下汇编代码

```asm
addr:0x4011d0|size: 9|mov         rax, qword ptr gs:[0x60]
addr:0x4011d9|size: 3|mov         al, byte ptr [rax + 2]
addr:0x4011dc|size: 7|mov         byte ptr [0x40705c], al
addr:0x4011e3|size: 2|test        al, al
addr:0x4011e5|size: 2|jne         0x4011f5
addr:0x4011e7|size: 6|mov         r12d, 0x5df966ae
addr:0x4011ed|size: 8|mov         dword ptr [0x407058], r12d
addr:0x4011f5|size: 6|mov         eax, 0x407000
addr:0x4011fb|size: 3|ljmp        [rax]
addr:0x4011fe|size: 1|int3
addr:0x4011ff|size: 1|int3
addr:0x401200|size: 1|push        rbp
addr:0x401201|size: 3|mov         rbp, rsp
addr:0x401204|size: 9|movabs      al, byte ptr [0x40705c]
addr:0x40120d|size: 2|test        al, al
addr:0x40120f|size: 2|je          0x401245
addr:0x401211|size: 4|mov         rax, qword ptr [rbp + 0x10]
addr:0x401215|size: 3|mov         rbx, qword ptr [rax]
addr:0x401218|size: 4|rol         rbx, 0x20
addr:0x40121c|size: 3|mov         qword ptr [rax], rbx
addr:0x40121f|size: 4|mov         rbx, qword ptr [rax + 8]
addr:0x401223|size: 4|rol         rbx, 0x20
addr:0x401227|size: 4|mov         qword ptr [rax + 8], rbx
addr:0x40122b|size: 4|mov         rbx, qword ptr [rax + 0x10]
addr:0x40122f|size: 4|rol         rbx, 0x20
addr:0x401233|size: 4|mov         qword ptr [rax + 0x10], rbx
addr:0x401237|size: 4|mov         rbx, qword ptr [rax + 0x18]
addr:0x40123b|size: 4|rol         rbx, 0x20
addr:0x40123f|size: 4|mov         qword ptr [rax + 0x18], rbx
addr:0x401243|size: 2|jmp         0x40127c
addr:0x401245|size: 4|mov         rax, qword ptr [rbp + 0x10]
addr:0x401249|size: 3|mov         rbx, qword ptr [rax]
addr:0x40124c|size: 4|rol         rbx, 0xc
addr:0x401250|size: 3|mov         qword ptr [rax], rbx
addr:0x401253|size: 4|mov         rbx, qword ptr [rax + 8]
addr:0x401257|size: 4|rol         rbx, 0x22
addr:0x40125b|size: 4|mov         qword ptr [rax + 8], rbx
addr:0x40125f|size: 4|mov         rbx, qword ptr [rax + 0x10]
addr:0x401263|size: 4|rol         rbx, 0x38
addr:0x401267|size: 4|mov         qword ptr [rax + 0x10], rbx
addr:0x40126b|size: 4|mov         rbx, qword ptr [rax + 0x18]
addr:0x40126f|size: 4|rol         rbx, 0xe
addr:0x401273|size: 4|mov         qword ptr [rax + 0x18], rbx
addr:0x401277|size: 5|mov         ebx, 0
addr:0x40127c|size: 5|mov         ebx, 0
addr:0x401281|size: 3|xor         rax, rax
addr:0x401284|size: 3|mov         rsp, rbp
addr:0x401287|size: 1|pop         rbp
addr:0x401288|size: 3|retf        8
addr:0x40128b|size: 1|int3
addr:0x40128c|size: 1|int3
addr:0x40128d|size: 1|int3
addr:0x40128e|size: 1|int3
addr:0x40128f|size: 1|int3
addr:0x401290|size: 3|xor         rax, rax
addr:0x401293|size:10|movabs      rax, 0x4014c5
addr:0x40129d|size: 7|mov         dword ptr [0x407000], eax
addr:0x4012a4|size: 8|lea         rax, [0x407014]
addr:0x4012ac|size: 2|mov         bl, byte ptr [rax]
addr:0x4012ae|size: 3|mov         cl, byte ptr [rax + 4]
addr:0x4012b1|size: 2|and         bl, cl
addr:0x4012b3|size: 2|mov         byte ptr [rax], bl
addr:0x4012b5|size: 3|mov         bl, byte ptr [rax + 4]
addr:0x4012b8|size: 3|mov         cl, byte ptr [rax + 8]
addr:0x4012bb|size: 2|or          bl, cl
addr:0x4012bd|size: 3|mov         byte ptr [rax + 4], bl
addr:0x4012c0|size: 3|mov         bl, byte ptr [rax + 8]
addr:0x4012c3|size: 3|mov         cl, byte ptr [rax + 0xc]
addr:0x4012c6|size: 2|xor         bl, cl
addr:0x4012c8|size: 3|mov         byte ptr [rax + 8], bl
addr:0x4012cb|size: 3|mov         bl, byte ptr [rax + 0xc]
addr:0x4012ce|size: 2|not         bl
addr:0x4012d0|size: 3|mov         byte ptr [rax + 0xc], bl
addr:0x4012d3|size: 3|xor         rax, rax
addr:0x4012d6|size: 7|jmp         qword ptr [0x407050]
addr:0x4012dd|size: 1|int3
addr:0x4012de|size: 1|int3
addr:0x4012df|size: 1|int3
addr:0x4012e0|size: 1|push        rbp
addr:0x4012e1|size: 2|mov         ebp, esp
addr:0x4012e3|size: 1|pop         rbp
addr:0x4012e4|size: 1|ret
```

### 反调试检测

这次的反调试检测手段真的很隐蔽，我是第一次见到。在内存地址为 0x4011d0
的地方有一个汇编指令：`mov         rax, qword ptr gs:[0x60]`，一开始我还不知道这是用来检测程序是否被调试器调试的
后面看了别人的题解才知道原来这个是用来反调试的。

![gs:0x60 反调试](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/FBW97m.png)

所以在读上面的汇编代码的时候要注意 0x40705c 这个地址存放的变量。如果这个变量为 0，则程序没有被调试。

这个题目还是有两个地方用到了这个变量的，就在上一步生成的 x64 汇编代码那里

### 解密算法

根据阅读汇编代码结合 windbg 调试，很快就能知道这个代码的算法了。这个地方我直接丢出来我的解密程序，
有需要的可以看看是哪个地方自己写错了。

```cpp
#include <algorithm>
#include <iomanip>
#include <iostream>

using namespace std;

const int N = 32;

unsigned char data[] = {0x0AA, 0x4F,  0x0F, 0x0E2, 0x0E4, 0x41,  0x99, 0x54,
                        0x2C,  0x2B,  0x84, 0x7E,  0x0BC, 0x8F,  0x8B, 0x78,
                        0x0D3, 0x73,  0x88, 0x5E,  0x0AE, 0x47,  0x85, 0x70,
                        0x31,  0x0B3, 0x9,  0x0CE, 0x13,  0x0F5, 0x0D, 0x0CA};

unsigned int key0 = 0x5df966ae - 0x21524111; // 0x3ca7259d
unsigned char key1[] = {0x04, 0x77, 0x82, 0x4a};

unsigned long long ror(unsigned long long value, int shift) {
  const int bits = sizeof(unsigned long long) * CHAR_BIT;
  shift %= bits; // 防止移位数大于整数位数

  // 对于移位数为 0，直接返回原值
  if (shift == 0) {
    return value;
  }

  // 将右移和左移分开计算，然后按位或运算得到结果
  return (value >> shift) | (value << (bits - shift));
}

int main() {
  // first
  for (int i = 0; i < N; i++) {
    data[i] ^= key1[i % 4];
  }

  // second
  *((unsigned long long *)data) = ror(*((unsigned long long *)data), 0xc);
  *((unsigned long long *)data + 1) =
      ror(*((unsigned long long *)data + 1), 0x22);
  *((unsigned long long *)data + 2) =
      ror(*((unsigned long long *)data + 2), 0x38);
  *((unsigned long long *)data + 3) =
      ror(*((unsigned long long *)data + 3), 0xe);

  // third
  unsigned int cur_key;
  for (int i = 0; i < 8; i++) {
    cur_key = key0;
    key0 ^= *((unsigned int *)data + i);

    *((unsigned int *)data + i) =
        (*((unsigned int *)data + i) - cur_key) & 0xffffffff;
  }

  for (int i = 0; i < N; i++) {
    cout << (char)data[i];
  }
  cout << endl;

  return 0;
}
```
