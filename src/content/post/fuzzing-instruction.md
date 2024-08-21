---
title: "Fuzzing 插桩代码的作用"
publishDate: "21 Aug 2024"
description: "Fuzzing 中使用了几个神秘的插桩代码，用来记录触发覆盖率"
tags: ["fuzz"]
---

插桩代码如下

```cpp
cur_location = <COMPILE_TIME_RANDOM>; # cur_location 值是随机生成的，以简化链接复杂项目的过程并保持 XOR 输出均匀分布。
shared_mem[cur_location ^ prev_location]++; # 由调用者传递给检测的二进制文件。
prev_location = cur_location >> 1; # 保持元组的方向性 以区分 A^B 和 B^A ,并保持紧密循环的标识,区分A^A,B^B
```

![hash for edge](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/xpmPQR.png)

这个地方我们需要让 fuzzing 工具标记 fuzzing 工具找到了如下的一个代码块转移边 `R1 -> R2`

第三行代码主要是为了区分 `R1 -> R2` 和 `R2 -> R1` 两种情况

覆盖率主要关心代码块转移被怎么触发了。
