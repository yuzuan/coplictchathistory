/**
 * Copilot Chat Sync — Convert ChatSession to Markdown
 */

import { ChatSession, ChatMessage } from './parser';

export interface FormatOptions {
  includeToolCalls: boolean;
  includeMetadata: boolean;
}

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
  const title = deriveTitle(session);
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
 * Derive a human-readable title from the first user message
 */
function deriveTitle(session: ChatSession): string {
  const firstUser = session.messages.find(m => m.role === 'user');
  if (firstUser?.content) {
    const preview = firstUser.content.replace(/\n/g, ' ').trim();
    if (preview.length <= 80) {
      return preview;
    }
    return preview.slice(0, 77) + '...';
  }
  return `Chat Session ${session.sessionId.slice(0, 8)}`;
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
      timeZone: 'Asia/Shanghai',
    });
  } catch {
    return isoString;
  }
}

/**
 * Generate a safe filename from session metadata (without date prefix)
 */
export function sessionToFilename(session: ChatSession): string {
  const workspace = session.workspaceName.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_');
  const shortId = session.sessionId.slice(0, 8);
  return `${workspace}_${shortId}.md`;
}

/**
 * Generate a date-folder relative path: YYYY-MM-DD/workspace_shortid.md
 */
export function sessionToRelativePath(session: ChatSession): string {
  const date = session.startTime
    ? new Date(session.startTime).toISOString().slice(0, 10)
    : 'unknown';
  return `${date}/${sessionToFilename(session)}`;
}
