# 安装https://github.com/TonybotNi/ZotLink这个 MCP 后，并试着链接 zotero 到 coplict

| Field | Value |
|-------|-------|
| Session ID | `e391a2e3-3d79-4504-b3bd-6ca8dd006177` |
| Workspace | 安装ZotLink并连接Zotero到Copilot |
| Start | 2026/03/03 15:47 |
| End | 2026/03/03 17:03 |
| Messages | 6 |

---

### 👤 User <sub>2026/03/03 15:48</sub>

安装https://github.com/TonybotNi/ZotLink这个 MCP 后，并试着链接 zotero 到 coplict

### 🤖 Copilot <sub>2026/03/03 15:48</sub>

我来帮你安装 ZotLink MCP 并连接 Zotero。先了解一下这个项目。

已经了解了 ZotLink 的安装流程。现在开始安装：

Conda 渠道没有这个包，用 pip 安装：

ZotLink 已经安装好了 (v1.3.7)。现在找到 `zotlink` 可执行文件的路径，然后运行 `zotlink init`：

配置已生成。现在需要将其添加到 VS Code 的 MCP 配置中（因为你用的是 Copilot/Coplict 而非 Claude Desktop）。让我检查 VS Code 的 MCP 配置文件：

VS Code 的 MCP 服务器通常配置在 `.vscode/mcp.json` 或 `settings.json` 的 `"mcp"` 键中。让我检查是否有专门的 MCP 配置文件：

存在全局的 MCP 配置文件 `~/Library/Application Support/Code/User/mcp.json`。让我查看它的内容：

现在我需要将 ZotLink 添加到这个配置文件中。让我用脚本安全地注入：

验证写入结果：

配置已写入成功。现在确认 Playwright chromium 是否已安装（ZotLink 需要它来抓取 bioRxiv 等网站）：

现在让我验证 ZotLink 能否正常启动，同时搜索一下是否有相关工具可以测试连接：MCP 服务器尚未被 VS Code 加载（需要重启或重新加载）。让我触发重新加载：

ZotLink MCP 工具尚未加载到当前会话中。这是正常的——需要重启 MCP 服务器后才能识别。让我尝试重启：

让我搜索一下 ZotLink 的工具是否已经可用：ZotLink 的 MCP 工具尚未在当前会话中加载。

**总结已完成的工作：**

1. **ZotLink v1.3.7 已安装** — 通过 pip，路径

2. **Playwright Chromium 已安装** — 支持 bioRxiv/medRxiv 等网站抓取
3. **Zotero 路径已检测** —

4. **MCP 配置已写入** — `~/Library/Application Support/Code/User/mcp.json` 中添加了 `zotlink` 服务器条目

**要让连接生效**，你需要：
- 确保 **Zotero 桌面客户端正在运行**（ZotLink 通过端口 23119 与 Zotero 通信）
- 在 VS Code 中**重新加载窗口**（`Cmd+Shift+P` → `Developer: Reload Window`），让 MCP 服务器启动
- 重载后在新的 Agent 对话中就可以使用 ZotLink 的工具了（如 `check_zotero_status`、`save_paper_to_zotero` 等）

[object Object]

先确认 Zotero 是否在运行，然后重新加载窗口：

Zotero 正在运行。现在重新加载 VS Code 窗口来激活 ZotLink MCP：

已经了解了 ZotLink 的安装流程。现在开始安装：

Conda 渠道没有这个包，用 pip 安装：

ZotLink 已经安装好了 (v1.3.7)。现在找到 `zotlink` 可执行文件的路径，然后运行 `zotlink init`：

配置已生成。现在需要将其添加到 VS Code 的 MCP 配置中（因为你用的是 Copilot/Coplict 而非 Claude Desktop）。让我检查 VS Code 的 MCP 配置文件：

VS Code 的 MCP 服务器通常配置在 `.vscode/mcp.json` 或 `settings.json` 的 `"mcp"` 键中。让我检查是否有专门的 MCP 配置文件：

存在全局的 MCP 配置文件 `~/Library/Application Support/Code/User/mcp.json`。让我查看它的内容：

现在我需要将 ZotLink 添加到这个配置文件中。让我用脚本安全地注入：

验证写入结果：

配置已写入成功。现在确认 Playwright chromium 是否已安装（ZotLink 需要它来抓取 bioRxiv 等网站）：

现在让我验证 ZotLink 能否正常启动，同时搜索一下是否有相关工具可以测试连接：MCP 服务器尚未被 VS Code 加载（需要重启或重新加载）。让我触发重新加载：

ZotLink MCP 工具尚未加载到当前会话中。这是正常的——需要重启 MCP 服务器后才能识别。让我尝试重启：

让我搜索一下 ZotLink 的工具是否已经可用：ZotLink 的 MCP 工具尚未在当前会话中加载。

