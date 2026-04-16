# Copilot Chat Sync

将 GitHub Copilot Chat 的对话历史自动同步为 Markdown 文件，推送到 GitHub 仓库，方便归档和检索。

## 功能

- **自动同步** — 定时将所有 Copilot Chat 会话导出为 Markdown，提交并推送到 GitHub
- **日期文件夹** — 按日期自动分组：`sessions/2025-04-16/workspace_id.md`
- **Secret 脱敏** — 自动过滤 GitHub PAT、API Key 等敏感信息（`ghp_`/`sk-`/`password=` 等）
- **Hosts 绕过** — 自动处理 `/etc/hosts` 屏蔽 `github.com` 的情况（中国大陆常见场景）
- **Agent 模式兼容** — 支持解析 Copilot Agent/Agentic 模式的会话

## 安装

### 方式 1：本地 VSIX 安装

```bash
# 1. 克隆项目
git clone https://github.com/yuzuan/copilot-chat-sync.git
cd copilot-chat-sync

# 2. 安装依赖并编译
npm install
npm run compile

# 3. 打包为 VSIX
npx vsce package --no-dependencies --allow-missing-repository

# 4. 安装到 VS Code
code --install-extension copilot-chat-sync-*.vsix --force
```

### 方式 2：直接安装 VSIX 文件

如果你有 `.vsix` 文件，直接运行：

```bash
code --install-extension copilot-chat-sync-0.3.0.vsix --force
```

或在 VS Code 中：`Cmd+Shift+P` → `Extensions: Install from VSIX...` → 选择文件。

## 配置步骤

### 第一步：创建 GitHub 仓库

在 GitHub 上创建一个**私有仓库**（建议私有，因为聊天记录可能包含敏感信息）。

### 第二步：生成 Personal Access Token (PAT)

1. 访问 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token (classic)**
3. 勾选权限：`repo`（完整仓库访问）
4. 生成并复制 token

### 第三步：配置 Git 凭据

在终端运行：

```bash
# 设置同步仓库目录（默认 ~/.copilot-chat-sync）
mkdir -p ~/.copilot-chat-sync
cd ~/.copilot-chat-sync
git init
git checkout -b main

# 设置远程仓库
git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git

# 存储凭据（避免每次输入密码）
git config credential.helper store

# 写入凭据
printf "protocol=https\nhost=github.com\nusername=<你的用户名>\npassword=<你的PAT>\n\n" | git credential approve
```

> **如果你的环境 `/etc/hosts` 屏蔽了 `github.com`**（常见于使用代理的场景），需要额外步骤：
>
> ```bash
> # 查询 GitHub 真实 IP
> nslookup github.com 8.8.8.8
> # 假设返回 20.205.243.166
>
> # 为 IP 地址存储凭据
> printf "protocol=https\nhost=20.205.243.166\nusername=<你的用户名>\npassword=<你的PAT>\n\n" | git credential approve
> ```
>
> 插件会自动将 `github.com` 重写为 IP 地址进行推送。

### 第四步：在 VS Code 中配置插件

1. 按 `Cmd+Shift+P`（macOS）或 `Ctrl+Shift+P`（Windows/Linux）
2. 输入 **Copilot Chat Sync: Configure Repository**
3. 填写：
   - **GitHub repository URL**: `https://github.com/<你的用户名>/<你的仓库名>.git`
   - **Local directory**: `~/.copilot-chat-sync`（默认值即可）

配置完成后，插件会自动开始同步。

## 使用

### 命令面板

按 `Cmd+Shift+P` 后输入：

| 命令 | 说明 |
|------|------|
| `Copilot Chat Sync: Sync Now` | 立即同步所有会话到 GitHub |
| `Copilot Chat Sync: Export All Sessions to Markdown` | 导出所有会话到本地文件夹 |
| `Copilot Chat Sync: Configure Repository` | 配置同步仓库 |

### 自动同步

插件默认每 5 分钟自动同步一次。可在设置中调整：

```json
{
  "copilotChatSync.autoSync": true,
  "copilotChatSync.syncIntervalMinutes": 5,
  "copilotChatSync.includeToolCalls": false
}
```

### 同步结果

同步后的仓库结构：

```
sessions/
├── 2025-04-15/
│   ├── my_project_a1b2c3d4.md
│   └── another_workspace_e5f6g7h8.md
├── 2025-04-16/
│   └── my_project_i9j0k1l2.md
└── README.md
```

每个 Markdown 文件包含：
- 会话元数据（时间、工作区、版本等）
- 完整的用户/Copilot 对话内容
- 可选的工具调用详情

## 设置项

| 设置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `copilotChatSync.repoPath` | string | `""` | 本地 Git 仓库路径 |
| `copilotChatSync.remoteUrl` | string | `""` | GitHub 远程仓库 URL |
| `copilotChatSync.autoSync` | boolean | `true` | 是否自动同步 |
| `copilotChatSync.syncIntervalMinutes` | number | `5` | 自动同步间隔（分钟） |
| `copilotChatSync.includeToolCalls` | boolean | `false` | 是否包含工具调用详情 |

## 常见问题

### Q: 推送失败，提示 "Failed to connect to github.com"

你的 `/etc/hosts` 文件可能屏蔽了 `github.com`。插件已内置 IP 重写功能，但需要为 IP 地址配置凭据，参见上方「第三步」中的 hosts 绕过说明。

### Q: 推送失败，提示 "Push Protection" 或包含 secrets

插件已内置 secret 脱敏功能。如果仍然触发，可能是聊天记录中包含了未覆盖的 secret 模式。请提 issue 报告。

### Q: 没有发现任何会话

确认你使用了 GitHub Copilot Chat 扩展，且产生过对话记录。转录文件位于：

```
~/Library/Application Support/Code/User/workspaceStorage/*/GitHub.copilot-chat/transcripts/*.jsonl
```

## License

MIT
