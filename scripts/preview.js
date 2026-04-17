#!/usr/bin/env node
/**
 * Generate a preview of the site with mock data.
 * Usage: node scripts/preview.js
 * Output: /tmp/copilot-chat-preview/
 */
const fs = require('fs');
const path = require('path');
const { generateSiteFiles } = require('../out/site');

const mockSession = {
  sessionId: 'preview-session-001',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  workspaceName: 'copilot-chat-sync',
  workspaceHash: 'preview',
  messages: [
    {
      role: 'user',
      content: '帮我看一下 site.ts 的生成逻辑，我想让 GitHub Pages 的聊天 UI 和 VS Code 里的一样。',
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      role: 'assistant',
      content: `好的，我来分析一下当前的代码结构。

\`site.ts\` 中有几个关键函数：

- \`generateSiteFiles()\` — 生成所有静态文件
- \`renderSessionDocument()\` — 渲染单个会话页面
- \`renderMessageCard()\` — 渲染每条消息

当前的问题是字号过大（28px 段落、24px 作者名）、emoji 图标、重卡片阴影。需要改成 VS Code 风格的紧凑布局。

\`\`\`typescript
function renderMessageCard(message: ChatMessage): string {
  const label = message.role === 'assistant' ? 'Copilot' : 'You';
  return \\\`<div class="chat-turn">\\\`;
}
\`\`\`

以上是核心改动思路。`,
      timestamp: new Date(Date.now() - 240000).toISOString(),
      toolCalls: [
        { name: 'read_file', arguments: { filePath: 'src/site.ts', startLine: 1, endLine: 50 } },
        { name: 'grep_search', arguments: { query: 'renderMessageCard', isRegexp: false } },
      ],
    },
    {
      role: 'user',
      content: '好的，直接改吧。记得保持和 VS Code 一致的字号和间距。',
      timestamp: new Date(Date.now() - 180000).toISOString(),
    },
    {
      role: 'assistant',
      content: `已完成所有改动：

1. **HTML 结构** — 从 \`<article class="message-card">\` 改为 \`<div class="chat-turn">\`
2. **SVG 图标** — 替换 emoji（🤖/👤）为 Copilot sparkle 和人物轮廓 SVG
3. **字号** — 正文 14px、作者名 13px、时间戳 12px
4. **布局** — 消息间用 1px 分隔线代替卡片阴影

所有改动已通过 TypeScript 编译验证。`,
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      role: 'user',
      content: '本地预览一下效果',
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      role: 'assistant',
      content: '生成预览中...',
      timestamp: new Date().toISOString(),
    },
  ],
};

const sources = [{ session: mockSession, markdownRelativePath: 'sessions/preview.md' }];
const files = generateSiteFiles(sources);

const outDir = '/tmp/copilot-chat-preview';
for (const file of files) {
  const fullPath = path.join(outDir, file.relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, file.content, 'utf-8');
}

console.log(`Generated ${files.length} files → ${outDir}`);
console.log('Open in browser:');
console.log(`  file://${outDir}/index.html`);

// Also find the session page path
const sessionFile = files.find(f => f.relativePath.startsWith('session/'));
if (sessionFile) {
  console.log(`  file://${outDir}/${sessionFile.relativePath}`);
}
