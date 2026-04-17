import { ChatMessage, ChatSession, ToolCall } from './parser';
import { getSessionDateKey, getSessionTitle, SESSION_TIME_ZONE } from './formatter';

export interface SiteSessionSource {
  session: ChatSession;
  markdownRelativePath: string;
}

export interface SiteFile {
  relativePath: string;
  content: string;
}

interface SiteIndexEntry {
  sessionId: string;
  title: string;
  workspaceName: string;
  startTime: string;
  endTime: string;
  messageCount: number;
  toolCallCount: number;
  dateKey: string;
  markdownPath: string;
  detailPath: string;
  previewText: string;
  hasToolCalls: boolean;
}

const THEME_STORAGE_KEY = 'copilot-chat-sync.theme';
const LAST_SESSION_STORAGE_KEY = 'copilot-chat-sync.lastSessionId';
const GROUP_BY_STORAGE_KEY = 'copilot-chat-sync.groupBy';
const WORKSPACE_LAYOUT_STORAGE_KEY = 'copilot-chat-sync.workspaceViewMode';
const SEARCH_STORAGE_KEY = 'copilot-chat-sync.search';

const COPILOT_SVG = '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.998 0a.75.75 0 0 1 .727.563l.855 3.42 3.42.855a.75.75 0 0 1 0 1.453l-3.42.855-.855 3.42a.75.75 0 0 1-1.453 0l-.855-3.42-3.42-.855a.75.75 0 0 1 0-1.453l3.42-.855.855-3.42A.75.75 0 0 1 7.998 0z"/></svg>';
const USER_SVG = '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 1a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM3 14s-1 0-1-1 1-5 6-5 6 4 6 5-1 1-1 1H3z"/></svg>';

export function generateSiteFiles(sources: SiteSessionSource[]): SiteFile[] {
  const entries = sources
    .map(createIndexEntry)
    .sort((a, b) => toSortTime(b.startTime) - toSortTime(a.startTime));

  const files: SiteFile[] = [
    {
      relativePath: 'docs/index.html',
      content: renderSiteIndex(entries),
    },
    {
      relativePath: 'docs/data/index.json',
      content: JSON.stringify(entries, null, 2),
    },
    {
      relativePath: 'docs/assets/site.css',
      content: renderSiteCss(),
    },
    {
      relativePath: 'docs/assets/site.js',
      content: renderSiteJs(),
    },
    {
      relativePath: 'docs/assets/session.js',
      content: renderSessionJs(),
    },
  ];

  for (const source of sources) {
    const entry = entries.find(item => item.sessionId === source.session.sessionId);
    if (!entry) {
      continue;
    }

    files.push({
      relativePath: `docs/session/${source.session.sessionId}.html`,
      content: renderSessionDocument(source.session, entry, {
        assetPrefix: '../assets',
        markdownPath: `../../${normalizeRelativePath(source.markdownRelativePath)}`,
      }),
    });
  }

  return files;
}

function createIndexEntry(source: SiteSessionSource): SiteIndexEntry {
  const { session } = source;
  const toolCallCount = countToolCalls(session);

  return {
    sessionId: session.sessionId,
    title: getSessionTitle(session),
    workspaceName: session.workspaceName || '(no workspace)',
    startTime: session.startTime,
    endTime: session.endTime,
    messageCount: session.messages.length,
    toolCallCount,
    dateKey: getSessionDateKey(session.startTime),
    markdownPath: `../${normalizeRelativePath(source.markdownRelativePath)}`,
    detailPath: `session/${session.sessionId}.html`,
    previewText: truncateText(extractPreviewText(session), 140),
    hasToolCalls: toolCallCount > 0,
  };
}

