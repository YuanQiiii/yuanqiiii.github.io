---
title: 如何在启用 Secure Boot 的 Linux 系统上正确安装 NVIDIA 官方驱动（推荐与进阶方法）
description: 文章描述
date: 2025-6-20
tags:
  - Linux
  - NVIDIA
  - Boot
author: shihuaidexianyu
---
### **如何在启用 Secure Boot 的 Linux 系统上正确安装 NVIDIA 官方驱动**

在许多现代 Linux 发行版中，UEFI 的安全启动（Secure Boot）功能默认是开启的。这项安全功能要求所有加载到内核中的模块都必须经过受信任的密钥签名。由于 NVIDIA 的官方驱动是闭源的专有驱动，它并未被系统默认信任，这给安装过程带来了挑战。

本文将提供两种方法来解决这个问题：

1. **推荐方法：使用包管理器 (apt)** - 这是最适合 Ubuntu/Debian 用户的方案。它更简单，能通过动态内核模块支持 (DKMS) 更好地与系统集成，并在内核更新时自动重新编译驱动。
2. **进阶方法：使用 NVIDIA 官方 `.run` 脚本** - 这种方法提供了最新版本的驱动，但过程更手动，且更容易在系统更新后出现问题。

无论哪种方法，核心步骤都是为 NVIDIA 驱动模块签名，并将该签名注册到您系统的信任密钥库中（MOK）。

### **方法一：推荐方案 - 使用包管理器 (APT) 安装**

此方法适用于 Debian、Ubuntu、Linux Mint 及其他衍生发行版。

#### **〇、准备工作**

1. **确认 Secure Boot 已启用**
    打开终端，运行以下命令：

    ```bash
      mokutil --sb-state
      # 如果输出为 `SecureBoot enabled`，您就需要遵循本指南。
    ```

2. **确保系统已是最新状态**

    ```bash
    sudo apt update
    sudo apt upgrade
    ```

3. **安装必备工具**
    `dkms` 能够在内核更新时自动重新编译 NVIDIA 模块，`mokutil` 用于管理 Secure Boot 密钥。

    ```bash
    sudo apt install dkms mokutil
    ```

4. **(仅限 Debian 12+) 启用 non-free-firmware**
    确保您的 `/etc/apt/sources.list` 文件中包含了 `non-free-firmware` 部分。

    ```bash
    # 示例:
    # deb http://deb.debian.org/debian/ bookworm main non-free-firmware
    sudo sed -i 's/ main/ main non-free-firmware/g' /etc/apt/sources.list
    sudo apt update
    ```

#### **一、安装驱动并配置 MOK 密钥**

1. **自动安装推荐驱动 (最简单)**
    Ubuntu 提供了一个便捷的工具来自动检测并安装最适合您硬件的驱动。

    ```bash
    sudo ubuntu-drivers autoinstall
    ```

2. **（备选）手动选择并安装驱动**
    如果您想安装特定版本的驱动，可以先列出所有可用版本：

    ```bash
    apt search nvidia-driver
    ```

    然后安装您选择的版本，例如 `nvidia-driver-550`：

    ```bash
    sudo apt install nvidia-driver-550
    ```

3. **配置 Secure Boot 密码**
    在安装过程中，终端中会出现一个蓝色的背景窗口，标题为 **"Configuring secure boot"**。

      * 这是一个文本图形界面，使用 `Tab` 键移动光标，`Enter` 键确认。
      * 当被问到是否为 Secure Boot 创建一个 MOK (Machine Owner Key) 时，选择 **\<Ok\>**。
      * 接下来，它会提示您 **"Enter a new password"**。**请设置一个您能记住的临时密码**，并再次输入以确认。这个密码将在下一步重启时使用。

#### **二、重启并在 MOK 管理界面注册密钥**

1. **重启电脑**
    完成上一步后，保存所有工作并重启。

    ```bash
    sudo reboot
    ```

2. **进入 MOK 管理界面**

      * 重启时，电脑**不会**直接进入系统。它会暂停在一个蓝色的、标题为 **"Perform MOK Management"** 的界面。
      * 如果没看到这个界面，请参考文末的 FAQ。
      * 使用键盘的 `↑` `↓` `Enter` 键进行操作：
        1. 选择 **Enroll MOK** (注册MOK)。
        2. 屏幕上可能会显示密钥信息，选择 **Continue** (继续) 或 **View key 0** 后再 Continue。
        3. 系统会提示您输入密码以确认 (`enroll the key(s)?`)。**请输入您在上一步设置的那个临时密码。**
        4. 输入正确后，选择 **Reboot** (重启)。

#### **三、验证安装**

电脑最后一次重启后，便会加载已获得信任的 NVIDIA 驱动。

1. 登录系统后，打开终端。

2. 运行 `nvidia-smi` 命令：

    ```bash
    nvidia-smi
    ```

    如果成功，它将显示您的 GPU 型号、驱动版本和 CUDA 版本等信息。

3. 检查内核模块是否已加载：

    ```bash
    lsmod | grep nvidia
    ```

    您应该能看到一个包含 `nvidia`, `nvidia_uvm`, `nvidia_drm` 等多个模块的列表。

-----

### **方法二：进阶方案 - 使用 NVIDIA 官方 .run 脚本**

仅在包管理器中没有您需要的驱动版本时，才推荐此方法。

#### **〇、准备工作**