**总结已完成的工作：**

1. **ZotLink v1.3.7 已安装** — 通过 pip，路径

2. **Playwright Chromium 已安装** — 支持 bioRxiv/medRxiv 等网站抓取
3. **Zotero 路径已检测** —

4. **MCP 配置已写入** — `~/Library/Application Support/Code/User/mcp.json` 中添加了 `zotlink` 服务器条目

**要让连接生效**，你需要：
- 确保 **Zotero 桌面客户端正在运行**（ZotLink 通过端口 23119 与 Zotero 通信）
- 在 VS Code 中**重新加载窗口**（`Cmd+Shift+P` → `Developer: Reload Window`），让 MCP 服务器启动
- 重载后在新的 Agent 对话中就可以使用 ZotLink 的工具了（如 `check_zotero_status`、`save_paper_to_zotero` 等）

[object Object]

先确认 Zotero 是否在运行，然后重新加载窗口：

Zotero 正在运行。现在重新加载 VS Code 窗口来激活 ZotLink MCP：

### 👤 User <sub>2026/03/03 16:56</sub>

https://github.com/cookjohn/zotero-mcp安装这个

### 🤖 Copilot <sub>2026/03/03 16:56</sub>

这个项目是一个 **Zotero 插件**（不是 pip 包），通过 Streamable HTTP 协议在 Zotero 内部运行 MCP 服务器。我来下载并安装。

### 👤 User <sub>2026/03/03 17:03</sub>

我已经安装插件，直接帮我配置VS Code MCP 连接

### 🤖 Copilot <sub>2026/03/03 17:03</sub>

先获取插件的端点信息，再更新 VS Code MCP 配置。

已获取配置信息。该插件在端口 `23120` 上通过 Streamable HTTP 提供 MCP 服务，端点为 `/mcp`。现在更新 VS Code 的 MCP 配置。

写入成功，验证一下：

配置已正确写入。现在确认 Zotero 插件的 MCP 服务器是否在运行：

端口有响应（返回 404 而非 connection refused），说明服务器在运行。MCP 用的是 POST 请求，GET 返回 404 是正常的。让我用正确的 MCP 协议试试：

端点路径可能不同。让我检查一下其他可能的路径：

服务器在 23120 端口有响应但 `/mcp` 端点未找到。这说明插件已安装，但 MCP 服务器可能**尚未在 Zotero 偏好设置中启用**。让我再确认一下：

原来 23120 端口被之前安装的 **ZotLink** Cookie 服务占用了！zotero-mcp 插件需要用另一个端口。让我查看实际监听的端口：

现在情况清楚了：

- **23119** = Zotero 内置 connector
- **23120** = ZotLink Cookie 服务（之前安装的）占用了
- **23121+** = 无服务

zotero-mcp 插件默认端口 23120 与 ZotLink 冲突，且 MCP 服务器可能还未在 Zotero 中启用。我来把配置改为端口 **23121**，你需要在 Zotero 中对应设置。

VS Code 配置已更新为 `http://127.0.0.1:23121/mcp`。

**当前状态总结：**

VS Code 端配置已完成，但 zotero-mcp 插件的 MCP 服务器**尚未启动**。你需要在 Zotero 中完成以下步骤：

1. 打开 **Zotero → 首选项（Preferences）→ Zotero MCP Plugin** 标签页
2. **勾选 Enable Server** 启用 MCP 服务器
3. **将端口改为 `23121`**（因为 23120 已被 ZotLink 占用）
4. 点击保存/确认

完成后回到 VS Code，`Cmd+Shift+P` → `Developer: Reload Window` 重新加载即可连接。

[object Object]

23121 端口连接被拒绝，MCP 服务器实际上没有启动。让我检查端口 23120 是否已切换到

23121 端口连接被拒绝，MCP 服务器实际上没有启动。让我检查端口 23120 是否已切换到 zotero-mcp：

23120 端口仍然被 **ZotLink Cookie 服务**占用，而 23121 上没有任何服务在监听。这意味着 zotero-mcp 插件的 MCP 服务器**没有成功启动**——很可能是因为默认端口 23120 被 ZotLink 占了，导致绑定失败。

**解决方案有两种：**

1. 在 Zotero 的 `首选项 → Zotero MCP Plugin` 中将端口改为 **23121**，然后重启 Zotero
2. 或先卸载/禁用 ZotLink 插件释放 23120 端口，再重启 Zotero

[object Object]

写入成功，验证一下：

配置已正确写入。现在确认 Zotero 插件的 MCP 服务器是否在运行：

端口有响应（返回 404 而非 connection refused），说明服务器在运行。MCP 用的是 POST 请求，GET 返回 404 是正常的。让我用正确的 MCP 协议试试：

端点路径可能不同。让我检查一下其他可能的路径：

