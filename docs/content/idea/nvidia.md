
---

title: "NVIDIA驱动安装教程"
date: "2024-12-03"
category: "idea"
tags: ["NVIDIA", "驱动", "教程"]
---

好的，当然可以。根据我们整个排错过程，我为您整理了一份完整的、从头到尾的教程。这份教程涵盖了所有关键步骤和我们遇到的常见问题，可以帮助您或其他用户一次性成功安装。

### **如何在启用 Secure Boot 的 Linux 系统上正确安装 NVIDIA 官方驱动**

在许多现代 Linux 发行版中，UEFI 的安全启动（Secure Boot）功能默认是开启的。这项安全功能要求所有加载到内核中的模块都必须经过受信任的密钥签名。由于 NVIDIA 的官方驱动是闭源的专有驱动，它并未被系统默认信任，这导致了安装过程中的主要障碍。

本教程将指导您完成整个过程：正确地为 NVIDIA 驱动签名，并将该签名注册到您系统的信任密钥库中（MOK）。

#### **〇、准备工作**

在开始之前，请确保您已经从 NVIDIA 官网下载了与您的显卡型号和系统版本匹配的 `.run` 驱动文件。

1. **安装编译工具和内核头文件**
    NVIDIA 驱动需要在您的系统上进行编译，因此必须安装必要的开发工具。

    * **对于 Debian / Ubuntu 系统：**

        ```bash
        sudo apt update
        sudo apt install build-essential linux-headers-$(uname -r)
        ```

    * **对于 RHEL / CentOS / Fedora 系统：**

        ```bash
        sudo dnf groupinstall "Development Tools"
        sudo dnf install kernel-headers-$(uname -r) kernel-devel-$(uname -r)
        ```

2. **禁用开源 Nouveau 驱动**
    Nouveau 是与 NVIDIA 官方驱动冲突的开源驱动，必须禁用它。

    * 创建一个新的黑名单文件：

        ```bash
        sudo nano /etc/modprobe.d/blacklist-nouveau.conf
        ```

    * 在该文件中添加以下两行内容：

        ```
        blacklist nouveau
        options nouveau modeset=0
        ```

    * 保存文件并退出。然后更新系统的内核初始内存盘 (initramfs) 并重启。
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

重启后，我们将进入纯文本模式进行安装，以避免与图形界面冲突。

1. **进入文本模式**
    登录系统后，执行以下命令：

    ```bash
    sudo systemctl isolate multi-user.target
    ```

    屏幕会变黑，然后出现命令行登录提示，请用您的用户名和密码登录。

2. **运行安装程序**
    * 首先，进入您存放 `.run` 驱动文件的目录。
    * 赋予文件可执行权限：

        ```bash
        chmod +x ./NVIDIA-Linux-x86_64-*.run 
        ```

    * 以 `sudo` 权限运行安装程序：

        ```bash
        sudo ./NVIDIA-Linux-x86_64-*.run
        ```

3. **在安装向导中做出关键选择**
    * `Accept` 许可协议。
    * `Would you like to register the kernel module sources with DKMS?` -> **选择 Yes**。
    * `Would you like to sign the NVIDIA kernel module?` -> **选择 Sign the kernel module** (或 Yes)。
    * `Would you like to ... generate a new one?` -> **选择 Generate a new key pair**。

4. **设置密码**
    * 接下来，安装程序会提示您为新生成的密钥**创建一个密码**。
    * **请务必设置一个您能记住的临时密码**，因为在下一步重启后您马上需要用到它。根据提示输入两次密码。
    * 之后，安装程序会继续进行直到完成。

#### **二、注册密钥 (MOK) 并完成安装**

这是整个过程中最关键、也最容易被忽略的一步。

1. **重启电脑**
    安装完成后，根据提示重启。

    ```bash
    sudo reboot
    ```

2. **在 MOK 管理界面进行操作**
    * 重启时，电脑**不会**直接进入系统。它会暂停在一个蓝色的、标题为 **"Perform MOK Management"** 的界面。
    * 使用键盘的 `↑` `↓` `Enter` 键进行操作：
        1. 选择 **Enroll MOK** (注册MOK)。
        2. 选择 **Continue** (继续)。
        3. 系统会提示您输入密码以确认。**请输入您在上一步设置的那个临时密码。**
        4. 确认后，选择 **Reboot** (重启)。

#### **三、验证安装**

电脑最后一次重启后，便会加载已获得信任的 NVIDIA 驱动。

1. 登录系统后，打开终端。
2. 检查 NVIDIA 内核模块是否已全部加载：

    ```bash
    lsmod | grep nvidia
    ```

    您应该能看到一个包含 `nvidia`, `nvidia_uvm`, `nvidia_drm` 等多个模块的列表。

3. 运行 `nvidia-smi` 命令：

    ```bash
    nvidia-smi
    ```

    如果成功，它将显示您的 GPU 型号、驱动版本和 CUDA 版本等信息。

---

### **常见问题与故障排除 (FAQ)**

* **问：重启后没有出现蓝色的 MOK 管理界面怎么办？**
    **答：** 这是最常见的问题。
    1. **首选方案：** 尝试一次**完全关机**再开机（`sudo shutdown now`），而不是重启。
    2. **可靠方案：** 如果冷启动仍然无效，说明注册请求没有被正确设置。请登录系统，手动运行以下命令：

        ```bash
        sudo mokutil --import /usr/share/nvidia/nvidia-modsign-crt-*.der
        ```

        （请使用 `Tab` 键自动补全文件名）
        该命令会要求您**设置一个新密码**。设置完毕后，再次重启 (`sudo reboot`)，这次您应该就能看到蓝色的 MOK 界面了。

* **问：安装程序没有提示我“设置”密码，直接就完成了怎么办？**
    **答：** 这同样意味着注册请求未能自动触发。解决方法和上一个问题中的“可靠方案”完全一样：手动运行 `sudo mokutil --import ...` 命令来设置密码并重启。

* **问：我完成了所有步骤，但 `nvidia-smi` 还是报错怎么办？**
    **答：** 99% 的可能性是 MOK 密钥注册没有成功（例如在蓝色界面输错了密码或直接跳过了）。请回到**常见问题解答**的第一条，使用 `mokutil` 命令重新发起注册请求，并确保在重启时正确地完成 MOK 界面的所有操作。
