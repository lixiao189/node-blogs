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

#### 中英文切换快捷键

在 default.yaml 中将下面这部分按照图片那样修改即可

![在 Rime 雾凇拼音中英文修改](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/WXnKlu.png)

#### 皮肤设置

这里我自己魔改了一个 mac 红皮肤

```yaml
mac_red:
  name: Mac红
  horizontal: true # true横排，false竖排
  candidate_format: "%c %@ " # 用 1/6 em 空格 U+2005 来控制编号 %c 和候选词 %@ 前后的空间
  corner_radius: 5 # 窗口圆角
  hilited_corner_radius: 5 # 高亮圆角
  line_spacing: 10 # 行间距(适用于竖排)
  border_height: 4 # 窗口上下高度，大于圆角半径才生效
  border_width: 4 # 窗口左右宽度，大于圆角半径才生效
  font_face: "PingFangSC" # 候选词字体
  font_point: 16 # 候选字大小
  label_font_point: 13 # 候选编号大小
  text_color: 0x424242 # 拼音行文字颜色
  back_color: 0xFFFFFF # 候选条背景色
  border_color: 0xFFFFFF # 边框色
  label_color: 0x999999 # 预选栏编号颜色
  candidate_text_color: 0x3c3c3c # 预选项文字颜色
  comment_text_color: 0x999999 # 拼音等提示文字颜色
  hilited_text_color: 0x999999 # 高亮拼音 (需要开启内嵌编码)
  hilited_candidate_back_color: 0x110e98 # 第一候选项背景色
  hilited_candidate_text_color: 0xFFFFFF # 第一候选项文字颜色
  hilited_candidate_label_color: 0xFFFFFF # 第一候选项编号颜色
  hilited_comment_text_color: 0x999999 # 注解文字高亮
```

打开 squirrel.yaml 文件，在下面图片指示的地方添加上面那段代码
![在 Rime 雾凇拼音添加自己的皮肤设置](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/PKrxWV.png)

然后在这个地方修改皮肤
![在 Rime 雾凇拼音修改皮肤](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/TKVt5F.png)

#### 中英文自动切换

中文用户最麻烦的就是假如在使用开发工具，尤其是 VIM 的时候，中文输入法会变得非常恼人。

打开 squirrel.yaml 文件，在下面图片指示的地方添加类似这样的代码可以达到中英文自动切换的目的。

![在 Rime 雾凇拼音修改中英文自动切换配置](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/EJWgf0.png)

```yaml
app_options:
  com.apple.Spotlight:
    ascii_mode: true # 开启默认英文
  com.microsoft.VSCode:
    ascii_mode: true
  com.googlecode.iterm2:
    ascii_mode: true
    no_inline: true
    vim_mode: true
  md.obsidian:
    ascii_mode: true
    no_inline: true
    vim_mode: true
```

可以在终端中使用这样的命令来查询包名

```bash
osascript -e 'id of app "Visual Studio Code"'
```
