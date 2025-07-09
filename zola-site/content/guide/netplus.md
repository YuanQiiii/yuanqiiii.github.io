+++
title = "netplus"
date = "2025-07-09"
description = "使用 Docker Compose 部署 Mihomo (Clash.Meta) 透明网关与 Zashboard 仪表盘"
author = "shihuaidexianyu"

[taxonomies]
categories = ["guide"]
+++

### **使用 Docker Compose 部署 Mihomo (Clash.Meta) 透明网关与 Zashboard 仪表盘**

**教程更新时间**：2025年7月4日
**核心技术**：Docker Compose, Mihomo (Clash.Meta), TUN 模式, Zashboard

#### **前言**

本教程将指导您在一个全新的 Linux 服务器上，通过 Docker Compose 部署一套包含 Mihomo 核心和 Zashboard 图形化仪表盘的透明代理网关。这套系统能够智能地接管您所有接入设备的网络流量，实现精细化的自动分流。

本指南并非简单的步骤罗列，而是我们“身经百战”后的经验总结。它将主动引导您规避部署过程中最常见的陷阱，包括：

  * **网络问题**：解决访问 Docker Hub 仓库失败、连接超时的 `EOF` 错误。
  * **环境依赖问题**：解决 TUN 模式所需的 `/dev/net/tun` 设备缺失问题。
  * **端口冲突问题**：解决 Mihomo 的 DNS 服务与系统自带服务抢占 53 端口的问题。
  * **DNS 解析问题**：通过“DNS自给自足”配置，彻底摆脱服务器操作系统顽固的 DNS 故障。
  * **容器网络问题**：解决其他 Docker 容器如何正确使用此网关的问题。

跟随本教程，您将构建一个真正稳定、强大的家庭或团队网络中枢。

-----

### **第一章：基础环境准备**

一个干净、配置正确的宿主环境是成功的基石。

#### **1.1 系统要求**

  * 一台拥有 `root` 或 `sudo` 权限的 Linux 服务器（推荐使用 Debian 11/12 或 Ubuntu 20.04/22.04）。
  * 能够正常访问互联网。

#### **1.2 安装 Docker 和 Docker Compose**

1.  **安装 Docker Engine**：我们使用 Docker 官方的便利脚本进行安装。

    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    ```

2.  **安装 Docker Compose 插件**：

    ```bash
    sudo apt update
    sudo apt install docker-compose-plugin -y
    ```

3.  **验证安装**：

    ```bash
    docker --version
    docker compose version
    ```

    如果都能看到版本号，说明安装成功。

#### **1.3 创建项目目录结构**

良好的目录结构便于管理。

```bash
# 创建一个总的项目目录
mkdir ~/mihomo-stack
cd ~/mihomo-stack

# 创建用于存放 Mihomo 配置的子目录
mkdir mihomo-config
```

最终目录结构应为：

```
mihomo-stack/
├── mihomo-config/
└── docker-compose.yml  (稍后创建)
```

#### **1.4 关键步骤：固化服务器 DNS 环境**

为了一劳永逸地解决后续所有可能的 DNS 冲突和解析问题，我们在部署前就将服务器的 DNS 环境处理干净。

1.  **停止并禁用系统自带的 `systemd-resolved` 服务**：
    ```bash
    sudo systemctl disable systemd-resolved
    sudo systemctl stop systemd-resolved
    ```
2.  **手动配置并锁定系统的 DNS 文件**：
    ```bash
    sudo rm /etc/resolv.conf
    echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
    sudo chattr +i /etc/resolv.conf
    ```
    此操作将系统 DNS 指向 Google DNS 并锁定文件，防止被意外修改。

-----

### **第二章：编写核心配置文件**

#### **2.1 编写“终极” `config.yaml`**

这份配置文件是我们所有经验的结晶。

1.  进入配置目录，创建并编辑 `config.yaml`：
    ```bash
    cd ~/mihomo-stack/mihomo-config
    nano config.yaml
    ```
2.  将以下**全部内容**复制粘贴到文件中：

<!-- end list -->

```yaml
# ===============================================================
# Mihomo 网关模式终极教程配置文件 - DNS自给自足版
# ===============================================================

# --- 1. 核心网关设置 ---
port: 7890
socks-port: 7891
allow-lan: true
bind-address: '*'
mode: rule
log-level: info
external-controller: '0.0.0.0:9090'

# --- 2. TUN 模式设置 ---
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: true
  dns-hijack:
    - any:53

# --- 3. DNS "自给自足" 配置 ---
dns:
  enable: true
  listen: 0.0.0.0:53
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  # 使用在您网络环境下稳定可用的DoH/DoT作为上游DNS
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  fallback:
    - tls://dns.alidns.com:853
    - tls://doh.pub:853

# --- 4. 您的代理服务器 (请替换为您自己的节点信息) ---
proxies:
  - name: "MyProxy" # 您可以给自己的节点起个名字
    type: ss
    server: "your_server_ip"
    port: 443
    cipher: aes-256-gcm
    password: "your_password"
    udp: true
    # 如果您的节点需要 obfs 插件，请取消下面的注释并修改
    # plugin: obfs
    # plugin-opts:
    #   mode: tls
    #   host: your_obfs_host

