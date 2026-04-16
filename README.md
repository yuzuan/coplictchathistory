# Copilot Chat Sync

将 GitHub Copilot Chat 的对话历史自动同步为 Markdown 文件，推送到 GitHub 仓库，方便归档和检索。

## 功能

### 核心功能
- **自动同步** — 定时将所有 Copilot Chat 会话导出为 Markdown，提交并推送到 GitHub
- **日期文件夹** — 按日期自动分组：`sessions/2025-04-16/workspace_id.md`
- **Secret 脱敏** — 自动过滤 GitHub PAT、API Key 等敏感信息（`ghp_`/`sk-`/`password=` 等）
- **Hosts 绕过** — 自动处理 `/etc/hosts` 屏蔽 `github.com` 的情况（中国大陆常见场景）
- **Agent 模式兼容** — 支持解析 Copilot Agent/Agentic 模式的会话

### 浏览与搜索
- **侧边栏浏览** — Activity Bar 中的专属面板，按日期分组展示所有会话
- **全文搜索** — 关键词搜索所有对话内容，QuickPick 快速跳转
- **Webview 预览** — 在编辑器中以 HTML 格式预览完整会话

### 多格式导出
- **Markdown** — 标准 Markdown 格式，适合 Git 存档和阅读
- **JSON** — 结构化数据格式，适合程序处理
- **HTML** — 带暗色/亮色主题的独立网页，适合分享
- **Q&A 精简归档** — 只保留 Copilot 回复首段，生成干净的问答对
- **分块导出 (Chunk)** — 将长对话拆分为多个小文件，方便回粘到新对话

### 导入与恢复
- **HTML 导入** — 从 DevTools 保存的 HTML 文件中恢复对话（支持多种 HTML 格式）
- **复制到剪贴板** — 一键复制会话内容（Q&A/Markdown/JSON 格式可选）

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
code --install-extension copilot-chat-sync-0.4.0.vsix --force
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
| `Copilot Chat Sync: Export All Sessions` | 导出所有会话（可选 Markdown/JSON/HTML） |
| `Copilot Chat Sync: Configure Repository` | 配置同步仓库 |
| `Copilot Chat Sync: Search Chat History` | 全文搜索对话内容 |
| `Copilot Chat Sync: Export Q&A Archive` | 导出精简问答归档 |
| `Copilot Chat Sync: Export as Chunks` | 将会话拆分为多个小文件 |
| `Copilot Chat Sync: Import from HTML` | 从 HTML 文件导入对话 |
| `Copilot Chat Sync: Refresh Sessions` | 刷新侧边栏会话列表 |

### 侧边栏

安装后，Activity Bar 左侧会出现 💬 图标，点击打开会话浏览面板：

- 会话按日期分组显示
- 每个会话显示工作区名称和消息数量
- **左键点击** — 在 Webview 中预览完整会话
- **右键菜单** — 导出会话 / 复制到剪贴板

### 搜索

1. `Cmd+Shift+P` → `Copilot Chat Sync: Search Chat History`
2. 输入关键词
3. 匹配结果显示在 QuickPick 列表中，包含上下文片段
4. 选择后直接在 Webview 中打开

### Q&A 精简归档

将完整对话浓缩为「用户提问 + Copilot 回复首段」格式，适合：
- 快速回顾之前的问答
- 粘贴到新对话中继续讨论
- 作为团队知识库

```
### Q1
🧑 **User:**
如何优化 Python 代码性能？

🤖 **Copilot:**
优化 Python 代码性能的关键方法包括使用合适的数据结构、避免不必要的循环、利用内置函数和向量化操作。
```

### 分块导出

将长对话按指定数量（默认每 5 对）拆分为独立文件：
- `chunk_a1b2c3d4_0001.md`
- `chunk_a1b2c3d4_0002.md`
- ...

适合将长对话分批粘贴回新的 Copilot 会话继续讨论。

### HTML 导入

支持从 DevTools 保存的 HTML 中恢复对话：

1. 在 VS Code 的 Copilot Chat 面板中按 `F12` 打开 DevTools
2. Elements 面板中右键 `<html>` → Copy outerHTML
3. 保存为 `.html` 文件
4. 在 VS Code 中运行 `Copilot Chat Sync: Import from HTML`
5. 选择操作：预览 / 导出为 Markdown / 复制 Q&A 到剪贴板

### 复制到剪贴板

在侧边栏中右键点击会话，选择「Copy to Clipboard」，支持三种格式：
- **Q&A Archive** — 精简问答格式
- **Full Markdown** — 完整 Markdown
- **JSON** — 结构化数据

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
| `copilotChatSync.defaultExportFormat` | string | `"markdown"` | 默认导出格式（markdown/json/html） |
| `copilotChatSync.maxSessionsInView` | number | `100` | 侧边栏最多显示的会话数 |

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
