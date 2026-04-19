# https://github.com/TheNetsky/Microsoft-Rewards-Script如果要布置docker，根据这个教程要怎么布置

| Field | Value |
|-------|-------|
| Session ID | `3005c0b6-381b-45b8-934f-b40f16d32b1b` |
| Workspace | Docker部署Microsoft Rewards脚本指南 |
| Start | 2025/09/29 12:09 |
| End | 2025/09/29 12:13 |
| Messages | 4 |

---

### 👤 User <sub>2025/09/29 12:10</sub>

https://github.com/TheNetsky/Microsoft-Rewards-Script如果要布置docker，根据这个教程要怎么布置

### 🤖 Copilot <sub>2025/09/29 12:10</sub>

我来帮您分析这个Microsoft Rewards脚本的Docker部署方案。首先让我获取该GitHub仓库的信息。

现在让我获取Docker相关的配置文件来了解具体的部署方案：

让我通过获取README中的具体Docker配置部分：

基于获取的信息，我为您整理了这个Microsoft Rewards脚本的Docker部署教程：

## 📋 Microsoft Rewards Script Docker部署教程

### 🔧 准备工作

1. **环境要求**
   - Docker 和 Docker Compose 已安装
   - 确保系统支持Docker容器化

2. **清理之前的构建**（如果有的话）

```
   # 删除之前的本地构建文件
   rm -rf node_modules dist
   
   # 如果从1.4版本或更早版本升级，删除旧的Docker volumes
   docker volume prune
```

### 📥 下载和配置

1. **获取源代码**

```
   git clone https://github.com/TheNetsky/Microsoft-Rewards-Script.git
   cd Microsoft-Rewards-Script
```

2. **配置账户信息**

```
   # 复制示例配置文件
   cp src/accounts.example.json src/accounts.json
```

编辑 `src/accounts.json` 添加您的Microsoft账户信息：

```
   [
     {
       "email": "your-email@example.com",
       "password": "your-password"
     }
   ]
```

3. **配置脚本设置**
   编辑 `src/config.json`，**重要：确保设置 `"headless": true`**：

```
   {
     "headless": true,
     "baseURL": "https://rewards.bing.com",
     "workers": {
       "doDailySet": true,
       "doMorePromotions": true,
       "doPunchCards": true,
       "doDesktopSearch": true,
       "doMobileSearch": true
     }
   }
```

### 🐳 Docker配置

4. **自定义 compose.yaml 配置**

关键配置项：

```
   environment:
     # 设置您的时区
     TZ: "Asia/Shanghai"  # 或其他时区，如 "America/New_York"
     
     # 配置执行计划（使用crontab格式）
     CRON_SCHEDULE: "0 7,16,20 * * *"  # 每天7点、16点、20点执行
     
     # 容器启动时是否立即执行
     RUN_ON_START: "true"
     
     # 添加随机延迟（推荐保持开启）
     MIN_SLEEP_MINUTES: "5"
     MAX_SLEEP_MINUTES: "50" 
     SKIP_RANDOM_SLEEP: "false"
```

完整的 `compose.yaml` 示例：

```
   services:
     microsoft-rewards-script:
       build: .
       container_name: microsoft-rewards-script
       restart: unless-stopped
       
       volumes:
         - ./src/accounts.json:/usr/src/microsoft-rewards-script/dist/accounts.json:ro
         - ./src/config.json:/usr/src/microsoft-rewards-script/dist/config.json:ro
         - ./sessions:/usr/src/microsoft-rewards-script/dist/browser/sessions
       
       environment:
         TZ: "Asia/Shanghai"
         NODE_ENV: "production"
         CRON_SCHEDULE: "0 8,14,20 * * *"
         RUN_ON_START: "true"
         SKIP_RANDOM_SLEEP: "false"
       
       mem_limit: 4g
       cpus: 2
       
       healthcheck:
         test: ["CMD", "sh", "-c", "pgrep cron > /dev/null || exit 1"]
         interval: 60s
         timeout: 10s
         retries: 3
         start_period: 30s
```

### 🚀 部署和启动

5. **启动Docker容器**

```
   # 构建并启动容器
   docker compose up -d
```

6. **验证部署**

```
   # 查看容器状态
   docker ps
   
   # 查看实时日志
   docker logs -f microsoft-rewards-script
   
   # 检查健康状态
   docker compose ps
```

### 📊 监控和维护

7. **日常监控命令**

```
   # 查看最近的日志
   docker logs --tail 50 microsoft-rewards-script
   
   # 重启容器
   docker compose restart
   
   # 停止容器
   docker compose down
   
   # 重新构建并启动（配置更改后）
   docker compose up -d --build
```

### ⚙️ 高级配置

8. **计划任务配置**