1. **下载驱动**
    从 [NVIDIA 官网](https://www.nvidia.com/Download/index.aspx)下载与您的显卡型号和系统版本匹配的 `.run` 驱动文件。

2. **安装编译工具和内核头文件**

      * **Debian / Ubuntu 系统：**

        ```bash
        sudo apt update
        sudo apt install build-essential linux-headers-$(uname -r)
        ```

      * **RHEL / CentOS / Fedora 系统：**

        ```bash
        sudo dnf groupinstall "Development Tools"
        sudo dnf install kernel-devel kernel-headers
        ```

3. **禁用开源 Nouveau 驱动**

      * 创建一个新的黑名单文件：

        ```bash
        sudo nano /etc/modprobe.d/blacklist-nouveau.conf
        ```

      * 在该文件中添加以下内容：

        ```
        blacklist nouveau
        options nouveau modeset=0
        ```

      * 保存文件，然后更新内核初始内存盘 (initramfs) 并重启。
          * **Debian / Ubuntu：**

            ```bash
            sudo update-initramfs -u
            sudo reboot
            ```

          * **RHEL / CentOS / Fedora：**

            ```bash
            sudo dracut --force
            sudo reboot
            ```

#### **一、执行安装与签名**

重启后，进入纯文本模式以避免与图形界面冲突。

1. **进入文本模式**
    登录系统后，执行：`sudo systemctl isolate multi-user.target`。在命令行提示符下重新登录。

2. **运行安装程序**

      * 进入您存放 `.run` 文件的目录，并赋予其执行权限：

        ```bash
        chmod +x ./NVIDIA-Linux-x86_64-*.run
        ```

      * 以 `sudo` 权限运行：

        ```bash
        sudo ./NVIDIA-Linux-x86_64-*.run
        ```

3. **在安装向导中做出关键选择**

      * `Accept` 许可协议。
      * `Would you like to register the kernel module sources with DKMS?` -\> **选择 Yes**。
      * `Would you like to sign the NVIDIA kernel module?` -\> **选择 Sign the kernel module**。
      * `Generate a new key pair` -\> **选择 Generate a new key pair**。
      * 安装程序会提示您为新密钥**创建一个密码**。**请务必设置一个您能记住的临时密码**，下一步重启后需要用到。
      * 继续完成安装。

#### **二、注册密钥 (MOK) 并完成安装**

此步骤与 APT 方法中的 MOK 注册完全相同。

1. **重启电脑** (`sudo reboot`)。
2. 在蓝色的 **"Perform MOK Management"** 界面：
    1. 选择 **Enroll MOK**。
    2. 选择 **Continue**。
    3. 输入您在安装向导中设置的**临时密码**。
    4. 选择 **Reboot**。

#### **三、验证安装**

重启后，登录系统并打开终端，运行 `nvidia-smi` 和 `lsmod | grep nvidia` 进行验证。

-----

### **常见问题与故障排除 (FAQ)**

* **问：重启后没有出现蓝色的 MOK 管理界面怎么办？**
    **答：** 这是最常见的问题，意味着密钥注册请求未被您的 UEFI 系统捕获。

    1. **通用解决方案：** 尝试一次**完全关机**再开机 (`sudo shutdown now`)，而不是重启。
    2. **手动触发注册 (适用于 APT 和 .run 方法)：** 如果冷启动无效，您需要手动发起注册请求。
          * 首先找到密钥文件。对于 `.run` 脚本安装，它通常在 `/usr/share/nvidia/nvidia-modsign-crt-*.der`。对于 `apt` 安装的 `dkms` 模块，它通常在 `/var/lib/shim-signed/mok/MOK.der` 或 `/var/lib/dkms/mok.key`。
          * 使用 `mokutil` 导入它。以 `.run` 脚本为例：

            ```bash
            # 使用 Tab 键自动补全文件名
            sudo mokutil --import /usr/share/nvidia/nvidia-modsign-crt-*.der 
            ```

          * 此命令会要求您**设置一个新密码**。设置完毕后，执行 `sudo reboot`，这次您应该就能看到蓝色的 MOK 界面了。
    3. **(仅限 APT 方法)** 您也可以尝试重新配置 dkms 包，这通常会自动再次弹出密码设置窗口：

        ```bash
        # 将 nvidia-dkms-550 替换为您安装的版本
        sudo dpkg-reconfigure nvidia-dkms-550 
        ```

* **问：我完成了所有步骤，但 `nvidia-smi` 还是报错 (如 `NVIDIA-SMI has failed...`)？**
    **答：** 99% 的可能性是 MOK 密钥注册没有成功（例如在蓝色界面输错了密码、选择了 "Reboot" 而不是 "Enroll MOK"、或直接跳过了）。请回到上一个问题，使用 `mokutil` 或 `dpkg-reconfigure` 命令重新发起注册请求，并确保在重启时正确地完成 MOK 界面的所有操作。

* **问：内核更新后驱动失效了怎么办？**
    **答：**

  * **APT 方法：** 如果您正确安装了 `dkms`，它应该会自动为新内核编译并签名驱动，无需任何操作。如果失效，说明 `dkms` 配置可能存在问题。
  * **.run 脚本方法：** 即使您在安装时选择了 DKMS，它也可能在某些内核大版本更新后失效。您需要**重新运行一遍 `.run` 安装程序**来为新内核编译驱动。这也是我们优先推荐 APT 方法的主要原因。

* **问：如何卸载驱动？**
    **答：** 必须使用与安装时对应的方法！

  * **APT 安装的驱动：**

      ```bash
        # 这会彻底清除所有 NVIDIA 相关的包
        sudo apt autoremove --purge nvidia-*
      ```

  * **.run 脚本安装的驱动：**

      ```bash
        # 使用你安装时的同一个 .run 文件，加上 --uninstall 参数
        sudo ./NVIDIA-Linux-x86_64-*.run --uninstall
      ```
