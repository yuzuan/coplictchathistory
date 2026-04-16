/**
 * Copilot Chat Sync — Convert ChatSession to Markdown
 */

import { ChatSession, ChatMessage } from './parser';

export interface FormatOptions {
  includeToolCalls: boolean;
  includeMetadata: boolean;
}

export const SESSION_TIME_ZONE = 'Asia/Shanghai';

const defaultOptions: FormatOptions = {
  includeToolCalls: false,
  includeMetadata: true,
};

/** Regex patterns for common secrets that should be redacted */
const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{36,}/g,                    // GitHub PAT (classic)
  /github_pat_[A-Za-z0-9_]{82,}/g,            // GitHub PAT (fine-grained)
  /gho_[A-Za-z0-9]{36,}/g,                    // GitHub OAuth
  /ghs_[A-Za-z0-9]{36,}/g,                    // GitHub App token
  /ghr_[A-Za-z0-9]{36,}/g,                    // GitHub Refresh token
  /sk-[A-Za-z0-9]{20,}/g,                     // OpenAI / generic API keys
  /password=[^\s&"']+/gi,                       // password= in URLs/params
];

function redactSecrets(text: string): string {
  let result = text;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

/**
 * Convert a ChatSession to a readable Markdown string
 */
export function sessionToMarkdown(session: ChatSession, opts: Partial<FormatOptions> = {}): string {
  const options = { ...defaultOptions, ...opts };
  const lines: string[] = [];

  // Title
  const title = getSessionTitle(session);
  lines.push(`# ${title}`);
  lines.push('');

  // Metadata block
  if (options.includeMetadata) {
    lines.push('| Field | Value |');
    lines.push('|-------|-------|');
    lines.push(`| Session ID | \`${session.sessionId}\` |`);
    lines.push(`| Workspace | ${session.workspaceName} |`);
    lines.push(`| Start | ${formatTime(session.startTime)} |`);
    lines.push(`| End | ${formatTime(session.endTime)} |`);
    lines.push(`| Messages | ${session.messages.length} |`);
    if (session.copilotVersion) {
      lines.push(`| Copilot | v${session.copilotVersion} |`);
    }
    if (session.vscodeVersion) {
      lines.push(`| VS Code | v${session.vscodeVersion} |`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Messages
  for (const msg of session.messages) {
    lines.push(formatMessage(msg, options));
    lines.push('');
  }

  return redactSecrets(lines.join('\n'));
}

function formatMessage(msg: ChatMessage, options: FormatOptions): string {
  const lines: string[] = [];
  const time = formatTime(msg.timestamp);
  const icon = msg.role === 'user' ? '👤' : '🤖';
  const label = msg.role === 'user' ? 'User' : 'Copilot';

  lines.push(`### ${icon} ${label} <sub>${time}</sub>`);
  lines.push('');

  if (msg.content) {
    lines.push(msg.content);
  }

  if (options.includeToolCalls && msg.toolCalls && msg.toolCalls.length > 0) {
    lines.push('');
    lines.push('<details><summary>🔧 Tool calls</summary>');
    lines.push('');
    for (const tc of msg.toolCalls) {
      lines.push(`- **${tc.name}**`);
      const args = tc.arguments;
      if (args && Object.keys(args).length > 0) {
        // Show key args only (skip huge content)
        const brief: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(args)) {
          if (typeof v === 'string' && v.length > 200) {
            brief[k] = v.slice(0, 200) + '...';
          } else {
            brief[k] = v;
          }
        }
        lines.push(`  \`\`\`json`);
        lines.push(`  ${JSON.stringify(brief, null, 2).split('\n').join('\n  ')}`);
        lines.push(`  \`\`\``);
      }
    }
    lines.push('</details>');
  }

  return lines.join('\n');
}

/**
 * Derive a human-readable title from the first user message,
 * or fall back to the first assistant message when needed.
 */
export function getSessionTitle(session: ChatSession, maxLength: number = 80): string {
  const preferredMessage = session.messages.find(m => m.role === 'user' && m.content?.trim())
    || session.messages.find(m => m.role === 'assistant' && m.content?.trim());

  if (!preferredMessage?.content) {
    return `Session ${session.sessionId.slice(0, 8)}`;
  }

  const preview = normalizeTitleText(preferredMessage.content);
  if (preview.length <= maxLength) {
    return preview;
  }
  return preview.slice(0, Math.max(maxLength - 3, 1)) + '...';
}

function formatTime(isoString: string): string {
  if (!isoString) { return ''; }
  try {
    const d = new Date(isoString);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: SESSION_TIME_ZONE,
    });
  } catch {
    return isoString;
  }
}

export function getSessionDateKey(isoString: string): string {
  if (!isoString) {
    return 'unknown';
  }

  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return 'unknown';
    }

    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: SESSION_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;

    if (!year || !month || !day) {
      return 'unknown';
    }

    return `${year}-${month}-${day}`;
  } catch {
    return 'unknown';
  }
}

