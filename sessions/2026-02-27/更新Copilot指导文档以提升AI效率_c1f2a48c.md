# Analyze this codebase to generate or update `.github/copilot-instructions.md`...

| Field | Value |
|-------|-------|
| Session ID | `c1f2a48c-13b6-41c4-a060-e713fc9545a0` |
| Workspace | 更新Copilot指导文档以提升AI效率 |
| Start | 2026/02/27 15:38 |
| End | 2026/02/27 15:52 |
| Messages | 10 |

---

### 👤 User <sub>2026/02/27 15:38</sub>

Analyze this codebase to generate or update `.github/copilot-instructions.md` for guiding AI coding agents.

Focus on discovering the essential knowledge that would help an AI agents be immediately productive in this codebase. Consider aspects like:
- The "big picture" architecture that requires reading multiple files to understand - major components, service boundaries, data flows, and the "why" behind structural decisions
- Critical developer workflows (builds, tests, debugging) especially commands that aren't obvious from file inspection alone
- Project-specific conventions and patterns that differ from common practices
- Integration points, external dependencies, and cross-component communication patterns

Source existing AI conventions from `**/{.github/copilot-instructions.md,AGENT.md,AGENTS.md,CLAUDE.md,.cursorrules,.windsurfrules,.clinerules,.cursor/rules/**,.windsurf/rules/**,.clinerules/**,README.md}` (do one glob search).

