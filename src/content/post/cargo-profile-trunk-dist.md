---
title: "Trunk 每次构建都要重编 270 个 crate？问题出在 cargo profile 的名字上"
publishDate: "28 Oct 2026"
description: "记录一次 Rust + Trunk 的 wasm 项目增量编译失效的排查：自定义 cargo profile 和 trunk 的 dist 目录撞名，导致缓存每次都被清空"
tags: ["Rust", "wasm", "config"]
---

## 问题背景

最近在写一个 Bevy 的小游戏，客户端编译成 wasm 跑在浏览器里，用 [Trunk](https://trunk-rs.github.io/trunk/) 打包。项目里有一个 `make run`，会先用 `make web` 构建浏览器客户端，再启动服务端。

问题是：**每次跑 `make web`，哪怕一行代码都没改，都要重新编译一大堆依赖**。实测没改代码再跑一次，要 135s，重新编译了 273 个 crate。增量编译完全没有生效。

## 相关配置

为了压小玩家要下载的 wasm，客户端单独用了一个自定义 cargo profile：

```toml
# Cargo.toml
[profile.web]
inherits = "release"
opt-level = "s"
strip = true
```

在 Trunk 的 `index.html` 里指定这个 profile：

```html
<link data-trunk rel="rust" data-bin="evoclash" data-cargo-profile="web" data-wasm-opt="0">
```

Trunk 的输出目录放在 `target/web`，后端直接把这个目录当静态文件目录：

```toml
# Trunk.toml
[build]
target = "index.html"
dist = "../../target/web"
```

看出问题了吗？反正我第一眼没看出来。

## 排查过程

先确认现象：连续跑两次 `make web`，第二次依然重编了 273 个 crate，说明不是偶发。

接着看 cargo 的 fingerprint 日志（`CARGO_LOG=cargo::core::compiler::fingerprint=info`），发现每次都是 **build script 重新运行**，进而带着依赖它们的 crate 一起重编。build script 的编译产物找不到了，cargo 只能认为它们是脏的。

那 build script 的产物去哪了？这里要知道 cargo 的一个目录布局规则：

- 交叉编译（比如 `--target wasm32-unknown-unknown`）时，**目标平台**的产物放在 `target/<triple>/<profile>/`
- 但 build script、proc-macro 这类在**宿主机**上运行的东西，放在 `target/<profile>/`

而自定义 profile 的目录名就是 profile 名本身。profile 叫 `web`，宿主机产物就放在 `target/web/`。

而 `target/web/` 恰好是 Trunk 的 `dist` 目录。Trunk 每次构建结束时，会用新的产物**整个替换** dist 目录。于是：

1. cargo 把 build script 和 proc-macro 编译到 `target/web/`
2. Trunk 构建完成，把 `target/web/` 整个换成打包结果
3. 下一次构建，cargo 发现宿主机产物全没了，所有 build script、proc-macro 以及依赖它们的 crate 全部重编

缓存就这样每次都被 Trunk 清掉了。

## 修复

最简单的办法是让两个目录不再重叠。改 dist 路径要动 Makefile、CI、发版脚本和文档；改 profile 名只要改两行，所以选择把 profile 改名为 `wasm`：

```toml
# The browser client (`make web`): stripped and size-optimized, since players download it.
# Not named `web`: cargo keeps a profile's host build scripts and proc-macros in target/<profile>/,
# and target/web is trunk's dist dir, which trunk replaces on every build.
[profile.wasm]
inherits = "release"
opt-level = "s"
strip = true
```

```html
<link data-trunk rel="rust" data-bin="evoclash" data-cargo-profile="wasm" data-wasm-opt="0">
```

记得在配置里留一条注释说明为什么不能叫 `web`，不然以后谁顺手改回来又要踩一遍。

效果：

| 场景 | 修复前 | 修复后 |
|---|---|---|
| 没改代码，再跑一次 `make web` | 135s，编译 273 个 crate | 2s，0 个 |
| 改了客户端代码后重建 | 135s | 57s，只重编客户端 crate |

## 顺手加一个调试构建入口

缓存修好之后，改一行客户端代码还是要 57s。这部分时间主要花在 release 的 thin LTO 和 `codegen-units = 1` 上，是为了压 wasm 体积换来的，发版时不能动。但日常开发其实不需要 release。

Trunk 支持 `data-cargo-profile-release`，只在 `trunk build --release` 时使用指定的 profile，不带 `--release` 时就走 cargo 默认的 `dev` profile：

```html
<link data-trunk rel="rust" data-bin="evoclash" data-cargo-profile-release="wasm" data-wasm-opt="0">
```

然后在 Makefile 里用一个变量控制是否带 `--release`，再利用 make 的 target-specific variable 加两个调试入口：

```makefile
# Empty for the debug client (cargo `dev` profile); `--release` uses the size-optimized `wasm` profile.
TRUNK_FLAGS := --release

## dev: like `run`, but with a debug client: much faster to rebuild, slower in the browser
dev: TRUNK_FLAGS :=
dev: run

web:
	cd crates/client && trunk build $(TRUNK_FLAGS)

watch:
	cd crates/client && trunk watch $(TRUNK_FLAGS)

## watch-dev: `watch` for the debug client (pair with `make dev`)
watch-dev: TRUNK_FLAGS :=
watch-dev: watch
```

这样 `make run`、`make web` 还是原来的 release 构建，CI 和发版都不受影响；日常开发用 `make dev`，配合另一个终端跑 `make watch-dev` 自动重建。

对比：

| | 调试版 | release |
|---|---|---|
| 改客户端代码后重建 | 约 6s | 约 57s |
| 第一次冷构建 | 约 170s | 约 135s |
| `.wasm` 大小 | 约 130 MB | 约 38 MB |

调试版的 wasm 很大、运行也慢一点，但改完代码 6 秒就能在浏览器里看到效果，日常调试够用了。看性能还是用 release。

## 经验教训

1. **自定义 cargo profile 的名字会变成 `target/` 下的目录名**。给 profile 起名时，要避开 `target/` 下被其他工具占用的目录（dist、文档输出、覆盖率报告之类）。
2. **交叉编译时宿主机产物和目标产物分开放**：前者在 `target/<profile>/`，后者在 `target/<triple>/<profile>/`。只盯着 `target/wasm32-unknown-unknown/` 看，是看不出问题的。
3. **增量编译失效时，先看 fingerprint 日志**。`CARGO_LOG=cargo::core::compiler::fingerprint=info` 能直接告诉你每个 crate 为什么被判定为脏，比瞎猜快得多。
4. 把构建产物输出到 `target/` 里面图省事，但要意识到 `target/` 是 cargo 的地盘，往里放东西前先想想会不会撞名。
