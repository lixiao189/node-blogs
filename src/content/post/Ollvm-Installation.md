---
title: "OLLVM 环境如何安装"
publishDate: "27 May 2023"
description: "OLLVM 毕竟是一个 C++ 项目, 今天尝试了很多方法都没有编译成功，最后找到了 Docker 这种算是稳定成功的方法吧"
tags: ["RE", "config"]
---

搭建这个环境，只需要你的电脑上有 Docker 即可，如果需要和 ndk 还有 xcode 联动啥的可能还需要更多的操作，这里仅仅介绍
Linux 版本的 Ollvm 编译环境搭建。

首先先下载源代码

```bash
git clone -b llvm-4.0 --depth=1 https://github.com/obfuscator-llvm/obfuscator.git
```

然后再下载 Docker 镜像

```bash
docker pull nickdiego/ollvm-build
```

然后再下载这个脚本

[https://github.com/nickdiego/docker-ollvm/blob/master/ollvm-build.sh](https://github.com/nickdiego/docker-ollvm/blob/master/ollvm-build.sh)

最后运行这个脚本就能编译了。假如说你的 ollvm 源代码在 `ollvm/source/dir/build_docker`，最后只要执行这个命令就可以了

```bash
./ollvm-build.sh ollvm/source/dir
```

经过漫长的等待，最后我们就能得到一分编译好的 ollvm 了。接下来我们来跑跑看控制流平坦化。

首先将下面的代码保存为, `main.c`, 编译一份这个代码

```cpp
#include <stdio.h>
#include <stdlib.h>

int encryptFunc(int inputNum_1,int inputNum_2){
    int tmpNum_1 = 666, tmpNum_2 = 888, tmpNum_3 = 777;
    return tmpNum_1 ^ tmpNum_2 + tmpNum_3 * inputNum_1 - inputNum_2;
}

int main(int argc,char *argv[]){

    int printNum = 55;
    if (argc > 1)
    {
        printNum = encryptFunc(printNum, atoi(argv[1]));
    }else{
        printNum = encryptFunc(printNum, argc);
    }

    printf("Hello OLLVM %d\r\n", printNum);

    return 0;
}
```

然后再用 ollvm 的编译器编译用如下命令编译这个代码

```bash
clang -mllvm -fla -mllvm -split -mllvm -split_num=3 main.c -o main
```

然后我们用 Ghidra 打开编译好的代码，发现已经是一坨答辩力。

![Ghidra 反编译结果](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/eo5dYD.png)

![控制流平坦化后的流程图](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/x9Ku7f.png)