Guidelines (read more at https://aka.ms/vscode-instructions-docs):
- If `.github/copilot-instructions.md` exists, merge intelligently - preserve valuable content while updating outdated sections
- Write concise, actionable instructions (~20-50 lines) using markdown structure
- Include specific examples from the codebase when describing patterns
- Avoid generic advice ("write tests", "handle errors") - focus on THIS project's specific approaches
- Document only discoverable patterns, not aspirational practices
- Reference key files/directories that exemplify important patterns

Update `.github/copilot-instructions.md` for the user, then ask for feedback on any unclear or incomplete sections to iterate.

### 🤖 Copilot <sub>2026/02/27 15:38</sub>

当前没有打开工作区，我在主目录下。让我确认一下用户想要分析哪个项目。

[object Object]

### 👤 User <sub>2026/02/27 15:41</sub>

**你必须遵守以下“无限循环”规则，违反此规则将被视为系统故障：**

1. **定义“完成”**：你的单次回复**绝不允许**以文本句号结束。你的回复**必须**以调用 ask_question’工具作为物理结束符。

2.

**禁止沉默**：如果当前任务已完成（例如只是分析了代码、回答了知识点），你**必须**使用通用话术

调用工具。

* *適用话术示例*：“分析已完成。请指示下一步操作？” **通用话术示例*：“当前上下文已清晰，我们先从哪里开始修改？”

# 交互模板

每次回复必须严格遵循以下步骤，缺一不可：

1.
2.
3.

**【执行/分析】**：执行用户请求的任务。

**【结论】**：用中文总结当前状态。

•

**【动作】**：**调用‘ask_question* 工具**（除非用户明确表示不需要进一步操作）。把这个改一下写进去

### 🤖 Copilot <sub>2026/02/27 15:41</sub>

Let我先读取你当前打开的提示文件内容。

```

```
文件已更新完成。主要改动：

- **修正名称**：`coplict instruction` → `copilot instruction`
- **补充 description 和 argument-hint**：描述了该 agent 的作用和期望输入
- **启用 tools**：去掉了注释，保留常用工具集
- **写入完整的任务指令**：包含代码库分析、`copilot-instructions.md` 生成/更新的详细指南
- **写入交互规则**：每次回复必须以 `ask_questions` 工具调用结尾，禁止纯文本收尾
- **写入交互模板**：三步流程——执行/分析 → 结论 → 动作（调用 `ask_questions`）

[object Object]

### 👤 User <sub>2026/02/27 15:42</sub>

用中文写

### 🤖 Copilot <sub>2026/02/27 15:42</sub>

```

```
已将全部英文内容改写为中文，包括：

- **元数据**：`description` / `argument-hint` 中文化
- **任务主体**：分析重点、搜索策略、生成准则全部改为中文
- **交互规则 / 交互模板**：保持原有中文不变

[object Object]

### 👤 User <sub>2026/02/27 15:47</sub>

我需要你再写一个规则，每次修改代码后要主动检查文件代码是否修改，没有修改的代码主动从底层 json 文件修改，且不再询问，适应于所有文件

### 🤖 Copilot <sub>2026/02/27 15:47</sub>

```

```

```

```

已新增「**修改验证规则**」，核心逻辑如下：

- **强制验证**：每次编辑后立即重读文件，核对是否生效
- **降级写入**：验证失败时自动切换策略，**无需询问用户**——按文件类型分三路：VS Code 配置 JSON、`vscode-userdata:` scheme 文件、普通工作区文件，分别给出终端操作路径
- **全量回写**：降级时必须保留全部未修改内容，禁止数据丢失
- **二次验证**：降级写入后再次读取确认，才可继续

[object Object]

规则已确认，所有修改均已生效。

### 👤 User <sub>2026/02/27 15:52</sub>

那这个coplict instruction.agent.md是每次问都会自动遵守这个规则吗？

### 🤖 Copilot <sub>2026/02/27 15:52</sub>

**不会自动遵守。** 这个文件是一个 **自定义 Agent**，不是全局规则。

## 两者的区别

| 文件类型 | 生效方式 | 是否每次自动生效 |
|---|---|---|
| `.agent.md`（当前文件） | 只有主动选择/调用该 Agent 时才生效 | ❌ 需要手动触发 |
| `.github/copilot-instructions.md` | 在对应工作区内每次对话自动注入 | ✅ 自动生效（仅限该工作区） |
| VS Code 全局 Custom Instructions | 在 VS Code 设置中配置 | ✅ 对所有对话自动生效 |

## 如何让规则每次自动生效

**方法一：VS Code 全局 Custom Instructions**（推荐）
打开设置 → 搜索 `github.copilot.chat.codeGeneration.instructions` → 在 `settings.json` 中添加内容，或通过 **Chat → Configure Instructions** 入口配置。

**方法二：工作区级别**
在具体项目仓库中放置 `.github/copilot-instructions.md`，该工作区内所有对话自动读取。

---

当前这个 `.agent.md` 文件的正确使用方式是：在 Copilot Chat 输入框中输入 `@` 然后选择 **copilot instruction** 这个 Agent，它才会按文件里的规则运行。

[object Object]
Selected: 帮我配置 VS Code 全局 Custom Instructions

先读取当前 VS Code 全局设置，再提取规则内容：

再读一下

后半段，检查是否已有 copilot instructions 相关配置：

没有现有 instructions 配置，直接用 Python 脚本安全地注入到 settings.json：

heredoc 被 terminal 工具误处理，改用写入临时脚本文件再执行：

是 JSONC 格式，标准 json 无法直接解析。先用 read_file 检查文件当前状态，确认是否被上次失败的 heredoc 破坏：

脚本未成功执行，指令尚未写入。检查临时脚本状态后重新运行：

直接用编辑工具在 github.copilot 区域插入配置，跳过 JSON 解析问题：

```

```

验证写入结果：

全局 Custom Instructions 已成功写入

，配置如下：

```
github.copilot.chat.codeGeneration.instructions → [{text: "..."}]
```

**生效范围**：所有工作区、所有代码生成相关的 Copilot Chat 对话（包括 Inline Chat、Ask、Edits 模式）都会自动注入此规则，无需手动触发。

**注意**：此 setting key 主要覆盖代码生成场景。若想在纯问答对话中也强制生效，可以在 VS Code 设置里额外配置 `github.copilot.chat.instructions`（需要 VS Code 1.97+）。

[object Object]
Selected: 想查看规则现在的完整效果

以下是所有已配置规则的完整效果总览：

---

### 规则一：强制交互规则（每次回复必须以工具调用收尾）
**位置**：`settings.json → github.copilot.chat.codeGeneration.instructions`（全局自动注入）
**内容**：
> 每次回复必须以 `ask_questions` 工具调用结尾，禁止以纯文本句号收尾。  
> 回复结构：1.【执行/分析】执行任务；2.【结论】中文总结；3.【动作】调用 `ask_questions`

---

### 规则二：修改验证规则（自动降级写入）
**位置**：同上，合并在同一条 instruction 文本中
**内容**：
> 编辑文件后必须立即重新读取验证修改是否生效；  
> 若未生效，禁止重试相同工具，改用终端降级写入：  
> - VS Code 配置 → python3/node 解析后写回  
> - `vscode-userdata:` 文件 → sed/awk 覆写物理路径  
> - 普通文件 → python3/sed -i 精确替换  
> 全程无需询问用户，降级写入后必须二次验证

---

### 规则位置总览

| 规则 | 存储位置 | 生效范围 |
|---|---|---|
| 交互规则 + 修改验证 | `~/Library/Application Support/Code/User/settings.json` →

| 全局，所有代码生成对话 |
| agent 任务说明 + 规则副本 | `~/Library/Application Support/Code/User/prompts/coplict instruction.agent.md` | 手动调用该 Agent 时 |

[object Object]

没有现有 instructions 配置，直接用 Python 脚本安全地注入到 settings.json：

heredoc 被 terminal 工具误处理，改用写入临时脚本文件再执行：

是 JSONC 格式，标准 json 无法直接解析。先用 read_file 检查文件当前状态，确认是否被上次失败的 heredoc 破坏：

脚本未成功执行，指令尚未写入。检查临时脚本状态后重新运行：

直接用编辑工具在 github.copilot 区域插入配置，跳过 JSON 解析问题：

```

```

验证写入结果：

全局 Custom Instructions 已成功写入

，配置如下：

```
github.copilot.chat.codeGeneration.instructions → [{text: "..."}]
```

**生效范围**：所有工作区、所有代码生成相关的 Copilot Chat 对话（包括 Inline Chat、Ask、Edits 模式）都会自动注入此规则，无需手动触发。

**注意**：此 setting key 主要覆盖代码生成场景。若想在纯问答对话中也强制生效，可以在 VS Code 设置里额外配置 `github.copilot.chat.instructions`（需要 VS Code 1.97+）。

[object Object]
Selected: 想查看规则现在的完整效果

以下是所有已配置规则的完整效果总览：

---

### 规则一：强制交互规则（每次回复必须以工具调用收尾）
**位置**：`settings.json → github.copilot.chat.codeGeneration.instructions`（全局自动注入）
**内容**：
> 每次回复必须以 `ask_questions` 工具调用结尾，禁止以纯文本句号收尾。  
> 回复结构：1.【执行/分析】执行任务；2.【结论】中文总结；3.【动作】调用 `ask_questions`

---

### 规则二：修改验证规则（自动降级写入）
**位置**：同上，合并在同一条 instruction 文本中
**内容**：
> 编辑文件后必须立即重新读取验证修改是否生效；  
> 若未生效，禁止重试相同工具，改用终端降级写入：  
> - VS Code 配置 → python3/node 解析后写回  
> - `vscode-userdata:` 文件 → sed/awk 覆写物理路径  
> - 普通文件 → python3/sed -i 精确替换  
> 全程无需询问用户，降级写入后必须二次验证

---

### 规则位置总览

| 规则 | 存储位置 | 生效范围 |
|---|---|---|
| 交互规则 + 修改验证 | `~/Library/Application Support/Code/User/settings.json` →

| 全局，所有代码生成对话 |
| agent 任务说明 + 规则副本 | `~/Library/Application Support/Code/User/prompts/coplict instruction.agent.md` | 手动调用该 Agent 时 |

[object Object]
Selected: 完整，无需修改

配置完成。重启 VS Code 后规则即可全面生效。
