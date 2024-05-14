---
title: "解决 Golang 反向代理到非本地网站 404 问题"
publishDate: "14 May 2024"
description: "今天尝试使用 Golang 搭建一个简单的反向代理，但是很奇怪的是如果要重定向到非 localhost 网站会返回 404"
tags: ["Java"]
---

> 本文参考: [https://blog.csdn.net/puss0/article/details/103484163](https://blog.csdn.net/puss0/article/details/103484163)

最关键的部分在这段代码，我们在创建一个反向代理的时候，重定向闭包函数 Director 没有重置请求的 host，导致没法重定向到 localhost 以外的地址

```go
func NewSingleHostReverseProxy(target *url.URL) *ReverseProxy {
	targetQuery := target.RawQuery
	director := func(req *http.Request) {
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		req.URL.Path = singleJoiningSlash(target.Path, req.URL.Path)
		if targetQuery == "" || req.URL.RawQuery == "" {
			req.URL.RawQuery = targetQuery + req.URL.RawQuery
		} else {
			req.URL.RawQuery = targetQuery + "&" + req.URL.RawQuery
		}
		if _, ok := req.Header["User-Agent"]; !ok {
			req.Header.Set("User-Agent", "")
		}
	}
	return &ReverseProxy{Director: director}
}
```

最后解决代码如下：

```go
package main

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func main() {
	target, err := url.Parse("http://example.com")
	if err != nil {
		fmt.Println("Error parsing target URL:", err)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
    d := proxy.Director
    proxy.Director = func(r *http.Request) {
        d(r)
        r.Host = target.Host
    }

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Proxying request to:", r.URL)
		proxy.ServeHTTP(w, r)
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
```
