/**
 * Copilot Chat Sync — Import chat sessions from saved HTML (DevTools method)
 *
 * Supports HTML saved via F12 → Elements → Copy outerHTML from VS Code Copilot Chat.
 * Parses user-message and ai-message divs to reconstruct conversation.
 */

import { ChatSession, ChatMessage } from './parser';

/**
 * Parse a saved Copilot Chat HTML file into a ChatSession.
 * Looks for divs with data-content="user-message" and data-content="ai-message".
 */
export function parseHtmlTranscript(html: string, filename: string): ChatSession | null {
  const session: ChatSession = {
    sessionId: `html-import-${hashCode(filename)}`,
    workspaceName: 'HTML Import',
    workspaceHash: hashCode(filename),
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    messages: [],
  };

  // Strategy 1: data-content attributes (VS Code Copilot Chat panel)
  let messages = parseByDataContent(html);

  // Strategy 2: role-based class names
  if (messages.length === 0) {
    messages = parseByRoleClasses(html);
  }

  // Strategy 3: emoji-based text parsing (fallback for plain text with 🧑/🤖 markers)
  if (messages.length === 0) {
    messages = parseByEmojiMarkers(html);
  }

  if (messages.length === 0) {
    return null;
  }

  session.messages = messages;
  if (messages.length > 0) {
    session.startTime = messages[0].timestamp || session.startTime;
    session.endTime = messages[messages.length - 1].timestamp || session.endTime;
  }

  return session;
}

function parseByDataContent(html: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  // Match user-message and ai-message divs
  const userPattern = /data-content=["']user-message["'][^>]*>([\s\S]*?)(?=<div[^>]*data-content=["'](?:ai-message|user-message)["']|$)/gi;
  const aiPattern = /data-content=["']ai-message["'][^>]*>([\s\S]*?)(?=<div[^>]*data-content=["'](?:user-message|ai-message)["']|$)/gi;

  // Collect all messages in document order
  const allMatches: Array<{ role: 'user' | 'assistant'; content: string; index: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = userPattern.exec(html)) !== null) {
    allMatches.push({ role: 'user', content: stripHtml(match[1]), index: match.index });
  }
  while ((match = aiPattern.exec(html)) !== null) {
    allMatches.push({ role: 'assistant', content: stripHtml(match[1]), index: match.index });
  }

  allMatches.sort((a, b) => a.index - b.index);

  const now = new Date();
  for (let i = 0; i < allMatches.length; i++) {
    const m = allMatches[i];
    if (m.content.trim()) {
      messages.push({
        role: m.role,
        timestamp: new Date(now.getTime() + i * 1000).toISOString(),
        content: m.content.trim(),
      });
    }
  }

  return messages;
}

function parseByRoleClasses(html: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  // Look for common chat UI patterns
  const pattern = /<div[^>]*class=["'][^"']*\b(user|human|assistant|copilot|ai|bot)\b[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]*class=["'][^"']*\b(?:user|human|assistant|copilot|ai|bot)\b|$)/gi;

  const now = new Date();
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(html)) !== null) {
    const roleHint = match[1].toLowerCase();
    const role: 'user' | 'assistant' = ['user', 'human'].includes(roleHint) ? 'user' : 'assistant';
    const content = stripHtml(match[2]).trim();
    if (content) {
      messages.push({
        role,
        timestamp: new Date(now.getTime() + i * 1000).toISOString(),
        content,
      });
      i++;
    }
  }

  return messages;
}

function parseByEmojiMarkers(html: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const text = stripHtml(html);
  // Split by emoji role markers
  const parts = text.split(/(?=🧑|🤖)/);
  const now = new Date();

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) { continue; }

    let role: 'user' | 'assistant';
    let content: string;
    if (part.startsWith('🧑')) {
      role = 'user';
      content = part.replace(/^🧑\s*[^:]*:\s*/, '').trim();
    } else if (part.startsWith('🤖')) {
      role = 'assistant';
      content = part.replace(/^🤖\s*[^:]*:\s*/, '').trim();
    } else {
      continue;
    }

    if (content) {
      messages.push({
        role,
        timestamp: new Date(now.getTime() + i * 1000).toISOString(),
        content,
      });
    }
  }

  return messages;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function hashCode(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