function renderSiteIndex(entries: SiteIndexEntry[]): string {
  const latest = entries[0];
  const initialTitle = latest ? escapeHtml(latest.title) : 'No sessions';
  const initialMeta = latest
    ? `${escapeHtml(latest.workspaceName)} · ${escapeHtml(formatTime(latest.startTime))}`
    : 'No chat sessions found';
  const inlineJson = escapeJsonForHtml(JSON.stringify(entries));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>Copilot Chat History</title>
  <link rel="stylesheet" href="assets/site.css">
</head>
<body class="site-page">
  <div class="site-shell">
    <aside class="site-sidebar">
      <div class="sidebar-header">
        <div>
          <p class="sidebar-kicker">Generated chat archive</p>
          <h1>Copilot Chat History</h1>
        </div>
        <p class="sidebar-copy">网页界面按 VS Code 阅读体验整理，保留 Workspace 和日期两种浏览方式。</p>
      </div>

      <div class="sidebar-controls">
        <div class="control-block">
          <span class="control-label">Group by</span>
          <div class="segmented-control" id="group-by-control">
            <button type="button" data-value="workspace">Workspace</button>
            <button type="button" data-value="date">Date</button>
          </div>
        </div>

        <div class="control-block" id="workspace-layout-block">
          <span class="control-label">Workspace layout</span>
          <div class="segmented-control" id="workspace-layout-control">
            <button type="button" data-value="flat">Workspace / Session</button>
            <button type="button" data-value="byDate">Workspace / Date / Session</button>
          </div>
        </div>

        <div class="control-block">
          <label class="control-label" for="session-search">Search</label>
          <input id="session-search" class="search-input" type="search" placeholder="Search title, workspace, preview...">
        </div>

        <div class="control-block">
          <span class="control-label">Theme</span>
          <div class="segmented-control" id="theme-control">
            <button type="button" data-value="auto">Auto</button>
            <button type="button" data-value="light">Light</button>
            <button type="button" data-value="dark">Dark</button>
          </div>
        </div>
      </div>

      <div id="session-list" class="session-list" aria-live="polite"></div>
    </aside>

    <main class="site-main">
      <header class="site-main-header">
        <div>
          <p class="main-kicker">Current session</p>
          <h2 id="selected-session-title">${initialTitle}</h2>
          <p id="selected-session-meta" class="selected-session-meta">${initialMeta}</p>
        </div>
        <div class="main-actions">
          <a id="selected-markdown-link" class="action-link secondary" href="${latest ? escapeHtml(latest.markdownPath) : '#'}">Markdown</a>
          <a id="open-standalone-link" class="action-link" href="${latest ? escapeHtml(latest.detailPath) : '#'}">Open page</a>
        </div>
      </header>

      <div class="detail-frame-shell">
        <iframe
          id="session-detail-frame"
          class="session-detail-frame"
          title="Selected chat session"
          src="${latest ? `${escapeHtml(latest.detailPath)}?embedded=1` : ''}">
        </iframe>
      </div>
    </main>
  </div>

  <script id="copilot-chat-index-data" type="application/json">${inlineJson}</script>
  <script src="assets/site.js"></script>
</body>
</html>`;
}

function renderSessionDocument(
  session: ChatSession,
  entry: SiteIndexEntry,
  options: { assetPrefix: string; markdownPath: string },
): string {
  const title = escapeHtml(entry.title);
  const workspaceName = escapeHtml(entry.workspaceName);
  const sessionInfo = `${workspaceName} · ${escapeHtml(formatTime(session.startTime))} · ${session.messages.length} messages`;
  const messageCards = session.messages.map(renderMessageCard).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${title}</title>
  <link rel="stylesheet" href="${options.assetPrefix}/site.css">
</head>
<body class="session-page">
  <header class="standalone-session-header">
    <div>
      <p class="main-kicker">Standalone session</p>
      <h1>${title}</h1>
      <p class="selected-session-meta">${sessionInfo}</p>
    </div>
    <div class="main-actions">
      <a class="action-link secondary" href="${escapeHtml(options.markdownPath)}">Markdown</a>
      <a class="action-link secondary" href="../index.html#${escapeHtml(session.sessionId)}">Back to list</a>
    </div>
  </header>

  <main class="session-page-body">
    <div class="session-stack">
      ${messageCards}
    </div>
  </main>

  <script src="${options.assetPrefix}/session.js"></script>
</body>
</html>`;
}

function renderMessageCard(message: ChatMessage): string {
  const label = message.role === 'assistant' ? 'Copilot' : 'You';
  const roleClass = message.role === 'assistant' ? 'assistant' : 'user';
  const avatarSvg = message.role === 'assistant' ? COPILOT_SVG : USER_SVG;
  const toolCalls = message.toolCalls && message.toolCalls.length > 0
    ? renderToolCalls(message.toolCalls)
    : '';

  return `<div class="chat-turn ${roleClass}">
    <div class="chat-avatar" aria-hidden="true">${avatarSvg}</div>
    <div class="chat-body">
      <div class="chat-header">
        <span class="chat-sender">${label}</span>
        <time class="chat-time">${escapeHtml(formatTime(message.timestamp))}</time>
      </div>
      <div class="chat-content">
        ${renderMessageContent(message.content)}
      </div>
      ${toolCalls}
    </div>
  </div>`;
}

