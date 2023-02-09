---
title: "Bellman Ford 算法"
publishDate: "9 Feb 2023"
description: "一个非常简单的单源最短路算法, 最近在复习这个算法，纪录一下"
tags: ["algorithm", "graph"]
---

## 算法特性

- 它的原理是对图进行最多 $V-1$ 次松弛操作，
  得到所有可能的最短路径。其优于迪科斯彻算法的方面是边的权值可以为负数、实现简单，缺点是时间复杂度过高，
  高达$O(VE)$。但算法可以进行若干种优化，提高了效率。

- Bellman Ford 算法每次对所有的边进行松弛，
  每次松弛都会得到一条最短路径，
  所以总共需要要做的松弛操作是 $V - 1$ 次。
  在完成这么多次松弛后如果还是可以松弛的话，那么就意味着，其中包含负环。

- 相比狄克斯特拉算法(Dijkstra algorithm),
  其最大优点便是 Bellman–Ford 支持存在负权重的情况，
  并且代码实现相对简单。缺点便是时间复杂度较高，达到 $O(V \times E)$ ，$V$ 代表顶点数，$E$ 代表边数。

## 算法流程

这个算法非常暴力，感觉甚至有点 floyd 算法的感觉，就是进行 n - 1 次尝试(点的个数是 n), 然后在每次尝试中，
我们让每个点都试试看，假如在当前的路径上加入一个中间点，会不会让路径更短, 在最差情况下，如果一个图里面所有点在一条直链上，
最多可能途径 n - 1 个点（不包括起点）。这就是为什么要尝试 n - 1 次。

## 模板题目

**题目传送门：** [https://www.luogu.com.cn/problem/P3371](https://www.luogu.com.cn/problem/P3371)

## 算法代码

```cpp
#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

const int N = 1e4 + 5;

struct Target {
  int target_node;
  long long cost;
};
vector<Target> adj[N];
void add(int a, int b, long long cost) { adj[a].push_back({b, cost}); }

struct Edge {
  int a;
  int b;
  long long cost;
};

vector<Edge> edges;

long long dis[N];

int main() {
  int n, m, s;
  cin >> n >> m >> s;

  for (int i = 1; i <= n; i++) {
    dis[i] = 0x7fffffff;
  }
  dis[s] = 0;

  int a, b, c;
  for (auto i = 0; i < m; i++) {
    cin >> a >> b >> c;
    add(a, b, c);
    edges.push_back({a, b, c});
  }

  for (int i = 1; i <= n; i++) {
    for (auto &edge : edges) {
      if (dis[edge.b] > dis[edge.a] + edge.cost) {
        dis[edge.b] = dis[edge.a] + edge.cost;
      }
    }
  }

  for (auto i = 1; i <= n; i++) {
    cout << dis[i] << " ";
  }
  cout << endl;

  return 0;
}
```
