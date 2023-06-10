---
title: "2023 年安询杯 ezcpp 题解"
publishDate: "10 Jun 2023"
description: "比较恶心的花指令题目尤其是第一个加密算法"
tags: ["RE", "CTF"]
---

这个题目中有很多花指令来混淆我们的代码.

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610160627.png)

这里以 main 函数中的混肴为例子，介绍怎么去花指令，然后让 ida 重新能将这个函数识别出来。

首先我们可以看到这里有一个 `jb loc_413b94 + 3` 的指令，这个指令说明 `loc_413b94` 处有一段花指令，真正的代码要到 `loc_413b94 + 3` 处才开始。

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610160907.png)

右键这个位置，然后点击 undefine

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610161046.png)

然后我们将真正跳转到的地方，设置为 code 类型

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610161150.png)

但是这样就算让 ida 认识出来哪些是花指令还不够，因为出题人很鸡贼，这个地方跳转用的 jz，ida 会以为下面那坨花指令会被执行。但是我们可以看到跳转指令上方还有个 `xor eax, eax` 的指令，这个指令会将 eax 清零，所以这个 jz 指令是一定会跳转走的。我们这里用 ida 的 patch 功能将 `jz` 改为 `jmp` 就能让 ida 真的意识到下面一段代码是花指令。

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610161243.png)

接下来我们用 keypatch 插件修改跳转指令

> keypatch 这个插件应该在 52pojie 官方那里下载的 IDA 应该是自带的，如果没有的话可以去 52pojie 官方下载一个

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610161530.png)

如此这般，将所有的花指令去除了以后，就可以开始调试了。

---

接下来，我们可以看到有 3 个加密函数

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610161947.png)

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610162016.png)

其中前两个是用的面向对象写法，调用了两个对象的虚函数，因为虚函数只能在运行的时候才能知道执行了啥（C++ 多态的知识），所以前两个加密函数用动态调试就能知道是啥了。

第三个加密函数应该是最简单的，就是把数字的二进制反过来，然后再加 1。

第二个加密函数虽然比较复杂，写出对应的逆向代码不难。

主要是第一个加密函数最阴间，因为有不止一种可能。所以这里采用的是暴力破解的方法。输出每一个字节有哪些可能性。然后在这些可能性中找到一个能够满足条件的就行了。

```cpp
// Enc1
  int tmp_result;
  for (int i = 0; i < 32; i++) {
    bool find_v3 = false;
    for (int v3 = 0; v3 < 128; v3++) {
      int result;
      if ((v3 - 61) <= 0x3Eu) {
        result = v3;
        int v7 = v3 + 13;
        if (v3 > 90) {
          if (v7 <= 122)
            tmp_result = v3 + 13;
          else
            tmp_result = v3 - 13;
        } else {
          result = -13;
          if (v7 <= 90)
            result = 13;
          result = v3 + result;
          tmp_result = result;
        }
      }

      if (tmp_result == arr[i] && check(v3)) {
        find_v3 = true;
        cout << (char)v3;
      }
    }
    if (!find_v3) {
      cout << (char)arr[i];
    }
    cout << " ";
  }
```

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610162520.png)

运行结果是这样的。假如说某个字节有多种可能性就会一块输出，然后一眼丁真，flag 是 `SYC{Y3S-yE5-y0u-S0Ve-Th3-C9P!!!}`

可以看到这个是正确 flag 捏

![](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/20230610162741.png)
