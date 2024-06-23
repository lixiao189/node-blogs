---
title: "Unidbg の 初体验 - 2024 年CTF 国赛 androidso_re 题解"
publishDate: "23 Jun 2024"
description: "很久之前帮学弟写的，主要也顺便学了下 unidbg 的用法，在这里记录下"
tags: ["RE", "CTF"]
---

unidbg 主要是一个屌工具，可以在电脑上直接抠出安卓的函数, 用虚拟环境模拟运行, 这样直接不用开调试器了

主要参考了几个文章:

- [Ayuge の部落阁 - unidbg 加载 so 并调用 so 中函数](https://www.ayuge.top/mkdocs-material/tiny/mds/unidbg%E5%8A%A0%E8%BD%BDso%E5%B9%B6%E8%B0%83%E7%94%A8so%E4%B8%AD%E5%87%BD%E6%95%B0/#41-stringfromjni1)
- [Security - Unidbg 调用 jni 函数](https://www.csdzds.cn/posts/unidbg%E8%B0%83%E7%94%A8jni%E5%87%BD%E6%95%B0/)

首先打开 apk 文件，找到 MainActivity

![NUVkc8](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/NUVkc8.png)

然后可以看到对于 flag 对比的逻辑主要在 inspect.inspect 中

```java
public class inspect {
    public static boolean inspect(String input_str) {
        try {
            byte[] input_flag = input_str.getBytes(StandardCharsets.UTF_8);
            byte[] str2 = jni.getkey().getBytes(StandardCharsets.UTF_8);
            Arrays.copyOf(str2, 8);
            SecretKeySpec key = new SecretKeySpec(str2, "AES");
            byte[] ivBytes = jni.getiv().getBytes(StandardCharsets.UTF_8);
            IvParameterSpec iv = new IvParameterSpec(ivBytes);
            Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
            cipher.init(1, key, iv);
            byte[] encryptedBytes = cipher.doFinal(input_flag);
            String encryptedFlag = Base64.encodeToString(encryptedBytes, 0).trim();
            boolean bool = encryptedFlag.equals("JqslHrdvtgJrRs2QAp+FEVdwRPNLswrnykD/sZMivmjGRKUMVIC/rw==");
            if (!bool) {
                return true;
            }
            return false;
        } catch (Exception exception) {
            exception.printStackTrace();
            return true;
        }
    }
}
```

然后可以看到这个地方他用自己的函数去做了一个 DES 加密。只要拿到 `key` 和 `iv` 就行了。

理论上这个地方应该可以使用类似算法助手、frida 的 hook 工具，但是我的虚拟机只要运行到 jni 函数就会直接闪退，所以这个地方采用 unidbg 直接模拟运行出结果就行。

将这个程序用到的两个 so 文件丢到 unidbg 的 `unidbg-android/src/test/resources/example_binaries/arm64-v8a` 文件夹下面

![6vgN9u](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/6vgN9u.png)

然后创建一个自己的包 `unidbg-android/src/test/java/dev/node/reso` , 再创建一个 MainActivity 类写代码模拟运行即可,
`crack` 函数中是主要的调用逻辑，其他部分都是必要的模版

```java
package dev.node.reso;

import com.github.unidbg.AndroidEmulator;
import com.github.unidbg.LibraryResolver;
import com.github.unidbg.arm.backend.DynarmicFactory;
import com.github.unidbg.linux.android.AndroidEmulatorBuilder;
import com.github.unidbg.linux.android.AndroidResolver;
import com.github.unidbg.linux.android.dvm.DalvikModule;
import com.github.unidbg.linux.android.dvm.DvmClass;
import com.github.unidbg.linux.android.dvm.DvmObject;
import com.github.unidbg.linux.android.dvm.VM;
import com.github.unidbg.memory.Memory;

import java.io.File;


public class MainActivity {

    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        dev.node.reso.MainActivity mainActivity = new dev.node.reso.MainActivity();
        System.out.println("load offset=" + (System.currentTimeMillis() - start) + "ms");
        mainActivity.crack();
    }

    private final AndroidEmulator emulator;
    private final DvmClass dvmClass;
    private final VM vm;

    private MainActivity() {
        emulator = AndroidEmulatorBuilder
                .for64Bit()
                .addBackendFactory(new DynarmicFactory(true))
                .build();
        Memory memory = emulator.getMemory();
        LibraryResolver resolver = new AndroidResolver(23); // 自带 sdk 23 版本
        memory.setLibraryResolver(resolver);

        vm = emulator.createDalvikVM(new File("/Users/node/Downloads/app-debug.apk"));
        //打印日志
        vm.setVerbose(true);
        DalvikModule dm = vm.loadLibrary(new File("unidbg-android/src/test/resources/example_binaries/arm64-v8a/libSecret_entrance.so"), true);
        dm.callJNI_OnLoad(emulator);
        dvmClass = vm.resolveClass("com/example/re11113/jni"); // jni 函数所在的类
    }


    private void crack() {
        DvmObject<?> result = dvmClass.callStaticJniMethodObject(emulator, "getkey()Ljava/lang/String;");
        System.out.println("result is => " + result.getValue());

        result = dvmClass.callStaticJniMethodObject(emulator, "getiv()Ljava/lang/String;");
        System.out.println("result is => " + result.getValue());
    }
}
```

运行结果如图：

![nUGrCi](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/nUGrCi.png)

最后使用 tools fx 密码学工具箱解密即可

![2Af94E](https://picture-1303128679.cos.ap-shanghai.myqcloud.com/uPic/2Af94E.png)
