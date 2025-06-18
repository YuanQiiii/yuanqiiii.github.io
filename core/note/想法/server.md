# 如何从零开始，将一台旧笔记本变身为家庭服务器？

## 动机

如果你想部署像 LobeChat 这样的自定义服务，搭建一个个人小网站，或者运行一些需要长时间在线的程序，你很可能会陷入一个两难的境地：云服务器性能羸弱，价格不菲；自己的主力笔记本又无法 24 小时不间断运转。

> [!note]
> 归根结底，还是钞能力不足导致的。

这时，一个念头或许会像灯泡一样“叮”地亮起：💡 欸，我是不是可以自己搭建一台服务器呢？

于是你兴冲冲地去查专业服务器的价格，结果却被现实泼了一盆冷水——那宽度堪比两个你的机身、上千瓦的功耗，还有价格后面那一长串零，都让你望而却步。你开始幻想自己拥有一台能无瓶颈运行所有程序的超级服务器，但这终究只是幻想。

现实是，你打开了闲鱼，想淘一台二手小主机或 NUC。然而，就在你为了选到配置合理、价格合适的机器而和各路“奸商”斗智斗勇，心力交瘁时，你哥听说了你的烦恼。他表示自己正好有台闲置的笔记本，虽然已是几年前的“老将”，但其配置作为入门服务器却相当可观。

于是，在考试结束的那天，你收到了一个沉甸甸的大包裹。随着包裹的开启，你的服务器踩坑之旅，也正式拉开了序幕。

## 安装前准备

将旧笔记本改造为服务器，是一个绝佳的选择。它自带的电池就是一台天然的 **UPS（不间断电源）**，能在意外断电时为系统提供缓冲时间，从容地关闭服务并安全关机，避免了数据损坏的风险。部分设备甚至还能设置来电后自动开机（或通过网络唤醒），省下了一笔购买 UPS 和外围设备的费用。

但这台笔记本预装的是 Windows 系统，而我们的目标是更适合服务器环境的 Linux 系统。这两种系统之间存在着巨大的差异。

起初，我尝试使用“微PE”启动盘来安装系统。我用内置的 DiskGenius 工具删除了硬盘里的所有分区，并按照推荐配置重建了分区（**这里埋下了一个巨大的伏笔**）。然而，当我试图安装从 Ubuntu 官网下载的 Server 镜像时，却发现无论如何都无法成功。

无奈之下，我请教了 Gemini 老师，它清晰地指出了我的问题所在：