function renderToolCalls(toolCalls: ToolCall[]): string {
  const items = toolCalls.map(renderToolCallItem).join('');
  return `<details class="tool-calls">
    <summary class="tool-calls-summary">
      <span class="tool-calls-chevron" aria-hidden="true">▸</span>
      <svg class="tool-calls-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M5.686 2.922A1.5 1.5 0 0 0 4.29 2.5h-.29v.528l.003.078a1.5 1.5 0 0 0 .706 1.147l1.454.966a.5.5 0 0 1 0 .831l-1.454.966A1.5 1.5 0 0 0 4.003 8.14L4 8.218v.282h.29a1.5 1.5 0 0 0 1.396-.422l2.45-2.45a.5.5 0 0 0 0-.707l-2.45-2z"/><path fill="currentColor" d="M10.314 2.922A1.5 1.5 0 0 1 11.71 2.5H12v.528l-.003.078a1.5 1.5 0 0 1-.706 1.147l-1.454.966a.5.5 0 0 0 0 .831l1.454.966a1.5 1.5 0 0 1 .706 1.124l.003.078V8.5h-.29a1.5 1.5 0 0 1-1.396-.422l-2.45-2.45a.5.5 0 0 1 0-.707l2.45-2z"/></svg>
      <span>Tool calls (${toolCalls.length})</span>
    </summary>
    <div class="tool-calls-body">${items}</div>
  </details>`;
}

function renderToolCallItem(toolCall: ToolCall): string {
  const args = JSON.stringify(toolCall.arguments || {}, null, 2);
  return `<div class="tool-call-item">
    <span class="tool-call-name">${escapeHtml(toolCall.name || 'tool')}</span>
    ${args && args !== '{}' ? `<pre class="tool-call-args"><code>${escapeHtml(args)}</code></pre>` : ''}
  </div>`;
}

function renderMessageContent(content: string): string {
  if (!content.trim()) {
    return '<p class="message-paragraph empty-content">(empty)</p>';
  }

  const blocks = splitContentBlocks(content);
  return blocks.map(block => {
    if (block.type === 'code') {
      return `<pre class="message-code-block"><code>${escapeHtml(block.value)}</code></pre>`;
    }

    const paragraphs = block.value
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean)
      .map(paragraph => `<p class="message-paragraph">${renderInlineText(paragraph)}</p>`);

    return paragraphs.join('');
  }).join('');
}

function splitContentBlocks(content: string): Array<{ type: 'text' | 'code'; value: string }> {
  const blocks: Array<{ type: 'text' | 'code'; value: string }> = [];
  const fencePattern = /```[\w-]*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fencePattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    blocks.push({ type: 'code', value: match[1].trimEnd() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', value: content }];
}

function renderInlineText(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, '<br>');
}

function renderSiteCss(): string {
  return `:root {
  color-scheme: light dark;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "Fira Code", monospace;
  --page-bg: #f3f5f8;
  --sidebar-bg: rgba(255, 255, 255, 0.94);
  --panel-bg: rgba(255, 255, 255, 0.82);
  --surface-bg: #ffffff;
  --surface-border: #d7dbe1;
  --surface-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
  --text-primary: #22242a;
  --text-secondary: #6d717b;
  --text-muted: #8b919c;
  --accent: #2563eb;
  --accent-soft: rgba(37, 99, 235, 0.12);
  --chip-bg: #eef1f6;
  --chip-border: #d6dbe5;
  --session-hover: rgba(37, 99, 235, 0.08);
  --session-active: rgba(37, 99, 235, 0.14);
  --code-bg: #f6f8fa;
  --user-turn-bg: rgba(37, 99, 235, 0.04);
  --frame-bg: linear-gradient(180deg, rgba(255,255,255,0.72), rgba(244,246,250,0.9));
}

:root[data-theme="dark"] {
  --page-bg: #11151c;
  --sidebar-bg: rgba(20, 25, 33, 0.96);
  --panel-bg: rgba(18, 23, 30, 0.9);
  --surface-bg: #1b212b;
  --surface-border: #303746;
  --surface-shadow: 0 16px 38px rgba(0, 0, 0, 0.35);
  --text-primary: #eef2f7;
  --text-secondary: #bac3cf;
  --text-muted: #8c95a3;
  --accent: #78a9ff;
  --accent-soft: rgba(120, 169, 255, 0.18);
  --chip-bg: #202736;
  --chip-border: #344056;
  --session-hover: rgba(120, 169, 255, 0.12);
  --session-active: rgba(120, 169, 255, 0.2);
  --code-bg: #161b22;
  --user-turn-bg: rgba(120, 169, 255, 0.06);
  --frame-bg: linear-gradient(180deg, rgba(16,20,26,0.92), rgba(14,18,24,0.98));
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --page-bg: #11151c;
    --sidebar-bg: rgba(20, 25, 33, 0.96);
    --panel-bg: rgba(18, 23, 30, 0.9);
    --surface-bg: #1b212b;
    --surface-border: #303746;
    --surface-shadow: 0 16px 38px rgba(0, 0, 0, 0.35);
    --text-primary: #eef2f7;
    --text-secondary: #bac3cf;
    --text-muted: #8c95a3;
    --accent: #78a9ff;
    --accent-soft: rgba(120, 169, 255, 0.18);
    --chip-bg: #202736;
    --chip-border: #344056;
    --session-hover: rgba(120, 169, 255, 0.12);
    --session-active: rgba(120, 169, 255, 0.2);
    --code-bg: #161b22;
    --user-turn-bg: rgba(120, 169, 255, 0.06);
    --frame-bg: linear-gradient(180deg, rgba(16,20,26,0.92), rgba(14,18,24,0.98));
  }
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  font-family: var(--font-sans);
  background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 32%), var(--page-bg);
  color: var(--text-primary);
}

