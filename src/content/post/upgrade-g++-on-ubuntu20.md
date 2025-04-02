---
title: "解决 Ubuntu 20.04 上 g++ 版本太低的问题"
publishDate: "2 Apr 2025"
description: "最近需要在 ubuntu 20.04 上编译使用 c++20 的项目，但是自带的 g++ 9 并非完全支持 c++20"
tags: ["C++"]
---

## 添加 PPA 源

```bash
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt update
```

## 安装 g++ 13 / gcc 13

```bash
sudo apt install g++-13
sudo apt install gcc-13
```

## 设置 g++ 13 / gcc 13 为默认版本

```bash
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-13 100
sudo update-alternatives --config g++
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-13 100
sudo update-alternatives --config gcc
```
