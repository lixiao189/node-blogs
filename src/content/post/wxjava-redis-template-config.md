---
title: "通过 WxJava 和 Redis template 完成微信小程序登录"
publishDate: "12 May 2024"
description: "使用 Java Spring Boot 中的 Redis template 来完成微信小程序的登录"
tags: ["Java"]
---

最近在使用 Java Spring Boot 开发微信小程序后端，目前是使用 WxJava 这个库，但是这个库不知道为啥文档是一坨答辩。
这个库官方缓存微信小程序 session 信息的时候并没有提到如何使用 Redis template 操作 Redis 的方案。

目前是摸索出来了要怎么简单的使用 redis template 登录微信小程序。

![823ynv](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/823ynv.png)

首先是我们需要创建一个 Bean，这个 Bean 是之后用来缓存微信小程序登录信息的。

```java
@Bean
public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory factory) {
    return new StringRedisTemplate(factory);
}
```

之后就是创建一个 Bean 用来创建微信小程序登录对象, 这个地方**比较关键**, 我们需要创建一个 `RedisTemplateWxRedisOps` 对象，这个对象可以用来载入 RedisTemplate 相关的设置，
之后我们就可以使用微信小程序相关的服务了，比如说登录什么的。

![a4hM3k](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/a4hM3k.png)

```java
@Bean
public WxMaService wxMaService() {
    // 创建一个新的配置
    WxMaDefaultConfigImpl config = new WxMaRedisBetterConfigImpl(new RedisTemplateWxRedisOps(stringRedisTemplate), "wxma");
    config.setAppid(wxMaProperties.getAppid());
    config.setSecret(wxMaProperties.getSecret());

    WxMaService maService = new WxMaServiceImpl();
    maService.setWxMaConfig(config);

    return maService;
}
```

登录控制器大概就长这样:

![FxKmmV](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/FxKmmV.png)

```java
@RestController
@AllArgsConstructor
@Slf4j
@RequestMapping("/user")
@Tag(name = "用户接口")
public class UserController {
    private final WxMaService wxMaService;

    @GetMapping("/login")
    public ResponseDTO<UserDTO> login(String code) {
        if (StringUtils.isBlank(code)) {
            return ResponseDTO.error(ErrorCode.PARAM_ERROR);
        }

        try {
            WxMaJscode2SessionResult session = wxMaService.getUserService().getSessionInfo(code);
            String sessionKey = session.getSessionKey() + session.getOpenid();
            return ResponseDTO.ok(new UserDTO(DigestUtils.md5DigestAsHex(sessionKey.getBytes())));
        } catch (WxErrorException e) {
            return ResponseDTO.error(ErrorCode.SYSTEM_ERROR);
        } finally {
            WxMaConfigHolder.remove();// 清理ThreadLocal
        }
    }
}
```