服务器在 23120 端口有响应但 `/mcp` 端点未找到。这说明插件已安装，但 MCP 服务器可能**尚未在 Zotero 偏好设置中启用**。让我再确认一下：

原来 23120 端口被之前安装的 **ZotLink** Cookie 服务占用了！zotero-mcp 插件需要用另一个端口。让我查看实际监听的端口：

现在情况清楚了：

- **23119** = Zotero 内置 connector
- **23120** = ZotLink Cookie 服务（之前安装的）占用了
- **23121+** = 无服务

zotero-mcp 插件默认端口 23120 与 ZotLink 冲突，且 MCP 服务器可能还未在 Zotero 中启用。我来把配置改为端口 **23121**，你需要在 Zotero 中对应设置。

VS Code 配置已更新为 `http://127.0.0.1:23121/mcp`。

**当前状态总结：**

VS Code 端配置已完成，但 zotero-mcp 插件的 MCP 服务器**尚未启动**。你需要在 Zotero 中完成以下步骤：

1. 打开 **Zotero → 首选项（Preferences）→ Zotero MCP Plugin** 标签页
2. **勾选 Enable Server** 启用 MCP 服务器
3. **将端口改为 `23121`**（因为 23120 已被 ZotLink 占用）
4. 点击保存/确认

完成后回到 VS Code，`Cmd+Shift+P` → `Developer: Reload Window` 重新加载即可连接。

[object Object]
Selected: 已在 Zotero 中启用并设置端口

23121 端口连接被拒绝，MCP 服务器实际上没有启动。让我检查端口 23120 是否已切换到 zotero-mcp：

23120 端口仍然被 **ZotLink Cookie 服务**占用，而 23121 上没有任何服务在监听。这意味着 zotero-mcp 插件的 MCP 服务器**没有成功启动**——很可能是因为默认端口 23120 被 ZotLink 占了，导致绑定失败。

**解决方案有两种：**

1. 在 Zotero 的 `首选项 → Zotero MCP Plugin` 中将端口改为 **23121**，然后重启 Zotero
2. 或先卸载/禁用 ZotLink 插件释放 23120 端口，再重启 Zotero

[object Object]

已获取配置信息。该插件在端口 `23120` 上通过 Streamable HTTP 提供 MCP 服务，端点为 `/mcp`。现在更新 VS Code 的 MCP 配置。

写入成功，验证一下：

配置已正确写入。现在确认 Zotero 插件的 MCP 服务器是否在运行：

端口有响应（返回 404 而非 connection refused），说明服务器在运行。MCP 用的是 POST 请求，GET 返回 404 是正常的。让我用正确的 MCP 协议试试：

端点路径可能不同。让我检查一下其他可能的路径：

服务器在 23120 端口有响应但 `/mcp` 端点未找到。这说明插件已安装，但 MCP 服务器可能**尚未在 Zotero 偏好设置中启用**。让我再确认一下：

原来 23120 端口被之前安装的 **ZotLink** Cookie 服务占用了！zotero-mcp 插件需要用另一个端口。让我查看实际监听的端口：

现在情况清楚了：

- **23119** = Zotero 内置 connector
- **23120** = ZotLink Cookie 服务（之前安装的）占用了
- **23121+** = 无服务

zotero-mcp 插件默认端口 23120 与 ZotLink 冲突，且 MCP 服务器可能还未在 Zotero 中启用。我来把配置改为端口 **23121**，你需要在 Zotero 中对应设置。

VS Code 配置已更新为 `http://127.0.0.1:23121/mcp`。

**当前状态总结：**

VS Code 端配置已完成，但 zotero-mcp 插件的 MCP 服务器**尚未启动**。你需要在 Zotero 中完成以下步骤：

1. 打开 **Zotero → 首选项（Preferences）→ Zotero MCP Plugin** 标签页
2. **勾选 Enable Server** 启用 MCP 服务器
3. **将端口改为 `23121`**（因为 23120 已被 ZotLink 占用）
4. 点击保存/确认

完成后回到 VS Code，`Cmd+Shift+P` → `Developer: Reload Window` 重新加载即可连接。

[object Object]
Selected: 已在 Zotero 中启用并设置端口

23121 端口连接被拒绝，MCP 服务器实际上没有启动。让我检查端口 23120 是否已切换到 zotero-mcp：

23120 端口仍然被 **ZotLink Cookie 服务**占用，而 23121 上没有任何服务在监听。这意味着 zotero-mcp 插件的 MCP 服务器**没有成功启动**——很可能是因为默认端口 23120 被 ZotLink 占了，导致绑定失败。

**解决方案有两种：**

1. 在 Zotero 的 `首选项 → Zotero MCP Plugin` 中将端口改为 **23121**，然后重启 Zotero
2. 或先卸载/禁用 ZotLink 插件释放 23120 端口，再重启 Zotero

[object Object]
