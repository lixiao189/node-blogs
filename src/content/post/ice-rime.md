---
title: "Rime 输入法配置方案推荐：雾凇拼音"
publishDate: "1 Mar 2023"
description: "Rime 配置：雾凇拼音 | 长期维护的简体词库"
tags: ["Mac", "Rime", "config"]
---

之前用的 Rime 配置文件结构比较散乱，再加上原来作者在 GitHub 仓库里面直接插入了字体文件导致非常的不优雅。

之后在群友的推荐下用上了这个配置方案：[https://github.com/iDvel/rime-ice](https://github.com/iDvel/rime-ice)

![Rime 雾凇拼音默认皮肤](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/ianv3I.jpg)

Rime 输入法在诞生的时候是主要为了繁体输入设计的，这个配置文件是直接为了简体字设计，更加适合大陆地区的用户使用。

同时维护者貌似还有车万人，某种意义上也算是二次元友好了。

安装的时候貌似用 plum 那个配置管理工具安装失败了，不知道怎么回事，后面我直接把他整个项目 clone 到 Rime 的配置文件夹里面，就正常了。

这里简单介绍下我修改了哪些配置。

### 添加自定义配置

在 Rime 中想要添加自己的配置，非常简单，按照文档的说法，只需要创建 \*.custom.yaml 文件，然后
在这个文件用 patch 开头，就能实现对默认配置的覆盖。

在这里我创建了 default.custom.yaml 和 squirrel.custom.yaml 文件。

**default.custom.yaml**

```yaml
patch:
  ascii_composer:
    good_old_caps_lock: true # true | false
    switch_key:
      Shift_L: commit_code # commit_code | commit_text | inline_ascii | clear | noop
```

**squirrel.custom.yaml**

```yaml
patch:
  app_options:
    com.apple.Spotlight:
      ascii_mode: true # 开启默认英文
    com.microsoft.VSCode:
      ascii_mode: true
    com.googlecode.iterm2:
      ascii_mode: true
      vim_mode: true
    md.obsidian:
      ascii_mode: true
      vim_mode: true
    com.raycast.macos:
      ascii_mode: true

  style:
    # 选择皮肤，亮色与暗色主题
    color_scheme: nord_light
    color_scheme_dark: nord_dark

    inline_preedit: true

  # 皮肤列表
  preset_color_schemes:
    nord_light:
      name: 北方浅色
      horizontal: true # true横排，false竖排
      candidate_format: "%c %@ " # 用 1/6 em 空格 U+2005 来控制编号 %c 和候选词 %@ 前后的空间
      font_point: 16 # 候选文字大小
      label_font_point: 14 # 候选编号大小
      corner_radius: 5 # 窗口圆角
      line_spacing: 10 # 行间距(适用于竖排)
      back_color: 0xF4EFEC # 候选条背景色
      border_color: 0xF4EFEC # 边框色
      candidate_text_color: 0xC1A181 # 第一候选项文字颜色
      comment_text_color: 0xD0C088 # 拼音等提示文字颜色
      hilited_back_color: 0xF0E9E5 # 第一候选项背景背景色
      hilited_candidate_back_color: 0xE9DED8 # 候选文字背景色
      hilited_candidate_text_color: 0xAC815E # 第一候选项文字颜色
      hilited_text_color: 0xAD8EB4 # 高亮拼音 (需要开启内嵌编码)
      text_color: 0x7087D0 # 拼音等提示文字颜色

    nord_dark:
      name: 北方深色
      horizontal: true # true横排，false竖排
      candidate_format: "%c %@ " # 用 1/6 em 空格 U+2005 来控制编号 %c 和候选词 %@ 前后的空间
      font_point: 16 # 候选文字大小
      label_font_point: 14 # 候选编号大小
      corner_radius: 5 # 窗口圆角
      line_spacing: 10 # 行间距(适用于竖排)
      back_color: 0x473A33 # 候选条背景色
      border_color: 0x473A33 # 边框色
      candidate_text_color: 0xF5D887 # 第一候选项文字颜色
      comment_text_color: 0xE6B687  拼音等提示文字颜色
      hilited_back_color: 0x473A33 # 第一候选项背景背景色
      hilited_candidate_back_color: 0x5D4C43 # 候选文字背景色
      hilited_candidate_text_color: 0xC0E077 # 第一候选项文字颜色
      hilited_text_color: 0x6EC8F5 # 高亮拼音 (需要开启内嵌编码)
      text_color: 0x78E8F0 # 拼音等提示文字颜色
```

这两个配置文件创建完成以后就能直接让配置文件生效了

### 配置更新

如果想要让配置文件更新，可以按照这个配置的文档说明，安装 plum 工具更新

```bash
git clone --depth=1 https://github.com/rime/plum
cd plum
bash rime-install iDvel/rime-ice:others/recipes/full
```

**用来更新词典的命令**

```bash
bash rime-install iDvel/rime-ice:others/recipes/all_dicts
```
