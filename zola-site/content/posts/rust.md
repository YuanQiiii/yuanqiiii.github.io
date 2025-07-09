+++
title = "rust学习笔记"
date = "2025-07-09"
description = "记录学习rust遇到的一些困惑"
author = "shihuaidexianyu"

[taxonomies]
tags = ["rust", "programming", "learning"]
+++

## day0

### 遮蔽 (Shadowing)

  * **定义**：在同一作用域内，使用 `let` 关键字可以声明一个与之前变量同名的新变量，这个新变量会"遮蔽"旧变量。
  * **核心优势**:
    1.  **允许改变类型**：这是与 `mut` (可变变量) 的最大区别。你可以用一个新类型的变量遮蔽旧变量，非常适合数据转换的场景。
        ```rust
        let spaces = "   ";         // spaces 是 &str 类型
        let spaces = spaces.len(); // spaces 被遮蔽，新变量是 usize 类型
        ```