> **Q: 我如何使用微PE安装Ubuntu❓**
> **A:** 好的，这是一个非常有趣的问题。需要先澄清一个重要的概念：
>
> ### **直接回答：不推荐，且通常无法用微PE的安装工具直接安装Ubuntu**
>
> 微PE（WePE）是一个 **Windows 预安装环境**（Windows PE）。它内置的“Windows安装器”或“CGI备份还原”等工具，是专门为安装 Windows 系统镜像（`.wim` 或 `.esd` 文件）而设计的。
>
> 而 Ubuntu 使用的是完全不同的安装逻辑和文件系统：
>
>   - **安装程序不同**：Ubuntu 使用名为 `Ubiquity` (桌面版) 或 `Subiquity` (服务器版) 的安装向导。
>   - **引导方式不同**：Ubuntu 使用 `GRUB2` 作为引导加载程序，而 Windows 使用 Windows Boot Manager。
>   - **镜像结构不同**：Ubuntu 的 ISO 文件结构与 Windows 的完全不同。
>
> **简单来说，用拧螺丝的螺丝刀去锤钉子，工具不对，所以行不通。**
>
> -----
>
> ### ✅ **正确且最简单的方法：制作专门的Ubuntu启动盘**
>
> 你应该跳过使用微PE的步骤，直接为Ubuntu创建一个专用的启动U盘。这才是标准且成功率最高的做法。
>
> **操作步骤如下：**
>
> 1.  **下载Ubuntu镜像**：
>       - 访问 [Ubuntu Server官方网站](https://ubuntu.com/download/server) 下载最新的 `.iso` 镜像文件。
> 2.  **下载启动盘制作工具**：
>       - 推荐使用 **Rufus** (Windows平台) 或 **balenaEtcher** (跨平台)。这两个工具专门用于将ISO文件正确地写入U盘，并设置好引导。
> 3.  **使用Rufus制作Ubuntu启动盘（以Rufus为例）**：
>       - 准备一个**8GB或以上**的U盘（**过程会清空U盘，请务必备份！**）。
>       - 打开Rufus，它会自动检测到你的U盘。
>       - 点击“**选择**”，找到你下载的 Ubuntu `.iso` 文件。
>       - **分区类型**选择“**GPT**”，**目标系统**选择“**UEFI (非CSM)**”。这是目前新电脑的主流标准。
>       - 其他选项保持默认即可。
>       - 点击“**开始**”，Rufus会弹出一个窗口提示，选择“**以DD镜像模式写入**”。这一点对于制作Linux启动盘很重要。
>       - 点击“确定”并等待制作完成。
> 4.  **安装Ubuntu**：
>       - 将制作好的U盘插入目标电脑。
>       - 重启电脑，在开机时反复按 `F2`, `F12`, `DEL`, `ESC` 等键（具体按键因电脑品牌而异，可自行搜索“*你的电脑品牌* + a BIOS key”）进入BIOS/UEFI设置。
>       - 在 **Boot** 或 **启动** 菜单中，将**启动顺序**（Boot Order）设置为U盘优先。
>       - 保存并退出，电脑将从U盘启动并进入Ubuntu的安装界面。
>       - 之后按照提示一步步完成安装即可。
>
> -----
>
> ### 💡 **一种变通方案：使用Ventoy（推荐的多系统启动盘方案）**
>
> 如果你希望一个U盘上既有微PE又能安装Ubuntu，那么**Ventoy**是你的最佳选择。
>
> Ventoy的原理是：你把U盘制作成Ventoy启动盘后，**只需要把 `.iso` 文件（无论是微PE的还是Ubuntu的）直接拷贝到U盘里就行了**，不需要反复格式化制作。
>
> **如何使用Ventoy:**
>
> 1.  **下载并制作Ventoy盘**：
>       - 访问 [Ventoy官网](https://www.ventoy.net/cn/download.html) 下载工具。
>       - 解压后运行 `Ventoy2Disk.exe`。
>       - 选择你的U盘，点击“**安装**”。（**警告：同样会格式化U盘！**）
> 2.  **拷贝ISO文件**：
>       - 安装完成后，U盘会变成一个名为“Ventoy”的普通盘。
>       - 将你下载好的 **`Windows.iso`**、**`微PE.iso`** 和 **`ubuntu-xx.xx-server-amd64.iso`** 文件，直接复制粘贴到这个U盘里。
> 3.  **启动和使用**：
>       - 用这个U盘启动电脑。
>       - 电脑会进入一个Ventoy菜单，上面会列出你拷贝进去的所有ISO文件。
>       - 你想用微PE，就选择微PE的ISO启动；想安装Ubuntu，就选择Ubuntu的ISO启动。
>
> 这个方法完美地解决了你想把多个工具和系统放在同一个U盘上的需求，是目前最流行、最方便的多系统启动盘制作方案。

我采纳了 Gemini 的建议，使用 [Rufus](https://rufus.ie/zh/) 来制作启动盘。它的官网文档清晰，软件也支持中文(需要自行设置)，我选择下载了便携版。

## 安装过程

### 最大的拦路虎：恼人的分区

制作好启动盘后，插入旧笔记本，开机进入启动选项，选择从U盘启动，在引导菜单中选择 `Try or Install Ubuntu Server`，一切似乎都非常顺利。

你可能觉得胜利在望，如果你没有像我一样事先用 Windows 工具进行分区，那么恭喜你，你的安装过程大概率会一帆风ushun。

但别忘了那个**伏笔**：我之前通过 DiskGenius 创建的分区，在这里成为了安装 Ubuntu 最大的阻碍。

具体的症状是：安装进程会在各个阶段（尤其是在配置即将完成，准备开始写入文件时）毫无征兆地突然终止并报错。起初我以为是偶然的 Bug，反复重启了多次安装程序，但问题依旧。我没有去费力地抄写无法复制的错误日志，而是选择求助于 Google。经过一番搜索，我发现这个问题在目标磁盘存在“不干净”的分区时频繁出现。

[Reddit上的这个帖子](https://www.reddit.com/r/linux4noobs/comments/13ot7pa/sorry_there_was_a_problem_completing_the/?tl=zh-hans)描述的症状和我的情况几乎完全一致。关联到我之前的分区操作，我有八成的把握确定这就是问题根源。

### 解决方案：彻底擦除分区表

要解决这个问题，就必须彻底清除硬盘上所有的分区信息。我本以为这需要借助另一个PE系统，但实际上 Ubuntu 的安装环境自身就提供了强大的工具。

在安装程序最开始选择语言的界面，注意看右上角，有一个 `Help` 菜单。点击它可以打开一个 Shell（命令行终端），让我们能够直接对磁盘进行底层操作。

输入以下命令来识别并擦除目标硬盘：

> [!warning]
> **危险操作警告！** 下面的命令会**瞬间、彻底、不可恢复地删除目标磁盘上的所有数据和分区信息**。请务必再三确认你选择了正确的磁盘！不要误操作擦除了你的U盘或更重要的硬盘！

1.  **第一步：识别你的硬盘**

    ```bash
    # -d 参数确保只列出物理磁盘，而不是分区。
    # -o NAME,SIZE,MODEL 参数可以让你根据磁盘型号和大小来判断。
    lsblk -d -o NAME,SIZE,MODEL 
    ```

    执行后，你会看到类似 `/dev/sda` (通常是主硬盘) 和 `/dev/sdb` (可能是你的U盘) 的输出。请根据容量和型号，准确判断出笔记本内置硬盘的名称。例如，一个 256GB 的内置硬盘会显示 `238.5G` 左右。

2.  **第二步：擦除分区表签名**

    ```bash
    # wipefs 是一个专门用来擦除文件系统、RAID或分区表签名的工具，非常快速有效。
    # 请将下面的 /dev/sdX 换成你上一步确认的实际硬盘名称！
    sudo wipefs -a -f /dev/sdX
    ```

> [!tip]
> **关于路径的小提示**
> 在开源项目中，你经常会看到 `path/to/your/directory` 这样的占位符。这意味着你需要将它替换成你自己的实际路径。在 Linux 命令行中，可以使用 `pwd` (Print Working Directory) 命令来查看当前所在目录的绝对路径。

### 继续安装

完成了磁盘擦除这一关键步骤后，退出 Shell 回到安装界面，接下来的过程就非常顺畅了。你可以完全参照官方文档进行。

  - **官方文档参考**: [Install Ubuntu Server](https://ubuntu.com/tutorials/install-ubuntu-server)

**几个关键步骤提醒：**

1.  **网络配置**：在安装阶段就应该配置好网络。如果你的有线网络（如校园网）需要特殊认证，建议先连接到一个简单的 Wi-Fi（如手机热点），因为安装过程中需要从网络下载一些必要的更新和软件包。
2.  **存储配置**：当询问如何使用磁盘时，选择 `Use an entire disk` (使用整个磁盘)，然后选择你刚刚擦除过的那块硬盘。安装程序会自动为你创建最佳的分区方案。
3.  **用户配置**：设置你的服务器名称（hostname）、用户名和密码。请牢记它们，这是你之后登录的凭证。
4.  **SSH 设置**：在安装过程中，会有一个页面询问是否安装额外的软件包。**务必、务必、务必**勾选 `Install OpenSSH server`。这将允许你通过网络远程连接和管理你的服务器，是无头（headless）服务器的必备功能。

## 首次启动与优化

安装完成后，根据提示拔下你的启动U盘，然后选择 `Reboot` 重启系统。

等待片刻，你将看到一个黑色的命令行登录界面。使用你之前设置的用户名和密码登录。

此时，为了让服务器在非云环境下启动得更快，我们需要禁用 `cloud-init` 服务。

> ### 为什么要禁用 `cloud-init`？
>
> `cloud-init` 是一个在云服务器（如AWS, 阿里云）首次启动时，用于自动配置网络、主机名、SSH密钥等的工具。它会在开机时尝试连接云平台的元数据服务。
>
> 在我们自己的笔记本上，并不存在这样的云环境。这会导致 `cloud-init` 在每次开机时都去连接一个不存在的地址，在多次尝试失败后才会超时放弃，这个过程会**严重拖慢系统的启动速度**（可能会卡住几十秒到几分钟）。
>
> 因此，在家庭或本地服务器上，禁用它是一个标准的优化步骤。
>
> *引用自 [[旧笔记本装UbuntuServer用作家庭媒体服务器]](https://www.cnblogs.com/useraka/p/18199886) 的观点并加以补充。*

执行以下命令来禁用 `cloud-init`：

```bash
# 创建一个特定的空文件即可禁用该服务
sudo touch /etc/cloud/cloud-init.disabled
```

这个操作是可逆的，如果未来有需要，删除这个文件即可重新启用它。

笔记本可能还需要考虑合盖休眠和关机的问题，防止笔记本合盖或长时间进入休眠无法访问
```bash
vim /etc/systemd/logind.conf
# 在打开的文件中找到HandleLidSwitch，去掉HandleLidSwitch项的注释使生效，并修改为HandleLidSwitch = ignore
# 重启服务使生效
sudo service systemd-logind restart
```



## 网络配置与远程连接 (SSH)

服务器的最终形态应该是“无头”的——即不连接显示器和键盘，静静地在角落里运行，我们通过另一台电脑远程管理它。这就是我们之前安装 OpenSSH 的原因。

1.  **连接网络**

      - **家庭网络（推荐）**：这是最简单的方式。直接将笔记本用网线连接到你的路由器。Ubuntu 系统通常会自动通过 DHCP 获取到 IP 地址，无需额外操作。
      - **校园网/特殊网络**：如果你的网络环境需要通过网页或客户端认证（即“强制门户”/ Captive Portal），事情会复杂一些。你需要找到一种在命令行下完成认证的方法。例如，某些学校的网络可以通过 `curl` 命令发送 POST 请求来完成登录：
        ```bash
        # 这是一个特定于北京大学网络的示例，你需要根据你的网络环境进行修改
        curl -X POST -d 'cmd=open&username=你的学号&password=你的密码&iprange=free' https://its4.pku.edu.cn/cas/ITSClient
        ```
        > [!tip]
        > 为了方便，你可以将这条命令保存到一个名为 `net.sh` 的文件中，之后每次需要认证时，只需运行 `bash net.sh` 即可。

2.  **获取服务器 IP 地址**
    连接好网络后，在服务器的终端里输入以下命令来查看其 IP 地址：

    ```bash
    # ip addr show 是比 ifconfig 更现代的命令
    ip addr show
    ```

    在输出的信息中，找到你的有线网卡（通常名为 `eth0` 或 `enpXsY` 格式），记下它后面的 `inet` 地址，例如 `192.168.1.101`。

3.  **进行 SSH 远程连接**
    现在，回到你自己的电脑（Windows/macOS/Linux 均可），打开终端（Windows 推荐使用 Windows Terminal 或 PowerShell），输入以下命令：

    ```bash
    # 将 your_username 和 your_ip 替换为你的实际信息
    ssh your_username@your_ip
    ```

    例如：`ssh myuser@192.168.1.101`。

    首次连接时，系统会询问你是否信任该主机的指纹，输入 `yes` 并回车。然后输入你的服务器密码，如果一切正确，你将成功登录到你的服务器！

> [!tip]
>
> 进一步的，你可以通过`authorized_keys`中加入你使用的设备的公钥来完成不需要密码的登录
>
> ```bash
> vim ~/.ssh/authorized_keys
> ```
>
> 再进一步，在你自己使用的设备的`.ssh`目录下的`config`文件中加入如下内容
>
> ```bash
> Host $your_server_name$
>   HostName $your_ip$
>   User $your_username$
> # 此处还可以配置链接的端口等更多更精细的配置,如果有需要,可以自行查询如何操作
> # tip:如果你的github访问失败,可以考虑更换端口,操作和此方式类似
> ```
>
> 请自行替换上面的内容，然后使用如下的命令链接服务器
>
> ```bash
> ssh your_server_name
> ```

## 完成

那么成功启动之后，你可能会看到这么一段话。

```bash
Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0-60-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Wed Jun 18 01:30:32 AM UTC 2025

  System load:           0.05
  Usage of /:            1.5% of 467.35GB
  Memory usage:          3%
  Swap usage:            0%
  Temperature:           62.4 C
  Processes:             273
  Users logged in:       1
  IPv4 address for eno1: 192.168.1.10
  IPv6 address for eno1: 2001:db8::abcd:1234

1 device has a firmware upgrade available.
Run `fwupdmgr get-upgrades` for more information.


Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status



*******************************************
* [Your Awesome Home Server]         *
*******************************************

1 device has a firmware upgrade available.
Run `fwupdmgr get-upgrades` for more information.

Last login: Tue Jun 17 23:57:33 2025 from xxx.xxx.xxx.xxx
```

你可能想要修改它，使其更加美观彰显你的个性（虽然可能没什么人看就是了），下面是Gemini给出的方案

> 您看到的这段文字是 Ubuntu Server 登录后显示的 **MOTD (Message of the Day)**。
>
> 在现代的 Ubuntu 系统中，这个 MOTD 不是一个简单的静态文本文件，而是由一系列脚本动态生成的。这使得它能够显示系统负载、更新状态、IP 地址等实时信息。
>
> 要修改它，您需要了解它的工作原理并编辑或禁用相关的脚本。这些脚本通常位于 `/etc/update-motd.d/` 目录下。
>
> ---
>
> ### 理解 MOTD 的构成
>
> 让我们先分解一下您看到的这段文字，看看它们分别来自哪里：
>
> * **`Welcome to Ubuntu...` 和 `Documentation...` 等链接**: 通常来自 `/etc/update-motd.d/00-header` 和 `/etc/update-motd.d/10-help-text`。
> * **`System information as of...`**: 这部分动态信息（系统负载、磁盘使用率等）来自 `/etc/update-motd.d/50-landscape-sysinfo`。
> * **`Strictly confined Kubernetes...`**: 这是来自 Canonical 的新闻或广告，由 `/etc/update-motd.d/50-motd-news` 控制。
> * **`Expanded Security Maintenance...`**: 关于 Ubuntu Pro (ESM) 的信息，通常来自 `/etc/update-motd.d/88-esm-announce` 或类似脚本。
> * **`0 updates can be applied...`**: 更新信息，来自 `/etc/update-motd.d/90-updates-available`。
> * **`Last login...`**: **请注意**，这最后一行不是 MOTD 的一部分。它是由 `login` 程序或 `sshd` 服务本身提供的，用于显示上次登录的信息。
>
> ---
>
> ### 修改 MOTD 的方法
>
> 您可以选择禁用某些部分、修改它们或添加您自己的信息。
>
> #### 方法一：禁用某些部分（最简单、最安全）
>
> 如果您只是想去掉某些信息（比如广告或系统详情），最简单的方法是移除对应脚本的执行权限。
>
> 1.  **列出所有 MOTD 脚本**:
>     ```bash
>     ls -l /etc/update-motd.d/
>     ```
>     您会看到类似 `00-header`, `10-help-text`, `50-motd-news` 等文件，它们都是可执行的。
>
> 2.  **移除执行权限以禁用脚本**:
>     * **想去掉广告/新闻？** 禁用 `50-motd-news`：
>         ```bash
>         sudo chmod -x /etc/update-motd.d/50-motd-news
>         ```
>     * **想去掉系统详细信息？** 禁用 `50-landscape-sysinfo`：
>         ```bash
>         sudo chmod -x /etc/update-motd.d/50-landscape-sysinfo
>         ```
>     * **想去掉 ESM/Ubuntu Pro 的提示？** 禁用 `88-esm-announce`：
>         ```bash
>         sudo chmod -x /etc/update-motd.d/88-esm-announce
>         ```
>
>     **恢复**：如果想恢复显示，只需重新添加执行权限即可：`sudo chmod +x /etc/update-motd.d/50-motd-news`。
>
> #### 方法二：创建完全自定义的静态 MOTD
>
> 如果您不想要任何动态信息，只想显示一个简单的自定义欢迎语，可以这样做：
>
> 1.  **禁用所有动态脚本**（可选但推荐，以防万一）：
>     ```bash
>     # 创建一个备份目录
>     sudo mkdir /etc/update-motd.d.bak
>     # 移动所有脚本到备份目录
>     sudo mv /etc/update-motd.d/* /etc/update-motd.d.bak/
>     ```
>
> 2.  **创建或编辑静态 MOTD 文件** `/etc/motd`：
>     `pam_motd` 模块会首先寻找并显示 `/etc/motd` 的内容。
>     ```bash
>     # 使用 nano 编辑器创建/编辑文件
>     sudo nano /etc/motd
>     ```
>     在文件中输入任何您想显示的内容，例如：
>     ```
>     #################################################
>     #                                               #
>     #       Welcome to the Staging Server!          #
>     #       All activities are logged.              #
>     #                                               #
>     #################################################
>     ```
>     保存并退出 (在 nano 中是 `Ctrl+X`，然后按 `Y`，再按 `Enter`)。下次登录时，您将只看到这个静态消息。
>
> #### 方法三：添加自己的自定义信息
>
> 如果您想保留现有的动态信息，但想在最后添加一些自己的内容（比如服务器用途、联系方式等），可以创建一个新的脚本。
>
> 1.  **创建一个新的脚本文件**。文件名开头的数字决定了执行顺序，为了让它在最后显示，我们用 `99` 开头。
>     ```bash
>     sudo nano /etc/update-motd.d/99-custom-message
>     ```
>
> 2.  **在脚本中写入内容**。确保以 `#!/bin/sh` 开头，并使用 `echo` 或 `printf` 来输出您的消息。
>     ```bash
>     #!/bin/sh
>     printf "\n" # 打印一个空行，让格式更好看
>     printf "*******************************************\n"
>     printf "* This is the primary web server.         *\n"
>     printf "* Contact: admin@example.com for issues.  *\n"
>     printf "*******************************************\n"
>     ```
>
> 3.  **赋予脚本执行权限**，否则它不会运行！
>     ```bash
>     sudo chmod +x /etc/update-motd.d/99-custom-message
>     ```
>
> 现在，当您再次登录时，您自定义的消息就会出现在所有其他 MOTD 信息之后。
>
> ---
>
> ### 如何处理 `Last login:`
>
> 如前所述，`Last login:` 不是由 MOTD 系统控制的。它由 SSH 服务控制。虽然不建议禁用它（因为它是有用的安全信息），但如果您确实需要，可以修改 SSH 配置文件：
>
> 1.  编辑 `/etc/ssh/sshd_config` 文件：
>     ```bash
>     sudo nano /etc/ssh/sshd_config
>     ```
>
> 2.  找到 `PrintLastLog` 这一行，取消注释（去掉 `#`）并将其值改为 `no`：
>     ```
>     PrintLastLog no
>     ```
>
> 3.  重启 SSH 服务以使更改生效：
>     ```bash
>     sudo systemctl restart sshd
>     ```
>
> **总结**：对于大多数用户来说，**方法一（禁用不想要的脚本）** 和 **方法三（添加自定义脚本）** 是最常用和最灵活的。


好的，遵照您的要求，我将我们之前讨论过的所有内容——从电源自动化到网络唤醒，再到所有相关的排错步骤——整理成一篇完整的、系统化的教程。

---

## 进阶

**最终目标：**
* **停电保护**：在意外断电（拔掉电源）时能自动、安全地关机，保护数据和硬件。
* **自动恢复**：在电力恢复（插上电源）后能自动开机，恢复服务，无需人工干预。
* **按需唤醒**：在服务器关机状态下，可以通过网络随时随地远程启动它，兼顾节能与便利。

**准备工作：**
* 一台笔记本电脑。
* 已安装 Ubuntu Server 操作系统。
* 一根网线，将笔记本电脑连接到您的路由器（有线连接是网络唤醒最可靠的方式）。

---

### **第一章：配置电源自动化（可靠性核心）**

本章的目标是让服务器能够应对电源的意外中断与恢复。

#### **1.1 BIOS/UEFI 设置：实现“通电自动开机”**

这是实现自动恢复的基础，完全由硬件决定。

1.  **进入 BIOS/UEFI**：重启笔记本，在开机瞬间（品牌LOGO出现时）反复按下特定键（通常是 `F2`, `DEL`, `F10`, `ESC` 之一）进入设置界面。
2.  **寻找电源选项**：在 `Power`（电源）、`Power Management`（电源管理）或 `Advanced`（高级）菜单中，寻找类似以下名称的选项：
    * `Restore on AC/Power Loss`
    * `AC Power Recovery`
    * `Wake on AC` / `Power on AC`
    * `After Power Loss`
3.  **启用功能**：将该选项的值设置为 **`Power On`** 或 `Always On`。
4.  **保存退出**：按 `F10` 保存设置并重启。

> **测试**：将笔记本关机，拔掉电源。重新插上电源，如果笔记本自动启动，则此步骤成功。

#### **1.2 系统设置：实现“断电自动关机”**

我们将使用 `acpid` 服务来监听电源状态变化。

1.  **安装 acpid**：
    ```bash
    sudo apt update
    sudo apt install acpid
    ```
2.  **创建事件监听文件**：
    ```bash
    sudo nano /etc/acpi/events/power-off-on-battery
    ```
    粘贴以下内容：
    ```
    # 当交流电源适配器事件发生时触发
    event=ac_adapter.*
    action=/etc/acpi/actions/power-off.sh %e
    ```
    保存并关闭 (`Ctrl+X`, `Y`, `Enter`)。

3.  **创建关机动作脚本**：
    这个脚本包含了防止因“事件抖动”而重复关机的“锁文件”逻辑，是最佳实践。
    ```bash
    sudo nano /etc/acpi/actions/power-off.sh
    ```
    粘贴以下全部内容：
    ```bash
    #!/bin/bash
    # /etc/acpi/actions/power-off.sh
    # 使用锁文件确保关机命令只执行一次
    
    LOCK_FILE="/var/run/power-off-in-progress"
    
    # 如果锁文件已存在，则退出，防止重复执行
    if [ -f "$LOCK_FILE" ]; then
        exit 0
    fi
    
    # 检查电源状态 (0代表电池, 1代表交流电)
    # 路径可能为AC或ACAD，脚本会自动检测
    POWER_SUPPLY_PATH="/sys/class/power_supply/AC/online"
    if [ ! -f "$POWER_SUPPLY_PATH" ]; then
        POWER_SUPPLY_PATH="/sys/class/power_supply/ACAD/online"
    fi
    
    if [ -f "$POWER_SUPPLY_PATH" ] && [ "$(cat "$POWER_SUPPLY_PATH")" -eq 0 ]; then
        # 确认使用电池后，先创建锁文件
        touch "$LOCK_FILE"
        
        # 记录日志并关机
        logger "AC adapter unplugged. Initiating shutdown."
        /sbin/shutdown -h now
    fi
    
    exit 0
    ```
4.  **赋予脚本执行权限**：
    ```bash
    sudo chmod +x /etc/acpi/actions/power-off.sh
    ```
5.  **重启服务**：
    ```bash
    sudo systemctl restart acpid
    ```

---

### **第二章：配置网络远程唤醒（灵活性核心）**

本章的目标是让你可以在任何地方通过网络启动已关机的服务器。

#### **2.1 BIOS/UEFI 设置：启用“网络唤醒”**

1.  **再次进入 BIOS/UEFI**。
2.  在 `Power`、`Advanced` 或 `Onboard Devices` 菜单中，寻找类似以下名称的选项：
    * `Wake on LAN` (WOL)
    * `Wake on PME`
    * `Power on by PCI-E`
3.  **启用功能**：将该选项设置为 **`Enabled`**。
4.  **重要**：同时检查并**禁用**任何可能导致网卡彻底断电的深度节能选项，如 **`ErP Ready`**, **`Deep Sleep`** 等。

#### **2.2 系统设置：配置网卡待命**

1.  **获取网卡信息**：
    ```bash
    ip a
    ```
    在输出中找到你的**有线网卡**（如 `eno1` 或 `enp3s0`），并**准确记录下它的 MAC 地址**（`link/ether` 后面的那串字符）。这是网络唤醒的唯一ID。

2.  **配置 Netplan**：
    编辑 Netplan 的 YAML 配置文件（通常在 `/etc/netplan/` 目录下）。
    ```bash
    # 注意替换为你的真实文件名
    sudo nano /etc/netplan/01-netcfg.yaml
    ```
    在你的有线网卡配置下，添加 `wakeonlan: true`。
    ```yaml
    network:
      ethernets:
        eno1: # <--- 替换为你的网卡名
          dhcp4: true
          wakeonlan: true # <--- 添加此行
      version: 2
    ```
3.  **修正权限并应用配置**：
    为防止出现权限警告，先修正文件权限，然后应用配置。
    ```bash
    sudo chmod 600 /etc/netplan/01-netcfg.yaml
    sudo netplan apply
    ```

#### **2.3 发送唤醒指令**

从局域网内另一台设备发送“魔术包”。

* **在 Linux/macOS 上**：
    ```bash
    # 安装工具 (Debian/Ubuntu)
    sudo apt install wakeonlan
    # 发送指令 (使用你的MAC地址)
    wakeonlan YOUR_MAC_ADDRESS_HERE
    # 或者更精确地指定广播地址
    wakeonlan -i 192.168.1.255 YOUR_MAC_ADDRESS_HERE
    ```
* **在 Windows 或手机上**：
    在应用商店搜索 "Wake on LAN"，下载相应工具，输入目标服务器的MAC地址和广播地址（如`192.168.1.255`）即可。

---

### **第三章：常见问题排错指南**

如果配置后功能不正常，请按以下步骤检查。

#### **问题一：网络唤醒（WOL）无效**

这是最常见的问题，按以下流程排查。

**第一步：验证魔术包是否抵达服务器**
1.  手动启动你的服务器。
2.  安装 `tcpdump` 工具：`sudo apt install tcpdump`。
3.  运行监听命令（将 `eno1` 换成你的网卡名）：
    ```bash
    sudo tcpdump -i eno1 -X 'udp and (port 7 or port 9)'
    ```
4.  从另一台设备发送魔术包。
5.  观察 `tcpdump` 的输出。

**第二步：分析诊断结果**

* **如果看到了类似魔术包的输出**（开头有 `ffff ffff ffff`，后面是你发送的MAC地址在重复）：
    * **恭喜，网络是通的！** 问题在服务器自身。
    * **检查1：MAC地址是否完全匹配？** 再次运行 `ip a`，逐个字符对比你发送的MAC地址和服务器网卡的真实MAC地址。这是最常见的错误点！
    * **检查2：BIOS里的深度节能选项** (`ErP`, `Deep Sleep`) 是否已**禁用**？
    * **检查3：物理网口灯**。关机后，网口的灯是否还亮？不亮则说明网卡被断电了，返回检查BIOS设置。

* **如果没有看到任何输出**：
    * **说明魔术包没送到！** 问题在网络路径或发送端。
    * **检查1**：发送命令里的MAC地址是否有笔误？
    * **检查2**：发送端和服务器是否在同一局域网内？
    * **检查3**：尝试明确指定广播地址的发送命令 (`-i` 参数)。

#### **问题二：其他常见问题**

* **Netplan 权限警告**：如在应用配置时看到 `Permissions for ... are too open` 的警告，运行 `sudo chmod 600 /etc/netplan/your-file.yaml` 即可修复。
* **收到多条关机信息**：本教程第一章中的 `power-off.sh` 脚本已包含“锁文件”逻辑，能避免此问题。如果你使用了旧的脚本，请更新到本文版本。

---
