---
title: "Pratt Parsing 基于 Python 实现"
publishDate: "14 May 2025"
description: "Pratt Parsing 是一个用来在递归向下编译器前端中解决表达式解析的一个工具"
tags: ["compiler"]
---

> - 本文内容受到这篇博客启发: <https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html>
> - 完整的 Python 实现：<https://gist.github.com/lixiao189/c45ae6891ccfe57cbd431ced8eb63b74>

## 编译器前端 Parsing

编译器前端 parsing 的作用主要是将我们的代码翻译成一个，一个…… 语法树啊啊啊啊啊

```txt
                            Add
                 Parser     / \
 "1 + 2 * 3"    ------->   1  Mul
                              / \
                             2   3
```

## BNF

在工地上编译原理的时候语法貌似不是用这个东西表达的，在这里狠狠的介绍一下

```txt
Item =
    StructItem
  | EnumItem
  | ...

StructItem =
    'struct' Name '{' FieldList '}'
```

这就是一个常见的 BNF 表示的语法，等号左边是一个非终结符，然后右边是这个非终结符
推倒出来的东西，`|` 我理解是或的意思，用来分割开生成的其他可能的情况

## 解决问题

自顶向下解析器是一个可以用来手写实现的编译器前端，比较方便用来学习。
在自顶向下的编译器前端中，我们往往需要解决表达式解析二义性的问题。
比如说我们下面的一个表达式解析

```txt
 "1 + 2 * 3"
```

所谓的二义性就是因为语法定义不正确，导致上面的表达式有两种解析方式

假如说我们有如下的语法：

```txt
Expr =
    Expr '+' Expr
  | Expr '*' Expr
  | '(' Expr ')'
  | 'number'
```

上面这个语法就是有二义性的，我们可以有两种推导方式

```txt
                  Add         Mul
                  / \         / \
 "1 + 2 * 3"     1  Mul      Add 3
                    / \      / \
                   2   3    1   2
```

这就是没有在语法中体现运算符优先级，然后导致你的代码有两种解析方式，这样肯定就会
导致最后编译的产物有两种可能，这好吗，这不好。

同时我们还期望生成的**语法树越深的结点运算优先级越高**。
我们最后只期望出现左边的解析结果。

```txt
Expr =
    Factor
  | Expr '+' Factor

Factor =
    Atom
  | Factor '*' Atom

Atom =
    'number'
  | '(' Expr ')'

```

假如你有惊世智慧，有着惊人的注意力，不难注意到我们可以像上面一样改造当前的语法。
获得一个明确的解析结果。

很显然上面的语法超出了小学数学学习后带来的直觉，想不到一点🤏 啊。

我~~只是卡芙卡女士的狗，只有掏垃圾桶的智慧~~ 只有一包道德崇高的赞许👍，没有惊世智慧

这个时候如果你阅读书籍，或者在网上查找资料，可以找到一个叫作 Pratt Parse 的算法，
通过在解析的时候引入运算符优先级，来解决这个二义性问题, 同时运算符优先级是小学
就学过的东西，非常的符合直觉。接下来就通过这个东西来解析这种表达式。

## Pratt Parsing

首先定义一个叫作 binding power 的东西，一个运算符的优先级越高，那么他的 binding power
更强。

我们用 python 定义 binding power 如下：

```python
{
    "s": 0,
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
}
```

其中 S 表示表达式两边的 binding power, 这个 binding power 的作用就是等会儿用来决定
每个数字或者变量，假如两边都有运算符的时候，应该优先参与哪个运算符的运算。
很显然我们每个变量应该优先参加优先级更高的运算。

假如我们有一个表达式 `A + B * C`, 我们在运算符和表达式的两边
标记上binding power

```txt
   A       +       B       *       C
0     1        1       2       2         0
```

对于 B 这个表达式变量，它两边的 power 值为
1 和 2，那么因为右边的 power 更大，那么 B 就会被右边的乘号**吸引**过去，去优先参与乘法运算。
同理我们对所有的
变量进行同样的判断，可以得到如下每个表达式中的变量优先参与运算的结果：

```txt
    A        +         B         *         C
0   ->   1        1    ->    2       2    <-     0
```

可以看到 A 优先参加加法，B 和 C 优先参加乘法运算。
这很符合我们小学学过的数学知识。

然后乘法运算的两边都有变量被吸引过来了，
参与运算的所有成员都已经集齐，可以成为一个完整的算式。

然后在我们的解析器中。我们可以先对 `B * C` 构建一个语法树了。

```txt
A   +    *
        / \
       B   C
```

接下来我们把 `B * C` 这棵子树看成是一个变量, 重复之前的过程。

```txt
0 -> 1    1  <-  0
  A     +     *
             / \
            B   C
```

现在加法左右成员集齐，可以构建语法树了。

最终得到的语法树是：

```txt
   +
  / \
 A   *
    / \
   B   C
```

那么如果是 `A * B * C` 这种表达式呢？B 的两边都是 \*，binding power 都一样。
这个时候我们规定如果两边 power 值都一样大，就优先参加左边的运算。
这也很符合我们小学数学的知识了, 先算 `A \* B`再最后`B \* C`。

大概的流程就是这样，接下来就是写代码时间。

## Python 实现

按照传统流程来说，我们要首先用 Lexer 把源代码转换为 Token 数组，然后用 Parser 进行解析

### Lexer 部分

本来这部分应该是要用 lexer 将源代码解析为 Token 的，但是这个地方毕竟主要是介绍
Pratt Parsing 算法的，所以 lexer 部分就直接略过，只要知道假如有代码 `let x = 10;`
那么 lexer 会把他们转换为一个 Token 对象数组，内容为:

`[Token("let"), Token("x"), Token("="), Token("10"), Token(";"), Token(EOF)]`

> 上面的构造函数省略了 token_type 参数

```python
class TokenType(Enum):
    NUMBER = auto()
    IDENT = auto()
    OPERTOR = auto()
    EOF = auto()


@dataclass
class Token:
    """Token 对象
    Attributes:
        TokenType: 类型
        TokenLiteral: 字面量
    """

    token_type: TokenType
    literal: str
```

### Parser 部分

首先是 AST 语法树结点的定义，定义如下：

```python
class AstNode(ABC):
    """Ast 结点接口"""

    @abstractmethod
    def to_string(self) -> str:
        pass


@dataclass
class Atom(AstNode):
    """Ast 的叶子结点
    Attributes:
        token: 叶子结点存储的 token
    """

    token: Token

    def to_string(self) -> str:
        return self.token.literal


@dataclass
class BinaryExpression(AstNode):
    """Ast 二元运算符结点
    Attributes:
        operator: 运算符
        left: 左儿子
        right: 右儿子
    """

    operator: str
    left: Optional[AstNode] = None
    right: Optional[AstNode] = None

    def to_string(self) -> str:
        assert self.left is not None and self.right is not None
        return f"({self.left.to_string()} {self.operator} {self.right.to_string()})"
```

叶子结点和二叉树结点都实现了 `AstNode` 接口，都有一个 `to_string` 函数用来打印

接下来就是构建 parser 了

```python
@dataclass
class Parser:
    tokens: list[Token]
    token_pos: int = 0
    expression: Optional[AstNode] = None
    precedence_map: Dict[str, int] = field(
        default_factory=lambda: {
            "s": 0,
            "+": 1,
            "-": 1,
            "*": 2,
            "/": 2,
        }
    )
```

可以看到我们这个地方存储了 lexer 中分析出来的 tokens, 用 `token_pos` 记录当前
的 `Token` 分析到了哪里，最后还有一个 `Exression` 表示语法树的根节点，最后
是 `precedence_map` 用来存储运算符的优先级，用来表示他们的 `binding power`

接下来我们需要 3 个成员函数

```python
    def has_token(self) -> bool:
        return self.token_pos < len(self.tokens)

    def next_token(self) -> Token:
        token = self.tokens[self.token_pos]
        self.token_pos += 1
        return token

    def peek_token(self) -> Token:
        return self.tokens[self.token_pos]
```

其中 `has_token` 用来检测是否还剩下了 token, `next_token` **消耗掉**还没有读入的 Token
`peek_token` **仅仅返回** 一个还没有读入的 Token

```python
    def parse_expression(self) -> None:
        self.expression = self.__pratt_parse(self.precedence_map["s"])
```

接下来调用算法函数对表达式进行解析, 当然本文的表达式是一个青春版，
并不包含类似 `-x` 这样的表达式的解析。

最后就是代码核心内容

```python
def __pratt_parse(self, left_precedence: int) -> Optional[AstNode]:
    root = Atom(self.next_token())

    # 如果当前运算符的 binding power 一直不够大，被右边的运算符狠狠捕获♂
    while True:
        # 查看下一个是否是运算符
        peek_token = self.peek_token()
        if not self.has_token() or peek_token.token_type != TokenType.OPERTOR:
            break

        # 如果当前 token 左边运算符的 binding power 足够大
        # 那么当前 token 就不用被右边的运算符捕获
        operator = peek_token.literal
        right_precedence = self.precedence_map[operator]
        if left_precedence >= right_precedence:
            break

        # 构造二叉树
        root = BinaryExpression(
            operator=self.next_token().literal,
            left=root,
            right=self.__pratt_parse(self.precedence_map[operator]),
        )
    return root
```

比较抽象，这里是建议拿到完整代码以后用调试器狠狠调试，用来辅助理解。
本文大概介绍一下流程

1. 首先读入一个 Token 作为当前根节点
2. 然后用 `while` 循环看看当前的 Token 右边是否还剩下运算符有没有处理，如果有，那么说明运算符可能有右儿子, 可能需要构造二叉树结点
3. 判断读取到的运算符和根节点左侧的优先级进行比较，**如果左侧的优先级够大**，那么说明当前的根节点不需要被右侧的运算符捕获，直接退出
4. **如果右边的运算符优先级高**，更有 power ♂，那么我们当前的根节点就需要参与右边的运算符的计算，被狠狠捕获。
5. 被捕获以后构建二叉树，其中运算符是当前根节点右侧的运算符，最后递归调用当前的函数得到右儿子，因为右结点可能并非只是一个叶子结点，
   有一定可能是一个子树, 所以这里要进行递归，比如说解析 `A + B * C` 的时候根节点的右儿子就是表示 `B * C` 的子树

### main function

最后就是写 main 函数来测试了

```python
def main() -> None:
    tokens: list[Token] = [
        Token(TokenType.NUMBER, "1"),
        Token(TokenType.OPERTOR, "*"),
        Token(TokenType.NUMBER, "5"),
        Token(TokenType.OPERTOR, "*"),
        Token(TokenType.NUMBER, "5"),
        Token(TokenType.EOF, ""),
    ]

    parser = Parser(tokens)
    parser.parse_expression()  # 使用 Pratt Parsing 进行分析

    if parser.expression is not None:
        print(parser.expression.to_string())


if __name__ == "__main__":
    main()
```