/**
 * Generate a safe filename from session metadata (without date prefix)
 */
export function sessionToFilename(session: ChatSession, format: 'markdown' | 'json' | 'html' = 'markdown'): string {
  const workspace = session.workspaceName.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_');
  const shortId = session.sessionId.slice(0, 8);
  const ext = format === 'json' ? '.json' : format === 'html' ? '.html' : '.md';
  return `${workspace}_${shortId}${ext}`;
}

/**
 * Generate a date-folder relative path: YYYY-MM-DD/workspace_shortid.ext
 */
export function sessionToRelativePath(session: ChatSession, format: 'markdown' | 'json' | 'html' = 'markdown'): string {
  const date = getSessionDateKey(session.startTime);
  return `${date}/${sessionToFilename(session, format)}`;
}

/**
 * Convert a ChatSession to JSON format
 */
export function sessionToJSON(session: ChatSession, opts: Partial<FormatOptions> = {}): string {
  const options = { ...defaultOptions, ...opts };
  const data = {
    sessionId: session.sessionId,
    workspace: session.workspaceName,
    startTime: session.startTime,
    endTime: session.endTime,
    copilotVersion: session.copilotVersion || null,
    vscodeVersion: session.vscodeVersion || null,
    messageCount: session.messages.length,
    messages: session.messages.map(msg => {
      const m: Record<string, unknown> = {
        role: msg.role,
        timestamp: msg.timestamp,
        content: msg.content,
      };
      if (options.includeToolCalls && msg.toolCalls && msg.toolCalls.length > 0) {
        m.toolCalls = msg.toolCalls;
      }
      return m;
    }),
  };
  return redactSecrets(JSON.stringify(data, null, 2));
}

/**
 * Convert a ChatSession to a styled HTML page
 */
export function sessionToHTML(session: ChatSession, opts: Partial<FormatOptions> = {}): string {
  const options = { ...defaultOptions, ...opts };
  const title = escapeHtml(getSessionTitle(session));
  const messages = session.messages.map(msg => {
    const icon = msg.role === 'user' ? '👤' : '🤖';
    const label = msg.role === 'user' ? 'User' : 'Copilot';
    const cssClass = msg.role === 'user' ? 'user' : 'assistant';
    const time = formatTime(msg.timestamp);
    let content = escapeHtml(msg.content || '');
    // Basic code block rendering
    content = content.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    content = content.replace(/\n/g, '<br>');

    let toolHtml = '';
    if (options.includeToolCalls && msg.toolCalls && msg.toolCalls.length > 0) {
      const tools = msg.toolCalls.map(tc =>
        `<li><strong>${escapeHtml(tc.name)}</strong></li>`
      ).join('\n');
      toolHtml = `<details><summary>🔧 Tool calls (${msg.toolCalls.length})</summary><ul>${tools}</ul></details>`;
    }

    return `<div class="message ${cssClass}">
      <div class="header">${icon} <strong>${label}</strong> <span class="time">${time}</span></div>
      <div class="content">${content}</div>
      ${toolHtml}
    </div>`;
  }).join('\n');

  return redactSecrets(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  :root { --bg: #1e1e1e; --fg: #d4d4d4; --user-bg: #264f78; --assistant-bg: #2d2d2d; --border: #404040; }
  @media (prefers-color-scheme: light) {
    :root { --bg: #ffffff; --fg: #1e1e1e; --user-bg: #e3f2fd; --assistant-bg: #f5f5f5; --border: #e0e0e0; }
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--fg); max-width: 900px; margin: 0 auto; padding: 20px; line-height: 1.6; }
  h1 { border-bottom: 2px solid var(--border); padding-bottom: 10px; }
  .meta { opacity: 0.7; font-size: 0.9em; margin-bottom: 20px; }
  .message { margin: 16px 0; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border); }
  .message.user { background: var(--user-bg); }
  .message.assistant { background: var(--assistant-bg); }
  .header { font-size: 0.9em; margin-bottom: 8px; }
  .time { opacity: 0.6; font-size: 0.85em; }
  pre { background: #1a1a2e; color: #e0e0e0; padding: 12px; border-radius: 6px; overflow-x: auto; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.9em; }
  code:not(pre code) { background: rgba(128,128,128,0.2); padding: 2px 6px; border-radius: 3px; }
  details { margin-top: 8px; font-size: 0.9em; }
</style>
</head>
<body>
<h1>${title}</h1>
<div class="meta">
  <strong>Workspace:</strong> ${escapeHtml(session.workspaceName)} &nbsp;|&nbsp;
  <strong>Start:</strong> ${formatTime(session.startTime)} &nbsp;|&nbsp;
  <strong>Messages:</strong> ${session.messages.length}
</div>
${messages}
</body>
</html>`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Extract the first paragraph of text (stops at blank lines, bullets, numbered lists, emoji headers)
 */
function extractFirstParagraph(text: string): string {
  if (!text) { return ''; }
  const lines = text.split('\n');
  const para: string[] = [];
  const emojiHeaderPattern = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  for (let i = 0; i < lines.length; i++) {
    const stripped = lines[i].trim();
    if (i === 0) {
      if (stripped) { para.push(stripped); }
      continue;
    }
    if (
      stripped === '' ||
      /^[-•*#]+/.test(stripped) ||
      /^\d+\./.test(stripped) ||
      emojiHeaderPattern.test(stripped) ||
      stripped.startsWith('```')
    ) {
      break;
    }
    para.push(stripped);
  }
  return para.join(' ');
}