body {
  min-height: 100vh;
}

a {
  color: inherit;
}

.site-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
}

.site-sidebar {
  position: sticky;
  top: 0;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 20px 20px;
  background: var(--sidebar-bg);
  border-right: 1px solid rgba(127, 139, 158, 0.18);
  backdrop-filter: blur(24px);
}

.sidebar-header h1,
.site-main-header h2,
.standalone-session-header h1 {
  margin: 0;
  line-height: 1.15;
}

.sidebar-kicker,
.main-kicker {
  margin: 0 0 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  font-weight: 700;
}

.sidebar-copy,
.selected-session-meta {
  margin: 10px 0 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.sidebar-controls {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  background: var(--panel-bg);
  border: 1px solid rgba(127, 139, 158, 0.18);
  box-shadow: var(--surface-shadow);
}

.control-block {
  display: grid;
  gap: 8px;
}

.control-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.segmented-control {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.segmented-control button,
.action-link,
.search-input,
.session-row {
  font: inherit;
}

.segmented-control button {
  border: 1px solid var(--chip-border);
  background: var(--chip-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease;
}

.segmented-control button.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

.segmented-control button:hover,
.action-link:hover,
.session-row:hover {
  transform: translateY(-1px);
}

.search-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--chip-border);
  background: var(--surface-bg);
  color: var(--text-primary);
}

.session-list {
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: 12px;
  padding-right: 4px;
}

.group-card {
  border-radius: 18px;
  border: 1px solid rgba(127, 139, 158, 0.18);
  background: var(--panel-bg);
  overflow: hidden;
}

.group-card details {
  border-radius: inherit;
}

.group-card summary {
  list-style: none;
  cursor: pointer;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-primary);
}

.group-card summary::-webkit-details-marker,
.tool-calls summary::-webkit-details-marker {
  display: none;
}

.group-title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.group-chevron,
.tool-calls-chevron {
  display: inline-flex;
  transition: transform 140ms ease;
}

.group-card details[open] > summary .group-chevron,
.tool-calls[open] .tool-calls-chevron {
  transform: rotate(90deg);
}

.group-label {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-count {
  color: var(--text-muted);
  font-size: 13px;
}

.group-children {
  display: grid;
  gap: 8px;
  padding: 0 12px 12px;
}

.group-children.nested {
  padding-left: 18px;
}

.session-row {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 12px 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: background 140ms ease, transform 140ms ease;
  color: var(--text-primary);
}

.session-row:hover {
  background: var(--session-hover);
}

.session-row.active {
  background: var(--session-active);
}

.session-title-line,
.session-meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.session-title-text {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-badge {
  flex: 0 0 auto;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--chip-border);
  color: var(--text-muted);
}

.session-meta-line {
  margin-top: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.session-preview {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  padding: 20px;
  border-radius: 18px;
  background: var(--panel-bg);
  border: 1px solid rgba(127, 139, 158, 0.18);
  color: var(--text-secondary);
}

.site-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 28px;
  gap: 20px;
}

.site-main-header,
.standalone-session-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 24px;
  border-radius: 24px;
  border: 1px solid rgba(127, 139, 158, 0.18);
  background: var(--panel-bg);
  box-shadow: var(--surface-shadow);
}

.main-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--accent);
  color: #ffffff;
  text-decoration: none;
  transition: transform 140ms ease, opacity 140ms ease, background 140ms ease;
}

.action-link.secondary {
  background: var(--chip-bg);
  border-color: var(--chip-border);
  color: var(--text-primary);
}

.detail-frame-shell {
  min-height: 0;
  flex: 1 1 auto;
  border-radius: 28px;
  border: 1px solid rgba(127, 139, 158, 0.18);
  background: var(--frame-bg);
  box-shadow: var(--surface-shadow);
  overflow: hidden;
}

