+++
title = "refactor-note"
date = "2025-07-10"
description = "pkuhub-rs重构的笔记"
author = "shihuaidexianyu"
+++

## day0

### 第 1 步：环境搭建与基础 Web 服务

**任务目标：** 跑起来一个最简单的 `axum` Web 服务器，确保开发环境正常。

**具体行动：**

1. 使用 `cargo new pkuhub_server` 创建一个新的 Rust 项目。
2. 在 `Cargo.toml` 文件中添加 `axum`, `tokio`, 和 `serde` 作为依赖。
3. 在 `src/main.rs` 中，编写代码以启动一个 HTTP 服务器，监听一个端口（例如 3000）。
4. 创建一个简单的根路径 `/` 的 handler，让它返回 "Hello, World!"。
5. 运行 `cargo run`，并用浏览器或 `curl` 访问 `http://localhost:3000`，确认看到 "Hello, World!"。

**学习内容：**

- **Cargo 包管理器基础**：`cargo new`, `cargo run`, `cargo build`, 以及如何编辑 `Cargo.toml` 添加依赖。
- **`tokio` 运行时**：了解 `#[tokio::main]` 宏的作用，它是 Rust 异步程序的入口点。
- **`axum` 框架入门**：
  - `axum::Router`: 如何创建路由实例。
  - `Router::route()`: 如何定义一个路由规则。
  - `axum::routing::get`: 如何指定路由响应 GET 方法。
  - **Handler 函数**：一个返回 `&'static str` 或其他实现了 `IntoResponse` 类型的值的 `async fn`。
  - 如何启动服务：`axum::Server::bind(...).serve(...)`.

---

### 第 2 步：项目结构化与 Mock API 实现

**任务目标：** 按照软件工程的最佳实践整理代码，并创建返回固定 JSON 数据的 API。

**具体行动：**

1. 在 `src` 目录下创建一个 `api.rs` 文件（或者 `src/api/mod.rs`）。
2. 在 `main.rs` 中使用 `mod api;` 来声明模块。
3. 在 `api.rs` 中：
    - 定义一个 `Note` 结构体，并为其添加 `#[derive(serde::Serialize)]`。
    - 创建一个名为 `get_recent_updates` 的 handler 函数。
    - 在此函数内部，创建包含至少 3 个 `Note` 实例的 `Vec<Note>`。
    - 让函数返回 `axum::Json<Vec<Note>>`。
4. 在 `main.rs` 中，将 `/api/notes/recent` 路径的 GET 请求路由到 `api::get_recent_updates` 函数。
5. 运行程序，并访问 `http://localhost:3000/api/notes/recent`，确认能看到 JSON 格式的笔记列表。

**学习内容：**

- **Rust 模块系统**：`mod`, `use`, `pub` 的用法，以及如何在不同文件间组织代码。
- **`serde` 库**：
  - `#[derive(Serialize)]` 的作用：将 Rust 结构体自动转换为可序列化的数据。
  - `serde_json`：`axum::Json` 在底层使用它来完成到 JSON 字符串的转换。
- **`axum` 进阶**：
  - `axum::Json` 类型：作为 handler 的返回值，用于方便地返回 JSON 响应。

---

### 第 3 步：设计元数据结构

**任务目标：** 定义用来描述 API 和数据类型的“模型”，这是后续代码生成的基础。

**具体行动：**

1. 创建一个新模块，例如 `docs` (`src/docs.rs`)。
2. 在 `docs.rs` 中，定义 `struct ApiCallInfo`。包含字段：`path: String`, `method: String`, `desc: String` 等。
3. 在 `docs.rs` 中，定义 `enum MyType`。这是整个任务的关键之一。你需要思考如何用这个 enum 来表示 Rust 的常见类型。
    - 基础类型: `Bool`, `String`, `I32`, `U32`, `F64` 等。
    - 复合类型: `Vec(Box<MyType>)`, `Option(Box<MyType>)`。
    - 结构体: `Object(Vec<(String, MyType)>)`，其中元组表示 `(字段名, 字段类型)`。
    - 等等...

**学习内容：**

- **Rust 数据结构设计**：如何使用 `struct` 和 `enum` 来为你的领域问题（这里是“描述类型”）建模。
- **`Box<T>` 智能指针**：当 `enum` 的成员需要递归引用自身时（例如 `Vec` 或 `Map` 包含其他 `MyType`），需要使用 `Box` 来避免无限大小的类型。

---

### 第 4 步：实现 `AnnotatedRouter` 包装器

**任务目标：** 创建一个 `axum::Router` 的包装器，用于在注册路由的同时收集元数据。

**具体行动：**

1. 在 `docs.rs` (或一个新模块) 中，定义 `pub struct AnnotatedRouter`。
2. 它应该包含两个字段：`router: axum::Router` 和 `annotations: Vec<ApiCallInfo>`。
3. 实现 `AnnotatedRouter::new()` 构造函数。
4. 实现 `AnnotatedRouter::route()` 方法。
    - 这个方法应该接收路径、HTTP 方法和 handler。
    - 在方法内部，暂时先只收集 `path` 和 `method`，创建一个 `ApiCallInfo` 实例并存入 `self.annotations`。
    - 然后，调用 `self.router.route()` 将路由注册到内部的真实 router 上。
    - 让方法返回 `&mut Self` 以支持链式调用。
