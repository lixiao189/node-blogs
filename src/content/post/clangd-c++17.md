---
title: "给 clangd 添加 C++ 17 支持"
publishDate: "15 Mar 2023"
updatedDate: "28 Oct 2026"
description: "clangd 不读 Makefile。在 config.yaml 里按扩展名追加 -std=c++17；已有 compile_commands.json 时，后加的 -std 会盖过旧标准。"
tags: ["clangd", "C++", "config"]
---

给 Emacs 装上 lsp-mode 之后，跳转是有了，一写 `std::optional` 或结构化绑定就报错。命令行里我会加 `-std=c++17`，编辑器里没有。

两边不是同一条命令。苹果自带的 `clang++` 不加 `-std` 时，老版本默认是 `gnu++14` 甚至更早。clangd 也不读 Makefile。没有 `compile_commands.json` 时，它大致按 `clang 文件名` 来解析，编辑器就停在旧标准上。

clangd 11 起可以在配置文件里改解析参数。读这个文件的是 clangd，不是 Emacs。

## 文件放哪

这台机器上所有项目都生效，用用户配置：

- macOS：`~/Library/Preferences/clangd/config.yaml`
- Linux：`$XDG_CONFIG_HOME/clangd/config.yaml`，一般是 `~/.config/clangd/config.yaml`
- Windows：`%LocalAppData%\clangd\config.yaml`，一般是 `C:\Users\<用户名>\AppData\Local\clangd\config.yaml`

只对当前仓库生效，就在仓库根目录放文件 `.clangd`（是文件，不是目录）。项目标准应该跟仓库走，优先用这个，并且可以提交。

目录不存在就自己建。用户配置的文件名必须是 `config.yaml`。

## 只给 C++ 文件加 -std=c++17

```yaml
If:
  PathMatch: .*\.(cc|cpp|cxx|hh|hpp|hxx)
CompileFlags:
  Add: [-std=c++17]
```

`If` 的大小写不能改。`PathMatch` 是正则，而且要匹配整条路径。用户配置里这条路径是绝对路径，项目 `.clangd` 里是相对路径，分隔符都是 `/`。上面这一条能盖住常见的 C++ 后缀。

不要把 `.c` 写进来。`-std=c++17` 会让 clang 把 C 文件当 C++ 解析。

多个条件要同时满足。同一个键写成列表则是「或」。两段互斥的配置用 `---` 隔开：

```yaml
If:
  PathMatch: .*\.(cc|cpp|cxx|hh|hpp|hxx)
CompileFlags:
  Add: [-std=c++17]
---
If:
  PathMatch: .*\.c
CompileFlags:
  Add: [-std=c11]
```

保存后继续编辑，clangd 会重新读配置。Emacs 里诊断还是旧的，就执行 `M-x lsp-workspace-restart`。

用一段只有 C++17 才合法的代码确认：

```cpp
#include <optional>
#include <string_view>
#include <utility>

std::optional<std::string_view> name() {
	auto [ok, n] = std::pair{true, std::string_view{"ok"}};
	return ok ? std::optional{n} : std::nullopt;
}
```

红线消失，说明 `-std=c++17` 已经加到 clangd 的命令上了。

## .h 和 compile_commands.json

`.h` 没进上面的正则。被 `.cpp` 包含进去的头文件，用的是那个 `.cpp` 的编译参数，标准会跟着走。只有在编辑器里直接打开 `.h`、又没有编译数据库时，才会落回默认标准。需要的话再加 `PathMatch: .*\.h`，但仓库里混有 C 头文件时会误伤。

已经有 `compile_commands.json` 时（CMake 打开 `CMAKE_EXPORT_COMPILE_COMMANDS`，或用 `bear -- make` 生成），clangd 用里面的命令。`Add` 是追加到这条命令末尾。clang 对重复的 `-std` 取最后一个，所以追加的 `-std=c++17` 通常能盖过数据库里的 `-std=c++14`。

盖不住时先删掉旧的。`Remove` 里以 `*` 结尾的项按前缀匹配，YAML 里要加引号，避免 `*` 被当成别名：

```yaml
CompileFlags:
  Remove: ["-std=*"]
  Add: [-std=c++17]
```

同一段 `CompileFlags` 里刚刚 `Add` 的旗标，不会被这段自己的 `Remove` 删掉。

这份配置只影响编辑器怎么解析。`make` 出来的二进制还是看 Makefile 或 CMake。两边不一致时，会出现编辑器不报错、编译失败，或者反过来。

## 还是报错的话

- 后缀没进 `PathMatch`。用户配置匹配的是绝对路径，正则写错整段都不生效。
- 项目 `.clangd` 和用户 `config.yaml` 同时存在时，用户配置优先，然后才是更靠近源文件的项目配置。
- `-I` 和路径要分成两个列表项。写成一个字符串会被当成非法旗标。`-std=c++17` 只有一个词，没有这个问题。
- 找不到头文件、宏没定义，优先去补 `compile_commands.json`。只加 `-std` 修不了 include。
