---
title: 提升 Docker 镜像拉取效率：为 Linux 系统配置 Clash 代理
description: 详细介绍如何在 Linux 系统上，为 Docker 服务配置 Clash 作为其网络代理。
date: 2025-06-26T00:00:00.000Z
tags:
  - Docker
  - Clash
  - 代理
  - Linux
author: shihuaidexianyu
---
## 提升 Docker 镜像拉取效率：为 Linux 系统配置 Clash 代理

### 背景

在企业内网或特定的网络环境中，直接从 Docker Hub 等公共镜像仓库拉取镜像可能会遇到连接超时或速度缓慢的问题。这通常是由于网络策略或路由限制导致的。通过为 Docker 配置一个 HTTP 代理，可以有效地解决这一问题，确保开发和部署流程的顺畅。

本教程将详细介绍如何在 Linux 系统上，为 Docker 服务配置 Clash 作为其网络代理。

### 准备工作：确认 Clash 代理信息

在开始配置之前，我们必须确认 Clash 客户端提供的 HTTP 代理端口。Clash 会在本地启动一个服务来处理网络请求。

  * **代理地址**：`127.0.0.1` (即 `localhost`，代表本机)
  * **默认 HTTP 代理端口**：`7890`

因此，我们需要使用的代理服务器 URL 是：`http://127.0.0.1:7890`

**如何确认端口？**
虽然 `7890` 是最常见的端口，但你的配置可能会有所不同。请打开你的 Clash 客户端，在 **“设置 (Settings)” -\> “端口 (Ports)”** 或 **“通用 (General)”** 页面，找到并确认 `HTTP Port` 或 `Mixed Port` 的值。本教程将使用 `7890` 作为示例。

请确保你的 Clash 服务已在 Linux 系统上正常启动并运行。

-----

### 配置步骤：通过 systemd 为 Docker 设置代理

在大多数现代 Linux 发行版（如 Ubuntu, CentOS, Debian）中，`systemd` 是标准的服务管理器。通过为 Docker 服务创建 `systemd` 的覆盖配置文件，是配置代理最标准、最可靠的方法。

**第一步：创建 systemd 配置目录**

打开终端，执行以下命令。这个命令会为 Docker 服务创建一个专门的配置目录，这样做的好处是你的自定义配置不会被未来的 Docker 软件包升级所覆盖。

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
```

**第二步：创建并编辑代理配置文件**

使用你喜欢的命令行文本编辑器（例如 `nano` 或 `vim`）来创建一个新的配置文件。

```bash
sudo nano /etc/systemd/system/docker.service.d/http-proxy.conf
```

**第三步：填入代理配置信息**

将以下内容复制并粘贴到你刚刚创建的文件中。这些配置会以环境变量的形式注入到 Docker 的运行环境中。

```ini
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:7890"
Environment="HTTPS_PROXY=http://127.0.0.1:7890"
Environment="NO_PROXY=localhost,127.0.0.1,*.example.internal"
```

**配置说明:**

  * `HTTP_PROXY`: 用于处理 HTTP 请求的代理。
  * `HTTPS_PROXY`: 用于处理 HTTPS 请求的代理。
  * `NO_PROXY`: **（非常重要）** 指定哪些地址**不**通过代理直接访问。
      * `localhost` 和 `127.0.0.1` 是**必须**要加入的，以保证 Docker 内部组件间的正常通信。
      * 如果你有内部的私有镜像仓库（例如 `registry.example.internal`），也请务必将其域名或 IP 地址段加入 `NO_PROXY` 列表，用逗号分隔。

**第四步：重载配置并重启 Docker 服务**

保存并关闭文件后，执行以下命令来让你的新配置生效。

```bash
# 1. 通知 systemd 重新加载配置文件
sudo systemctl daemon-reload

# 2. 重启 Docker 服务以应用新的环境变量
sudo systemctl restart docker
```

-----

### 最后一步：验证配置是否成功

为了确保我们的配置已经生效，可以执行以下两个验证步骤。

**1. 检查 Docker 服务信息**

在终端中运行 `docker info` 命令，并过滤出与代理相关的信息。

```bash
docker info | grep -i proxy
```

如果你的终端显示了类似下面的输出，证明 Docker 已经成功加载了代理配置：

```
Http Proxy: http://127.0.0.1:7890
Https Proxy: http://127.0.0.1:7890
No Proxy: localhost,127.0.0.1,*.example.internal
```

**2. 进行镜像拉取测试**

尝试从公共仓库拉取一个轻量级镜像，例如 `hello-world`。

```bash
docker pull hello-world
```

如果你能看到镜像成功拉取的进度条，并且速度满足你的预期，那么恭喜你，所有配置都已正确完成！

### 总结

为 Linux 上的 Docker 服务配置 Clash 代理，是解决在特定网络环境下镜像拉取问题的有效方案。通过 `systemd` 进行配置，不仅操作简单，而且安全可靠，不会影响系统后续的更新维护。希望这篇教程能帮助你提升开发和运维的效率。
