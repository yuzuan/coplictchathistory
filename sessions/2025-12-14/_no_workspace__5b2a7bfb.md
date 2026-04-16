# Analyze this codebase to generate or update `.github/copilot-instructions.md`...

| Field | Value |
|-------|-------|
| Session ID | `5b2a7bfb-4276-4c4f-bece-c7df7832c207` |
| Workspace | (no workspace) |
| Start | 2025/12/14 16:56 |
| End | 2025/12/14 19:30 |
| Messages | 2 |

---

### 👤 User <sub>2025/12/14 19:30</sub>

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

### 🤖 Copilot <sub>2025/12/14 19:30</sub>

当前 VS Code 没有打开任何工作区（你这边的环境信息显示 `There is no workspace currently open`），所以我没法对“这个代码库”做 glob 搜索、阅读文件并生成/更新 `.github/copilot-instructions.md`。

请你先做其中一个动作（任选其一）：
- 在 VS Code 里 `File → Open Folder...` 打开该代码库根目录；或
- 告诉我代码库在本机的路径（例如 `/Users/you/dev/repo`），并在该路径打开为工作区。

你打开后我会立刻：
- 用一次 glob 搜索读取 `**/{.github/copilot-instructions.md,AGENT.md,AGENTS.md,CLAUDE.md,.cursorrules,.windsurfrules,.clinerules,.cursor/rules/**,.windsurf/rules/**,.clinerules/**,README.md}`；
- 归纳架构/关键数据流/约定/依赖/工作流命令；
- 智能合并并更新 `.github/copilot-instructions.md`（约 20–50 行、尽量引用仓库内的关键路径与例子）；
- 最后请你确认我标注的“可能不确定点”。

你希望我“更新现有文件（若存在）”还是“如果不存在就新建”？（默认：不存在就新建，存在就合并更新。）
