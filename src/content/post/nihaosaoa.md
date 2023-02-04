---
title: "CTF 你好骚啊题解"
publishDate: "4 Feb 2023"
description: "一个简单的 CTF 逆向题目当时还是做了很久的"
tags: ["CTF", "RE"]
---

### 二进制文件信息获取

首先不废话，先直接上 Detect It Easy 来看看这个二进制文件。

可以知道这是一个没有加壳的 64 位 Linux 程序。

![](https://www.hualigs.cn/image/60bc9be9b154c.jpg)

### 静态分析

之后拖入 IDA 进行静态分析，发现没有去除符号，直接就找到了 main 函数，然后对这个函数进行 F5

![image.png](https://s2.loli.net/2023/02/04/OiDjhsoABX7rWbH.png)

可以看到 RxEncode 这个函数就是关键点，这是一个加密函数，点进去看看。

最让人在意的是这部分伪代码

```cpp
if (user_input[lengthPlusOne - 1] == '=') v4 = 1;
if (user_input[lengthPlusOne - 2] == '=') ++v4;
if (user_input[lengthPlusOne - 3] == '=') ++v4;
if (v4 == 3) {
    v3 += 2;
} else if (v4 <= 3) {
    if (v4 == 2) {
        v3 += 3;
    } else if (v4 <= 2) {
        if (v4) {
            if (v4 == 1) v3 += 4;
        } else {
            v3 += 4;
        }
    }
}
```

这部分伪代码统计了末尾 = 号的的个数，然后和 = 号有关的编码，似乎只有 base 系列编码了，这下我们可以猜测这个地方的编码和 base64 有关。之后我们还能看到这个伪代码，这个伪代码表示结果数据的长度是用户输入数据的长度的 3 / 4 倍有关，这样一想，更像是 base64 了。

```
v3 = 3 * (a2 / 4);
```

----------- 华丽的分割线 --------------------

![image.png](https://s2.loli.net/2023/02/04/IXRDJxEq9zS2rYn.png)

然后这个地方就是对用户输入编码的最主要的部分的程序，我们可以看到这里这个程序用了 find_pos 来找输入的每一个字节的数据在一个字符串中的位子。我们来看看这个字符串是什么？

`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234{}789+/=`

很明显这就是一个魔改的 base64 表。从上面的那个编码逻辑中可以看出来，

v5(数组下标) < a2(输入总长度) - v4(结尾 = 号的个数)

所以这个表中的 = 是多余的。然后我们一数，发现和常见的 base64 表的长度刚好能对上，从 find_pos 的行为，到这个表，再加上 3 / 4 这个长度比，从这些迹象我们可以知道这个编码算法大概是在做 base64 解码的工作。

之后回到 main 函数，找到需要编码的数据

![image.png](https://s2.loli.net/2023/02/04/DlbgHfiUKBpmxRn.png)

接下来干就完了！

### 上脚本干他

之后我们将这个数据转换成 python 能识别的 64 位格式的二进制数据字符串

```cpp
#include <iostream>
#include <cstring>

int main() {
    unsigned long long s[] = {
        0xFD370FEB59C9B9E,
        0xDEAB7F029C4FD1B2,
        0xFACD9D40E7636559,
        0x4,
        0x0
    };


    for (int i = 0; i < 25; i++) {
        int c = (int) * ((unsigned char *) (s) + i);
        std::cout << "\\x" << std::hex << c;
    }
    std::cout << std::endl;

    return 0;
}
```

运行结果：

`\x9e\x9b\x9c\xb5\xfe\x70\xd3\xf\xb2\xd1\x4f\x9c\x2\x7f\xab\xde\x59\x65\x63\xe7\x40\x9d\xcd\xfa\x4`

注意这里有些数据 `\x` 后面不是 2 位，为了能让 python 脚本跑起来，我们在这里手动补齐。

比如说 `\xf` 这个数据就要手动补齐为 `\x0f`

之后就是上脚本按题目意思编码就完了 ~~别吐槽为啥我要先 c++后 python 了~~。

> 建议自己准备一个可以解码/编码任意 base64 表的脚本，魔改 base64 的题目在逆向中还是挺常用的

```python
# coding:utf-8
s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234{}789+/'
def My_base64_encode():
    inputs = b'\x9e\x9b\x9c\xb5\xfe\x70\xd3\x0f\xb2\xd1\x4f\x9c\x02\x7f\xab\xde\x59\x65\x63\xe7\x40\x9d\xcd\xfa\x04'
    # 将字符串转化为2进制
    bin_str = []
    for i in inputs:
        x = str(bin(i)).replace('0b', '')
        bin_str.append('{:0>8}'.format(x))
    # print(bin_str)
    # 输出的字符串
    outputs = ""
    # 不够三倍数，需补齐的次数
    nums = 0
    while bin_str:
        # 每次取三个字符的二进制
        temp_list = bin_str[:3]
        if(len(temp_list) != 3):
            nums = 3 - len(temp_list)
            while len(temp_list) < 3:
                temp_list += ['0' * 8]
        temp_str = "".join(temp_list)
        # print(temp_str)
        # 将三个8字节的二进制转换为4个十进制
        temp_str_list = []
        for i in range(0, 4):
            temp_str_list.append(int(temp_str[i*6:(i+1)*6], 2))
        # print(temp_str_list)
        if nums:
            temp_str_list = temp_str_list[0:4 - nums]

        for i in temp_str_list:
            outputs += s[i]
        bin_str = bin_str[3:]
    outputs += nums * '='
    print("Encrypted String:\n%s " % outputs)
My_base64_encode()
```

运行结果：

```
Encrypted String:
npuctf{w0w+y0U+cAn+r3lllY+dAnc3}BA==
```

不难看出 `npuctf{w0w+y0U+cAn+r3lllY+dAnc3}` 就是我们需要的 flag 了