.session-detail-frame {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 164px);
  border: 0;
  background: transparent;
}

.session-page {
  padding: 0;
  background: var(--page-bg);
}

.session-page:not([data-embedded="true"]) {
  padding: 16px;
}

.session-page[data-embedded="true"] .standalone-session-header {
  display: none;
}

.session-page-body {
  max-width: 900px;
  margin: 0 auto;
}

.session-stack {
  display: flex;
  flex-direction: column;
}

.chat-turn {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
}

.chat-turn + .chat-turn {
  border-top: 1px solid var(--surface-border);
}

.chat-turn.user {
  background: var(--user-turn-bg);
}

.chat-avatar {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  color: var(--text-muted);
}

.chat-turn.assistant .chat-avatar {
  color: var(--accent);
}

.chat-avatar svg {
  width: 16px;
  height: 16px;
}

.chat-body {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.chat-sender {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.chat-time {
  font-size: 12px;
  color: var(--text-muted);
}

.chat-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}

.message-paragraph {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-paragraph + .message-paragraph {
  margin-top: 10px;
}

.message-code-block {
  margin: 10px 0;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  background: var(--code-bg);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}

.inline-code {
  padding: 1px 5px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--chip-bg);
}

.tool-calls {
  margin-top: 10px;
}

.tool-calls-summary {
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  background: var(--chip-bg);
}

.tool-calls-summary:hover {
  background: var(--session-hover);
}

.tool-calls-icon {
  flex: 0 0 14px;
}

.tool-calls-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.tool-call-item {
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  background: var(--chip-bg);
  padding: 8px 12px;
}

.tool-call-name {
  font-weight: 600;
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.tool-call-args {
  margin: 6px 0 0;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--surface-border);
  background: var(--code-bg);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
}

.empty-content {
  color: var(--text-muted);
  font-style: italic;
}

@media (max-width: 1160px) {
  .site-shell {
    grid-template-columns: 1fr;
  }

  .site-sidebar {
    position: static;
    max-height: none;
    border-right: 0;
    border-bottom: 1px solid rgba(127, 139, 158, 0.18);
  }

  .session-detail-frame {
    min-height: 920px;
  }
}

@media (max-width: 720px) {
  .site-main {
    padding: 14px;
  }

  .site-main-header,
  .standalone-session-header {
    padding: 16px;
    border-radius: 16px;
  }

  .chat-turn {
    padding: 12px 14px;
    gap: 10px;
  }
}`;
}

function renderSiteJs(): string {
  return `(function () {
  var THEME_KEY = ${JSON.stringify(THEME_STORAGE_KEY)};
  var LAST_SESSION_KEY = ${JSON.stringify(LAST_SESSION_STORAGE_KEY)};
  var GROUP_BY_KEY = ${JSON.stringify(GROUP_BY_STORAGE_KEY)};
  var WORKSPACE_LAYOUT_KEY = ${JSON.stringify(WORKSPACE_LAYOUT_STORAGE_KEY)};
  var SEARCH_KEY = ${JSON.stringify(SEARCH_STORAGE_KEY)};
  var params = new URLSearchParams(window.location.search);
  var root = document.documentElement;
  var prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function getParam(name) {
    var value = params.get(name);
    return value === null ? '' : value;
  }

  function safeGet(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // ignore
    }
  }

  function parseEntries() {
    var el = document.getElementById('copilot-chat-index-data');
    if (!el) {
      return [];
    }

    try {
      var parsed = JSON.parse(el.textContent || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  var entries = parseEntries();
  var entriesById = new Map(entries.map(function (entry) { return [entry.sessionId, entry]; }));
  var initialTheme = getParam('theme');
  var initialGroupBy = getParam('groupBy');
  var initialWorkspaceViewMode = getParam('workspaceViewMode');
  var initialSearch = getParam('search');
  var initialSessionId = getParam('sessionId');
  var state = {
    theme: initialTheme === 'light' || initialTheme === 'dark' || initialTheme === 'auto'
      ? initialTheme
      : safeGet(THEME_KEY, 'auto'),
    groupBy: initialGroupBy === 'date'
      ? 'date'
      : initialGroupBy === 'workspace'
        ? 'workspace'
        : safeGet(GROUP_BY_KEY, 'workspace') === 'date'
          ? 'date'
          : 'workspace',
    workspaceViewMode: initialWorkspaceViewMode === 'byDate'
      ? 'byDate'
      : initialWorkspaceViewMode === 'flat'
        ? 'flat'
        : safeGet(WORKSPACE_LAYOUT_KEY, 'flat') === 'byDate'
          ? 'byDate'
          : 'flat',
    search: initialSearch || safeGet(SEARCH_KEY, ''),
    selectedSessionId: '',
  };

  var sessionList = document.getElementById('session-list');
  var searchInput = document.getElementById('session-search');
  var detailFrame = document.getElementById('session-detail-frame');
  var sessionTitle = document.getElementById('selected-session-title');
  var sessionMeta = document.getElementById('selected-session-meta');
  var markdownLink = document.getElementById('selected-markdown-link');
  var standaloneLink = document.getElementById('open-standalone-link');
  var groupButtons = Array.prototype.slice.call(document.querySelectorAll('#group-by-control button'));
  var layoutButtons = Array.prototype.slice.call(document.querySelectorAll('#workspace-layout-control button'));
  var themeButtons = Array.prototype.slice.call(document.querySelectorAll('#theme-control button'));
  var workspaceLayoutBlock = document.getElementById('workspace-layout-block');

  function toSortTime(value) {
    var time = new Date(value || '').getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  function resolveThemeChoice(choice) {
    if (choice === 'light' || choice === 'dark') {
      return choice;
    }
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  }

  function applyTheme(choice, persist) {
    state.theme = choice === 'light' || choice === 'dark' ? choice : 'auto';
    if (persist) {
      safeSet(THEME_KEY, state.theme);
    }

    var resolved = resolveThemeChoice(state.theme);
    root.setAttribute('data-theme', resolved);

    themeButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.value === state.theme);
    });

    refreshDetailFrame();
  }

  function buildFrameSrc(entry) {
    var url = entry.detailPath + '?embedded=1&theme=' + encodeURIComponent(state.theme);
    return url;
  }

  function buildStandaloneHref(entry) {
    return entry.detailPath + '?theme=' + encodeURIComponent(state.theme);
  }

  function refreshDetailFrame() {
    if (!state.selectedSessionId) {
      return;
    }
    var entry = entriesById.get(state.selectedSessionId);
    if (!entry || !detailFrame) {
      return;
    }

    var src = buildFrameSrc(entry);
    if (detailFrame.getAttribute('src') !== src) {
      detailFrame.setAttribute('src', src);
    }

    if (standaloneLink) {
      standaloneLink.setAttribute('href', buildStandaloneHref(entry));
    }
  }

  function getLatestEntry() {
    if (entries.length === 0) {
      return null;
    }
    return entries.slice().sort(function (a, b) {
      return toSortTime(b.startTime) - toSortTime(a.startTime);
    })[0];
  }

  function getInitialSessionId() {
    if (initialSessionId && entriesById.has(initialSessionId)) {
      return initialSessionId;
    }

    var fromHash = (window.location.hash || '').replace(/^#/, '');
    if (fromHash && entriesById.has(fromHash)) {
      return fromHash;
    }

    var last = safeGet(LAST_SESSION_KEY, '');
    if (last && entriesById.has(last)) {
      return last;
    }

    var latest = getLatestEntry();
    return latest ? latest.sessionId : '';
  }

  function selectSession(sessionId, options) {
    var entry = entriesById.get(sessionId);
    if (!entry) {
      var fallback = getLatestEntry();
      if (!fallback) {
        return;
      }
      entry = fallback;
    }

    state.selectedSessionId = entry.sessionId;
    safeSet(LAST_SESSION_KEY, entry.sessionId);
    window.location.hash = entry.sessionId;

    if (sessionTitle) {
      sessionTitle.textContent = entry.title;
    }
    if (sessionMeta) {
      sessionMeta.textContent = entry.workspaceName + ' · ' + new Date(entry.startTime).toLocaleString('zh-CN', {
        timeZone: ${JSON.stringify(SESSION_TIME_ZONE)},
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' · ' + entry.messageCount + ' messages';
    }
    if (markdownLink) {
      markdownLink.setAttribute('href', entry.markdownPath);
    }
    if (standaloneLink) {
      standaloneLink.setAttribute('href', buildStandaloneHref(entry));
    }
    refreshDetailFrame();
    renderSessionList();
  }

  function normalizeText(value) {
    return (value || '').toLowerCase();
  }

  function getFilteredEntries() {
    var query = normalizeText(state.search).trim();
    if (!query) {
      return entries.slice();
    }

    return entries.filter(function (entry) {
      return [entry.title, entry.workspaceName, entry.previewText, entry.dateKey]
        .map(normalizeText)
        .some(function (value) { return value.indexOf(query) >= 0; });
    });
  }

  function createGroupCard(label, count, children, depth) {
    var card = document.createElement('section');
    card.className = 'group-card';

    var details = document.createElement('details');
    details.open = true;

    var summary = document.createElement('summary');
    summary.innerHTML = '<span class="group-title-line"><span class="group-chevron" aria-hidden="true">▸</span><span class="group-label"></span></span><span class="group-count"></span>';
    var labelNode = summary.querySelector('.group-label');
    var countNode = summary.querySelector('.group-count');
    if (labelNode) {
      labelNode.textContent = label;
    }
    if (countNode) {
      countNode.textContent = count + ' sessions';
    }

    var childWrap = document.createElement('div');
    childWrap.className = 'group-children' + (depth > 0 ? ' nested' : '');
    children.forEach(function (child) { childWrap.appendChild(child); });

    details.appendChild(summary);
    details.appendChild(childWrap);
    card.appendChild(details);
    return card;
  }

  function createSessionRow(entry) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'session-row' + (entry.sessionId === state.selectedSessionId ? ' active' : '');
    button.innerHTML =
      '<div class="session-title-line">' +
        '<span class="session-title-text"></span>' +
        (entry.hasToolCalls ? '<span class="session-badge">tools ' + entry.toolCallCount + '</span>' : '') +
      '</div>' +
      '<div class="session-meta-line">' +
        '<span>' + entry.workspaceName + '</span>' +
        '<span>·</span>' +
        '<span>' + entry.dateKey + '</span>' +
        '<span>·</span>' +
        '<span>' + entry.messageCount + ' msgs</span>' +
      '</div>' +
      '<div class="session-preview"></div>';

    var titleNode = button.querySelector('.session-title-text');
    var previewNode = button.querySelector('.session-preview');
    if (titleNode) {
      titleNode.textContent = entry.title;
    }
    if (previewNode) {
      previewNode.textContent = entry.previewText;
    }

    button.addEventListener('click', function () {
      selectSession(entry.sessionId);
    });
    return button;
  }

  function sortEntriesDesc(list) {
    return list.slice().sort(function (a, b) {
      return toSortTime(b.startTime) - toSortTime(a.startTime);
    });
  }

  function renderByDate(entriesToRender) {
    var byDate = new Map();
    sortEntriesDesc(entriesToRender).forEach(function (entry) {
      if (!byDate.has(entry.dateKey)) {
        byDate.set(entry.dateKey, []);
      }
      byDate.get(entry.dateKey).push(entry);
    });

    return Array.from(byDate.entries())
      .sort(function (a, b) { return b[0].localeCompare(a[0]); })
      .map(function (pair) {
        var children = pair[1].map(createSessionRow);
        return createGroupCard(pair[0], pair[1].length, children, 0);
      });
  }

  function renderWorkspaceFlat(entriesToRender) {
    var byWorkspace = new Map();
    sortEntriesDesc(entriesToRender).forEach(function (entry) {
      if (!byWorkspace.has(entry.workspaceName)) {
        byWorkspace.set(entry.workspaceName, []);
      }
      byWorkspace.get(entry.workspaceName).push(entry);
    });

    return Array.from(byWorkspace.entries())
      .sort(function (a, b) {
        return toSortTime(b[1][0].startTime) - toSortTime(a[1][0].startTime);
      })
      .map(function (pair) {
        var children = pair[1].map(createSessionRow);
        return createGroupCard(pair[0], pair[1].length, children, 0);
      });
  }

  function renderWorkspaceByDate(entriesToRender) {
    var byWorkspace = new Map();
    sortEntriesDesc(entriesToRender).forEach(function (entry) {
      if (!byWorkspace.has(entry.workspaceName)) {
        byWorkspace.set(entry.workspaceName, []);
      }
      byWorkspace.get(entry.workspaceName).push(entry);
    });

    return Array.from(byWorkspace.entries())
      .sort(function (a, b) {
        return toSortTime(b[1][0].startTime) - toSortTime(a[1][0].startTime);
      })
      .map(function (pair) {
        var byDate = new Map();
        pair[1].forEach(function (entry) {
          if (!byDate.has(entry.dateKey)) {
            byDate.set(entry.dateKey, []);
          }
          byDate.get(entry.dateKey).push(entry);
        });

        var children = Array.from(byDate.entries())
          .sort(function (a, b) { return b[0].localeCompare(a[0]); })
          .map(function (datePair) {
            return createGroupCard(datePair[0], datePair[1].length, datePair[1].map(createSessionRow), 1);
          });

        return createGroupCard(pair[0], pair[1].length, children, 0);
      });
  }

  function renderSessionList() {
    if (!sessionList) {
      return;
    }

    sessionList.innerHTML = '';
    var filtered = getFilteredEntries();
    if (filtered.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No sessions match the current filters.';
      sessionList.appendChild(empty);
      return;
    }

    var groups;
    if (state.groupBy === 'date') {
      groups = renderByDate(filtered);
    } else if (state.workspaceViewMode === 'byDate') {
      groups = renderWorkspaceByDate(filtered);
    } else {
      groups = renderWorkspaceFlat(filtered);
    }

    groups.forEach(function (group) { sessionList.appendChild(group); });
  }

  function renderControlState() {
    groupButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.value === state.groupBy);
    });
    layoutButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.value === state.workspaceViewMode);
    });
    if (workspaceLayoutBlock) {
      workspaceLayoutBlock.style.display = state.groupBy === 'workspace' ? '' : 'none';
    }
    if (searchInput) {
      searchInput.value = state.search;
    }
  }

  function bindEvents() {
    groupButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.groupBy = button.dataset.value === 'date' ? 'date' : 'workspace';
        safeSet(GROUP_BY_KEY, state.groupBy);
        renderControlState();
        renderSessionList();
      });
    });

    layoutButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.workspaceViewMode = button.dataset.value === 'byDate' ? 'byDate' : 'flat';
        safeSet(WORKSPACE_LAYOUT_KEY, state.workspaceViewMode);
        renderControlState();
        renderSessionList();
      });
    });

    themeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyTheme(button.dataset.value || 'auto', true);
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function (event) {
        var target = event.target;
        state.search = target && target.value ? target.value : '';
        safeSet(SEARCH_KEY, state.search);
        renderSessionList();
      });
    }

    window.addEventListener('hashchange', function () {
      var fromHash = (window.location.hash || '').replace(/^#/, '');
      if (fromHash && entriesById.has(fromHash)) {
        selectSession(fromHash);
      }
    });

    if (prefersDark && typeof prefersDark.addEventListener === 'function') {
      prefersDark.addEventListener('change', function () {
        if (state.theme === 'auto') {
          applyTheme('auto', false);
        }
      });
    }
  }

  function init() {
    renderControlState();
    bindEvents();
    applyTheme(state.theme, false);
    state.selectedSessionId = getInitialSessionId();
    if (state.selectedSessionId) {
      selectSession(state.selectedSessionId);
    } else {
      renderSessionList();
    }
  }

  init();
})();`;
}

function renderSessionJs(): string {
  return `(function () {
  var THEME_KEY = ${JSON.stringify(THEME_STORAGE_KEY)};
  var prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var params = new URLSearchParams(window.location.search);
  var explicitTheme = params.get('theme');
  var embedded = params.get('embedded') === '1';
  var root = document.documentElement;

  function safeGetTheme() {
    if (explicitTheme === 'light' || explicitTheme === 'dark' || explicitTheme === 'auto') {
      return explicitTheme;
    }

    try {
      var stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored;
      }
    } catch (error) {
      // ignore
    }

    return 'auto';
  }

  function resolveTheme(choice) {
    if (choice === 'light' || choice === 'dark') {
      return choice;
    }
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  }

  function applyTheme() {
    root.setAttribute('data-theme', resolveTheme(safeGetTheme()));
  }

  if (embedded) {
    document.body.setAttribute('data-embedded', 'true');
  }

  applyTheme();

  if (prefersDark && typeof prefersDark.addEventListener === 'function') {
    prefersDark.addEventListener('change', function () {
      if (safeGetTheme() === 'auto') {
        applyTheme();
      }
    });
  }
})();`;
}

function extractPreviewText(session: ChatSession): string {
  const assistant = session.messages.find(message => message.role === 'assistant' && message.content.trim());
  if (assistant) {
    return assistant.content.trim().replace(/\s+/g, ' ');
  }

  const user = session.messages.find(message => message.role === 'user' && message.content.trim());
  if (user) {
    return user.content.trim().replace(/\s+/g, ' ');
  }

  return getSessionTitle(session);
}

function countToolCalls(session: ChatSession): number {
  return session.messages.reduce((total, message) => total + (message.toolCalls?.length || 0), 0);
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function formatTime(isoString: string): string {
  if (!isoString) {
    return 'unknown';
  }

  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return 'unknown';
    }

    return date.toLocaleString('zh-CN', {
      timeZone: SESSION_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

function toSortTime(isoString: string): number {
  const time = new Date(isoString || '').getTime();
  return Number.isNaN(time) ? 0 : time;
}

function normalizeRelativePath(relativePath: string): string {
  return relativePath.split('\\').join('/');
}

function escapeHtml(text: unknown): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonForHtml(json: string): string {
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
