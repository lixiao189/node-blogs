---
title: "Prim 算法"
publishDate: "8 Feb 2023"
description: "一个非常简单的最小生成树算法, 最近在复习这个算法，纪录一下"
tags: ["algorithm", "graph"]
---

## 算法基本流程

这个算法基本流程还是很简单的，基本流程如下

1. 输入：一个加权连通图，其中顶点集合为 $V$，边集合为 $E$；
2. 初始化：$V_{new} = \{x\}$，其中 $x$ 为集合 $V$ 中的任一节点（起始点），$E\_{new} = \{\}$ 为空；
3. 重复下列操作，直到 $V_{new} = V$：

   - 在集合 $E$ 中选取权值最小的边 $<u, v>$，其中 $u$ 为集合 $V_{new}$ 中的元素，而 $v$ 不在 $V_{new}$ 集合当中，并且 $v ∈ V$
     （如果存在有多条满足前述条件即具有相同权值的边，则可任意选取其中之一）
   - 将 $v$ 加入集合 $V_{new}$ 中，将 $<u, v>$ 边加入集合 $E_{new}$ 中

4. 输出：使用集合 $V_{new}$ 和 $E_{new}$ 来描述所得到的最小生成树。

## 算法代码

**模板题传送门：** [https://www.luogu.com.cn/problem/P3366](https://www.luogu.com.cn/problem/P3366)

```cpp
#include <iostream>
#include <queue>
#include <stdio.h>
#include <string.h>
#include <vector>

using std::cin;
using std::cout;
using std::priority_queue;
using std::vector;

const int N = 5e3 + 5;

int in_v_cnt = 0;
bool is_in_v[N];

struct Target {
  int target_node;
  int cost;

  bool operator>(const Target &other) const { return cost > other.cost; }
};

vector<Target> adj[N];

void add(int a, int b, int c) {
  adj[a].push_back({b, c});
  adj[b].push_back({a, c});
}

priority_queue<Target, vector<Target>, std::greater<Target>> global_heap;

int main() {
  memset(is_in_v, 0, sizeof(is_in_v));
  int n, m;
  cin >> n >> m;

  int a, b, c, v_added;
  bool has_new_v;
  for (int i = 0; i < m; i++) {
    cin >> a >> b >> c;
    if (i == 0) {
      v_added = a;
      is_in_v[a] = true;
      in_v_cnt++;
      has_new_v = true;
    }
    add(a, b, c);
  }

  auto result = 0;
  while (in_v_cnt < n && has_new_v) {
    // 将所有刚添加到树上的节点的邻边添加到堆里
    for (auto &target : adj[v_added]) {
      global_heap.push(target);
    }

    auto tmp_target = global_heap.top();
    while (is_in_v[tmp_target.target_node] && !global_heap.empty()) {
      global_heap.pop();
      tmp_target = global_heap.top();
    }

    has_new_v = false;
    // 找到了一个还没有添加进 v 的节点，并且还是最近的
    if (!is_in_v[tmp_target.target_node]) {
      v_added = tmp_target.target_node;
      is_in_v[v_added] = true;
      in_v_cnt++;
      result += tmp_target.cost;

      has_new_v = true;
    }
  }

  if (in_v_cnt < n) {
    cout << "orz";
  } else {
    cout << result;
  }

  return 0;
}
```