# --- 5. 代理组 (适配单节点，可自行扩展) ---
proxy-groups:
  - name: Proxy
    type: "select"
    proxies:
      - MyProxy
  # 您可以从其他模板复制更复杂的策略组，如自动测速、故障转移等

# --- 6. 规则 (集成了所有修复方案) ---
rules:
# --- DNS保活规则 (最高优先级，防止死循环) ---
- DOMAIN-SUFFIX,alidns.com,DIRECT
- DOMAIN-SUFFIX,doh.pub,DIRECT

# --- 规则下载服务器保活规则 (如果您使用在线规则集) ---
- DOMAIN,raw.githubusercontent.com,DIRECT

# --- 本地与国内流量规则 ---
- IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
- IP-CIDR,192.168.0.0/16,DIRECT,no-resolve
- GEOIP,CN,DIRECT

# --- 最终匹配规则 ---
- MATCH,Proxy
```

3.  **请务必修改 `proxies` 部分**，填入您自己的代理服务器信息。

#### **2.2 下载 GeoIP 数据库**

```bash
wget -O ~/mihomo-stack/mihomo-config/Country.mmdb https://github.com/Dreamacro/maxmind-geoip/releases/latest/download/Country.mmdb
```

-----

### **第三章：编排与部署**

#### **3.1 编写 `docker-compose.yml` 文件**

回到 `mihomo-stack` 主目录，创建 `docker-compose.yml`。

```bash
cd ~/mihomo-stack
nano docker-compose.yml
```

粘贴以下内容：

```yaml
services:
  # Mihomo (Clash.Meta) 核心服务
  mihomo:
    image: metacubex/mihomo:latest
    container_name: mihomo
    restart: unless-stopped
    network_mode: "host"            # 关键：使用主机网络，简化TUN和端口问题
    volumes:
      - ./mihomo-config:/etc/mihomo # 挂载配置目录
      - /dev/net/tun:/dev/net/tun    # 关键：将TUN设备映射进容器
    cap_add:
      - NET_ADMIN                   # 赋予网络管理权限，TUN所需
    command: -d /etc/mihomo

  # Zashboard 仪表盘服务
  zashboard:
    image: ghcr.io/zephyruso/zashboard:latest
    container_name: zashboard
    restart: unless-stopped
    ports:
      - "8088:80"                   # 映射Web访问端口
    depends_on:
      - mihomo
```

#### **3.2 部署服务栈**

在 `mihomo-stack` 目录下，一键启动：

```bash
docker compose up -d
```

#### **3.3 连接 Zashboard 仪表盘**

1.  确保您的服务器防火墙/安全组已放行 `8088` 端口。
2.  在浏览器访问 `http://<您的服务器IP>:8088`。
3.  在连接界面输入 Mihomo 的 API 地址： `http://172.17.0.1:9090` (这是从容器访问宿主机的特殊地址)。

-----

### **第四章：终极故障排查指南**

如果在部署或运行中遇到问题，请参照以下指南：

  * **问题1: `docker compose up` 失败，提示 `EOF` 或 `timeout`。**
      * **原因**: 服务器访问 Docker Hub 网络不稳定。
      * **解决方案**: 参考之前的对话，为 Docker 配置国内镜像加速器。或者手动 `docker pull <镜像名>`，再 `docker compose up -d`。
      
  * **问题2: Mihomo 日志显示 `Start TUN listening error: ... no such file or directory`。**
      * **原因**: 宿主机缺少 `/dev/net/tun` 设备文件。
      * **解决方案**: 本教程的 `docker-compose.yml` 通过 `volumes` 映射解决了此问题。如果仍然出错，请回到本教程第一章，在宿主机上手动执行创建 `tun` 设备的命令。
      
  * **问题3: Mihomo 日志显示 `listen tcp 0.0.0.0:53: bind: address already in use`。**

      * **原因**: 宿主机的 `systemd-resolved` 服务占用了53端口。
      * **解决方案**: 本教程第一章的 DNS 固化步骤已主动解决了此问题。

  * **问题4: Zashboard 页面无法访问。**

      * **原因**: 云服务商安全组或服务器防火墙（如 `ufw`）未放行 Zashboard 的端口（本教程中为 `8088`）。
      * **解决方案**: 登录云平台或服务器，添加入站规则放行该端口。

  * **问题5: 宿主机可以正常代理，但服务器上的其他 Docker 容器无法访问外网。**

      * **原因**: 其他容器使用了 Docker 默认的 `127.0.0.11:53` DNS，绕过了 Mihomo。
      * **解决方案**: 启动其他容器时，使用 `--dns=172.17.0.1` 参数，或修改全局的 `/etc/docker/daemon.json` 文件，将 DNS 指向宿主机。

-----

### **附录**

可以使用另一篇文章中的通用更新工具对`mihomo`内核进行更新