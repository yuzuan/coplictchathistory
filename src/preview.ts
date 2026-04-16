/**
 * Copilot Chat Sync — Webview preview panel for chat sessions
 */

import * as vscode from 'vscode';
import { ChatSession } from './parser';
import { sessionToHTML, getSessionTitle } from './formatter';

const panels = new Map<string, vscode.WebviewPanel>();

export function showPreview(session: ChatSession, context: vscode.ExtensionContext): void {
  const key = session.sessionId;

  // Reuse existing panel if open
  const existing = panels.get(key);
  if (existing) {
    existing.reveal();
    return;
  }

  const title = getSessionTitle(session, 40);
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