/**
 * Convert a ChatSession to a condensed Q&A archive format
 * Only includes the first paragraph of each Copilot response
 */
export function sessionToQA(session: ChatSession): string {
  const lines: string[] = [];
  const title = getSessionTitle(session);
  lines.push(`# Q&A Archive: ${title}`);
  lines.push(`> Workspace: ${session.workspaceName} | ${formatTime(session.startTime)}`);
  lines.push('');

  // Pair up user/assistant messages
  let chunkNum = 0;
  for (let i = 0; i < session.messages.length; i++) {
    const msg = session.messages[i];
    if (msg.role === 'user' && msg.content) {
      chunkNum++;
      lines.push(`---`);
      lines.push(`### Q${chunkNum}`);
      lines.push(`🧑 **User:**`);
      lines.push(msg.content.trim());
      lines.push('');

      // Find the next assistant message
      const next = session.messages[i + 1];
      if (next && next.role === 'assistant' && next.content) {
        const firstPara = extractFirstParagraph(next.content);
        lines.push(`🤖 **Copilot:**`);
        lines.push(firstPara);
        lines.push('');
        i++; // skip the assistant message
      }
    }
  }

  lines.push(`---`);
  lines.push(`*Total: ${chunkNum} Q&A pairs*`);
  return redactSecrets(lines.join('\n'));
}

/**
 * Split a session into chunks of N Q&A pairs each
 */
export function sessionToChunks(session: ChatSession, pairsPerChunk: number = 5): string[] {
  const chunks: string[] = [];
  const pairs: Array<{ user: string; assistant: string }> = [];

  for (let i = 0; i < session.messages.length; i++) {
    const msg = session.messages[i];
    if (msg.role === 'user' && msg.content) {
      const next = session.messages[i + 1];
      const assistantContent = (next && next.role === 'assistant' && next.content)
        ? extractFirstParagraph(next.content)
        : '(no response)';
      pairs.push({ user: msg.content.trim(), assistant: assistantContent });
      if (next && next.role === 'assistant') { i++; }
    }
  }

  const totalChunks = Math.ceil(pairs.length / pairsPerChunk);
  for (let c = 0; c < totalChunks; c++) {
    const slice = pairs.slice(c * pairsPerChunk, (c + 1) * pairsPerChunk);
    const lines: string[] = [];
    lines.push(`# Chunk ${c + 1} of ${totalChunks} — ${session.workspaceName}`);
    lines.push(`> ${formatTime(session.startTime)}`);
    lines.push('');
    for (let j = 0; j < slice.length; j++) {
      const p = slice[j];
      const globalIdx = c * pairsPerChunk + j + 1;
      lines.push(`### Q${globalIdx}`);
      lines.push(`🧑 User:`);
      lines.push(p.user);
      lines.push('');
      lines.push(`🤖 Copilot:`);
      lines.push(p.assistant);
      lines.push('');
    }
    chunks.push(redactSecrets(lines.join('\n')));
  }
  return chunks;
}

function normalizeTitleText(text: string): string {
  const firstParagraph = extractFirstParagraph(text);
  const normalized = (firstParagraph || text)
    .replace(/\s+/g, ' ')
    .trim();
  return normalized || 'Untitled Session';
}