5. 实现 `build()` 方法，返回 `self.router`。
6. 实现 `annotations()` 方法，返回 `&self.annotations`。
7. 修改 `main.rs`，使用你的 `AnnotatedRouter` 替代 `axum::Router`。

**学习内容：**

- **设计模式**：包装器模式 (Wrapper Pattern) / 装饰器模式 (Decorator Pattern)。
- **Rust 所有权与生命周期**：在实现 `route` 方法时会遇到，特别是返回 `&mut Self`。
- **泛型编程**：`route` 方法的 handler 参数需要是泛型 `H`，并带有 `axum::handler::Handler` trait 约束，才能接受所有合法的 axum handler。

---

### 第 5 步：创建类型反射的 `derive` 宏 (最难步骤)

**任务目标：** 编写一个过程宏，它可以自动为数据结构生成获取其 `MyType` 描述的代码。

**具体行动：**

1. **定义 Trait**: 在 `docs.rs` 中定义 `pub trait Schemable { fn schema() -> MyType; }`。
2. **创建宏 Crate**: 使用 `cargo new --lib schemable_macro` 创建一个新的库 crate。
3. **配置宏 Crate**: 在 `schemable_macro/Cargo.toml` 中，添加 `[lib]` 部分，并设置 `proc-macro = true`。同时添加 `syn` 和 `quote` 依赖。
4. **编写宏代码**: 在 `schemable_macro/src/lib.rs` 中：
    - 编写一个 `#[proc_macro_derive(Schemable)]` 标记的函数。
    - 函数接收一个 `TokenStream`。使用 `syn::parse(input)` 将其解析成一个 `syn::DeriveInput` 结构。
    - 检查这个 `DeriveInput`，提取出结构体的名称、字段名和字段类型。
    - 根据提取出的信息，使用 `quote!` 宏来**生成** `impl Schemable for YourStruct { ... }` 的代码。这部分生成的代码需要能构建出在第 3 步中设计的 `MyType::Object` 结构。
5. **在主项目中使用宏**: 在主项目的 `Cargo.toml` 中，将 `schemable_macro` 添加为依赖。然后在你的 `Note` 结构体上，除了 `Serialize`，再添加 `#[derive(Schemable)]`。

**学习内容：**

- **Rust 元编程 (Metaprogramming)** 核心概念。
- **过程宏 (Procedural Macros)**：
  - 三种宏类型，重点是 `derive` 宏。
  - 如何设置宏 crate。
- **`syn` 库**: **必学**。用于将 Rust 代码解析为 AST (Abstract Syntax Tree)，让你能以结构化的方式访问代码信息（如结构体名、字段列表）。你需要阅读它的文档和示例。
- **`quote` 库**: **必学**。用于将你处理好的数据重新拼接成 Rust 代码 (TokenStream)。
- **Traits 深入**：理解 `derive` 宏是如何与 trait 自动实现相结合的。

---

### 第 6 步：集成与暴露文档

**任务目标：** 将所有部分组合起来，并创建一个能返回所有 API 文档的端点。

**具体行动：**

1. **修改 `AnnotatedRouter::route()`**:
    - 为 `route` 方法的泛型 handler 添加 `Schemable` trait 约束。你需要约束 handler 的输入参数类型和返回类型都实现了 `Schemable`（这部分比较复杂，可以先从返回类型开始）。
    - 在 `route` 方法内部，调用 `TheResponseType::schema()` 来获取响应类型的 `MyType` 描述。
    - 将获取到的类型信息存入 `ApiCallInfo` 实例中。
2. **创建文档 API**:
    - 在 `main.rs` 中，创建一个新的 handler，比如 `get_api_docs`。
    - 这个 handler 需要能访问到 `AnnotatedRouter` 收集到的 `annotations` 列表。一种方法是使用 `axum::extract::Extension` 将 `Arc<Vec<ApiCallInfo>>` 共享给 handler。
    - 让 `get_api_docs` handler 将这个列表序列化为 JSON 并返回。
    - 注册一个新路由，比如 `/api/docs`，指向 `get_api_docs`。
3. **最终测试**:
    - 运行程序。
    - 访问 `/api/notes/recent`，确认原有 API 正常。
    - 访问 `/api/docs`，确认能看到一个 JSON 数组，其中包含了 `notes` API 的路径、方法和**结构化的响应类型信息**。

**学习内容：**

- **`axum::extract::Extension`**：在 `axum` 中共享状态（如配置、数据库连接池、或我们这里的 API 文档列表）的标准方式。
- **`Arc<T>`**：原子引用计数智能指针，用于在多线程（axum 的 handler 是多线程执行的）之间安全地共享数据。
- **高级 Trait 约束**：如何为泛型 handler 的输入输出参数添加 trait 约束。
