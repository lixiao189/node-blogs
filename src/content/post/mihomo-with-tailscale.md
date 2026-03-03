---
title: "如何让某科学的代理工具的 TUN 和 tailscale 共存"
publishDate: "3 Mar 2026"
description: "这里存档一份如何让 tailscale 和 mihomo tun 共存的配置"
tags: ["config", "mihomo"]
---

## 问题背景

这几天在家里搭建了一个 x86 主机用来跑一些代码，但是为了加速代码的拉取需要进行科学上网。这里使用 mihomo + TUN 的方案。

然后远程组网使用 tailscale + derp 中转的方式。但是 tailscale 组网也是使用的 TUN，所以网上很多现存的 clash 配置会和 TUN 冲突。由于网上相关的教程都很少，这里记录一下最终的解决方案。

## 配置说明

最原版的配置来自 [配置链接](https://github.com/HenryChiao/MIHOMO_YAMLS/blob/main/THEYAMLS/Official_Examples/Metacubex/geox_config.yaml)

这里对这个配置进行了一定程度的魔改。

首先在这个地方需要关闭 fake-ip, 最后的 dns 配置如下：

```yaml
dns:
  enable: true # 启用 DNS 模块
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
```

接下来需要修改 tun 相关的配置，设置分流规则让 tailscale 相关的流量不走 TUN 网卡

```yaml
interface-name: "wlo1" # TUN 最后使用的上网网卡，用 ifconfig 看就行, 我这是我的 wifi 网卡
tun:
  enable: true
  stack: system
  auto-route: true
  auto-redirect: true
  auto-detect-interface: false # 手动指定 TUN 的出口网卡，不指定会导致 tailscale 登录失败
  exclude-interface:
    - tailscale0
  route-exclude-address: # 分流
    - 100.64.0.0/10
    - fd7a:115c:a1e0::/48
```

最后成品如下：

https://gist.github.com/lixiao189/a66ba99f3544ea0d98be02d09f22ab5e