使用 [crontab.guru](https://crontab.guru/) 来配置您的执行时间：
   - `"0 8,20 * * *"` - 每天8点和20点
   - `"0 */6 * * *"` - 每6小时一次
   - `"30 7,12,18 * * *"` - 每天7:30、12:30、18:30

9. **资源限制调整**

```
   mem_limit: 2g      # 根据需要调整内存限制
   cpus: 1            # 根据需要调整CPU核心数
```

### ⚠️ 重要提示

- **风险警告**：使用自动化脚本可能导致Microsoft Rewards账户被暂停或封禁
- **随机延迟**：容器会在计划执行时添加5-50分钟的随机延迟，模拟更自然的行为
- **会话保存**：`sessions` 目录会保存登录会话，避免频繁重新登录
- **配置更新**：修改 `accounts.json` 或 `config.json` 后需要重启容器

这样配置后，您的Microsoft Rewards脚本就会在Docker容器中自动运行，按照您设定的时间表执行奖励任务。

### 👤 User <sub>2025/09/29 12:13</sub>

如何在VScode的docker插件里面启动呢

### 🤖 Copilot <sub>2025/09/29 12:13</sub>

我来为您详细介绍如何在VS Code的Docker插件中启动Microsoft Rewards脚本容器。

## 📋 在VS Code Docker插件中启动Microsoft Rewards脚本

### 1️⃣ 安装和准备

**安装必要的VS Code插件：**

1. **Docker 插件** (Microsoft)
2. **Docker Compose 插件** (可选，但推荐)

在VS Code中按 `Ctrl+Shift+X` 打开扩展面板，搜索并安装：
- `ms-azuretools.vscode-docker`

### 2️⃣ 项目准备

1. **克隆项目到本地**

```
   git clone https://github.com/TheNetsky/Microsoft-Rewards-Script.git
```

2. **在VS Code中打开项目**
   - `文件` → `打开文件夹` → 选择 `Microsoft-Rewards-Script` 文件夹
   - 或者使用命令：`code Microsoft-Rewards-Script`

### 3️⃣ 配置文件设置

**在VS Code中编辑配置文件：**

1. **配置账户信息**
   - 复制 `src/accounts.example.json` 为 `src/accounts.json`
   - 编辑添加您的Microsoft账户信息

2. **修改配置**
   - 编辑 `src/config.json`，确保 `"headless": true`

3. **自定义Docker Compose配置**
   - 编辑 `compose.yaml` 设置时区和执行计划

### 4️⃣ 使用Docker插件启动

#### 方法一：通过Docker视图面板

1. **打开Docker视图**
   - 点击左侧活动栏的Docker图标 🐳
   - 或按 `Ctrl+Shift+P` 输入 "Docker: Focus on Docker View"

2. **构建并启动容器**
   - 在Explorer面板中右键点击 `compose.yaml`
   - 选择 **"Compose Up"**
   - 或者选择 **"Compose Up - Select Services"** 来选择特定服务

#### 方法二：通过命令面板

1. **打开命令面板** (`Ctrl+Shift+P`)

2. **选择Docker命令**
   - 输入 "Docker Compose: Up"
   - 选择 `compose.yaml` 文件
   - 容器将开始构建和启动

#### 方法三：通过集成终端

1. **打开集成终端** (`Ctrl+``)

2. **运行Docker Compose命令**

```
   # 构建并启动
   docker compose up -d
   
   # 或者强制重新构建
   docker compose up -d --build
```

### 5️⃣ 监控和管理

#### 在Docker插件面板中：

1. **查看运行中的容器**
   - Docker视图 → Containers
   - 找到 `microsoft-rewards-script`

2. **容器操作**
   - **右键容器** 可以选择：
     - `View Logs` - 查看实时日志
     - `Attach Shell` - 进入容器终端
     - `Restart` - 重启容器
     - `Stop` - 停止容器
     - `Remove` - 删除容器

3. **查看日志**
   - 右键容器选择 "View Logs"
   - 日志会在新的VS Code终端标签中显示
   - 可以看到脚本的执行状态和结果

#### 实用的VS Code Docker操作：

**快捷操作面板：**
- `Ctrl+Shift+P` → "Docker: Show Logs" - 快速查看容器日志
- `Ctrl+Shift+P` → "Docker: Restart" - 重启选定容器
- `Ctrl+Shift+P` → "Docker: Stop" - 停止选定容器

### 6️⃣ 调试和故障排除

**在VS Code中进行调试：**

1. **查看构建输出**
   - 构建时输出会显示在集成终端中
   - 可以看到任何构建错误或警告

2. **实时监控日志**

```
   # 在集成终端中运行
   docker logs -f microsoft-rewards-script
```

3. **检查容器健康状态**
   - 在Docker视图中，容器图标会显示健康状态
   - 绿色：运行正常
   - 红色：有问题
   - 黄色：启动中或不健康

### 7️⃣ 高效的工作流程

**推荐的开发和部署流程：**

1. **配置更改后重新部署**

```
   # 在VS Code终端中
   docker compose down
   docker compose up -d --build
```

2. **使用VS Code任务**
   - 创建 `.vscode/tasks.json`：

```
   {
     "version": "2.0.0",
     "tasks": [
       {
         "label": "Docker: Compose Up",
         "type": "shell",
         "command": "docker",
         "args": ["compose", "up", "-d"],
         "group": "build",
         "presentation": {
           "reveal": "always",
           "panel": "new"
         }
       },
       {
         "label": "Docker: View Logs",
         "type": "shell",
         "command": "docker",
         "args": ["logs", "-f", "microsoft-rewards-script"],
         "group": "test"
       }
     ]
   }
```

3. **快捷键绑定**
   - `Ctrl+Shift+P` → "Preferences: Open Keyboard Shortcuts (JSON)"
   - 添加自定义快捷键：

```
   [
     {
       "key": "ctrl+shift+d ctrl+u",
       "command": "workbench.action.tasks.runTask",
       "args": "Docker: Compose Up"
     }
   ]
```

### 8️⃣ 监控脚本执行

**在VS Code中监控脚本状态：**

1. **设置定时查看日志**
   - 可以保持日志终端打开
   - 脚本执行时会看到详细的输出

2. **检查执行结果**
   - 日志会显示每个账户的积分获取情况
   - 可以看到任何错误或警告信息

通过这种方式，您可以完全在VS Code环境中管理Microsoft Rewards脚本的Docker容器，享受图形界面带来的便利，同时保持对容器状态的完全可见性和控制。
