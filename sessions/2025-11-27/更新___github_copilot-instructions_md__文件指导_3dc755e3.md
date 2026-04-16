# Analyze this codebase to generate or update `.github/copilot-instructions.md`...

| Field | Value |
|-------|-------|
| Session ID | `3dc755e3-9c60-4fa7-84db-be5365b75af8` |
| Workspace | 更新 `.github/copilot-instructions.md` 文件指导 |
| Start | 2025/11/27 15:35 |
| End | 2025/11/27 15:38 |
| Messages | 2 |

---

### 👤 User <sub>2025/11/27 15:38</sub>

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

### 🤖 Copilot <sub>2025/11/27 15:38</sub>

当前没有打开任何工作区。为了生成或更新 `.github/copilot-instructions.md` 文件，我需要访问一个代码库来分析其架构、工作流程和约定。

请先在 VS Code 中打开一个项目/工作区，然后我可以：

1. **分析代码库结构** - 了解主要组件、服务边界和数据流
2. **发现现有的 AI 指令文件** - 搜索 `copilot-instructions.md`、`AGENT.md`、`CLAUDE.md` 等
3. **识别项目特定的约定** - 代码风格、测试模式、构建命令等
4. **生成针对性的指导文档** - 帮助 AI 编码助手快速上手该项目

您可以通过以下方式打开工作区：
- **文件** → **打开文件夹** 选择您的项目目录
- 或在终端中使用 `code /path/to/your/project`

打开工作区后，请再次告诉我，我将开始分析并生成 `copilot-instructions.md`。
