---
title: "优雅重启 Gin 服务器"
publishDate: "7 Jan 2024"
updatedDate: "28 Oct 2026"
description: "用 endless 替换 Gin 的 Run：新二进制覆盖到同一路径后 kill -HUP，旧请求处理完再退出。端口不能改，也不要和 systemd 抢进程。"
tags: ["Dev", "Go"]
---

写一个 Go 的消息聚合机器人时碰到这个：代码更新了，直接把进程杀掉再拉起，正在处理的请求会被掐断。想要的是新程序开始接新请求，旧程序把手头的请求做完再退出。

Gin 文档里这件事交给 [fvbock/endless](https://github.com/fvbock/endless)。它替换 `http.ListenAndServe`，收到 `SIGHUP` 就 fork，把监听的 socket 交给新进程。Go 1.8 以后的 `http.Server.Shutdown` 只能把旧进程停干净，不会去执行刚编译出来的新二进制。要换二进制还不断开端口，用 endless，不是 `Shutdown`。

## 换掉 router.Run

```go
package main

import (
	"log"

	"github.com/fvbock/endless"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/", func(c *gin.Context) {
		c.String(200, "ok")
	})

	// 不要再调用 router.Run。端口这一次定下来，热重启改不了。
	if err := endless.ListenAndServe(":4242", router); err != nil {
		log.Fatal(err)
	}
}
```

```bash
go get github.com/fvbock/endless
go build -o /srv/bot/bot .
/srv/bot/bot
```

二进制路径必须固定。子进程会重新执行当前这个可执行文件，也就是 `os.Args[0]`。编译到 `/tmp/bot.new` 再发信号，跑起来的还是旧文件。

先覆盖，再发信号：

```bash
go build -o /srv/bot/bot.new .
mv -f /srv/bot/bot.new /srv/bot/bot
kill -HUP "$(cat /var/run/bot.pid)"
```

`kill -HUP` 就是 `kill -1`。父进程不再 accept，已经接上的连接继续在父进程里处理。默认 60 秒还没结束的请求会被强制断开，日志是 `[STOP - Hammer Time] Forcefully shutting down parent`。这个等待是 `endless.DefaultHammerTime`，设成 `-1` 就不自动砍，要再发 `SIGUSR2` 才砍。

`mv` 到同一个目录是替换目录项。正在运行的旧进程拿着旧 inode，新进程打开的才是新文件。不要先 `rm` 再往同一路径拷，中间会有一段时间路径不存在。

## 进程号会变

fork 之后新进程的 pid 变了。下一次还向旧 pid 发 `SIGHUP`，信号就丢了。可以在监听开始前把 pid 打出来：

```go
server := endless.NewServer(":4242", router)
server.BeforeBegin = func(addr string) {
	log.Printf("listening on %s, pid %d", addr, syscall.Getpid())
}
if err := server.ListenAndServe(); err != nil {
	log.Fatal(err)
}
```

这里要多 import 一个 `syscall`。把打印出来的 pid 写进文件，下次 `kill -HUP` 读这个文件，不要记第一次启动时的那个号。

信号就这几个：

- `SIGHUP`：热重启，换成磁盘上的新二进制
- `SIGINT`、`SIGTERM`：不拉起新进程，已有请求处理完再退出
- `SIGUSR2`：已经在关机时，提前进入 Hammer Time

## 这些环境不要用

endless 靠 Unix 信号和 fork，Windows 上没有这套，别用。

systemd 开了 `Restart=always` 也不合适。`systemctl restart` 发的是 `SIGTERM`，再由 systemd 拉起新进程。这和 endless 自己 fork 是两条路，可能变成两个进程抢同一个端口，或者主进程被 systemd 直接收掉。用单元文件托管时，走 Gin 文档里的 `http.Server.Shutdown`，超时交给 `TimeoutStopSec`。endless 适合二进制放在固定路径、由自己的脚本发 `SIGHUP`。

Docker 里也别覆盖容器内的二进制再发信号。多副本滚动发布就行。

endless 自己还有两个限制：重启不能改监听端口，`:4242` 换成别的不会生效；这个库已经停更很久，只是 Gin 文档还把它当作热重启的例子。如果只需要「收到 `SIGTERM` 时把请求处理完」，用标准库的 `Shutdown`，少一个依赖。

原理写得更细的一篇：https://www.luozhiyun.com/archives/584
