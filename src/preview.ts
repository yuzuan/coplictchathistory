/**
 * Copilot Chat Sync — Webview preview panel for chat sessions
 */

import * as vscode from 'vscode';
import { ChatSession } from './parser';
import { sessionToHTML } from './formatter';

const panels = new Map<string, vscode.WebviewPanel>();

export function showPreview(session: ChatSession, context: vscode.ExtensionContext): void {
  const key = session.sessionId;

  // Reuse existing panel if open
  const existing = panels.get(key);
  if (existing) {
    existing.reveal();
    return;
  }

  const title = deriveShortTitle(session);
  const panel = vscode.window.createWebviewPanel(
    'copilotChatSync.preview',
    `💬 ${title}`,
    vscode.ViewColumn.One,
    { enableScripts: false },
  );

  panel.webview.html = sessionToHTML(session, { includeToolCalls: true, includeMetadata: true });

  panels.set(key, panel);
  panel.onDidDispose(() => panels.delete(key));
}

function deriveShortTitle(session: ChatSession): string {
  const firstUser = session.messages.find(m => m.role === 'user');
  if (firstUser?.content) {
    const preview = firstUser.content.replace(/\n/g, ' ').trim();
    return preview.length <= 40 ? preview : preview.slice(0, 37) + '...';
  }
  return `Session ${session.sessionId.slice(0, 8)}`;
}
