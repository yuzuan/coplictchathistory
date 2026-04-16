/**
 * Copilot Chat Sync — Sidebar Tree View for browsing chat sessions
 */

import * as vscode from 'vscode';
import { findAllTranscripts, parseStoredSession, ChatSession } from './parser';

export class SessionTreeProvider implements vscode.TreeDataProvider<SessionTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SessionTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private sessions: ChatSession[] = [];

  refresh(): void {
    this.sessions = [];
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SessionTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SessionTreeItem): SessionTreeItem[] {
    if (!element) {
      // Root level: date groups
      this.loadSessions();
      return this.getDateGroups();
    }

    if (element.contextValue === 'dateGroup') {
      // Date group: show sessions for that date
      return this.getSessionsForDate(element.label as string);
    }

    return [];
  }

  private loadSessions(): void {
    if (this.sessions.length > 0) { return; }

    const maxSessions = vscode.workspace.getConfiguration('copilotChatSync').get('maxSessionsInView', 100);
    const sessionFiles = findAllTranscripts();

    for (const sessionFile of sessionFiles) {
      const session = parseStoredSession(sessionFile);
      if (session && session.messages.length > 0) {
        this.sessions.push(session);
      }
    }

    // Sort by start time descending (newest first)
    this.sessions.sort((a, b) => {
      const ta = a.startTime ? new Date(a.startTime).getTime() : 0;
      const tb = b.startTime ? new Date(b.startTime).getTime() : 0;
      return tb - ta;
    });

    // Limit
    if (this.sessions.length > maxSessions) {
      this.sessions = this.sessions.slice(0, maxSessions);
    }
  }

  private getDateGroups(): SessionTreeItem[] {
    const dateMap = new Map<string, number>();
    for (const s of this.sessions) {
      const date = s.startTime
        ? new Date(s.startTime).toISOString().slice(0, 10)
        : 'unknown';
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }

    const dates = Array.from(dateMap.keys()).sort(compareDateDesc);
    return dates.map(date => {
      const count = dateMap.get(date) || 0;
      const item = new SessionTreeItem(
        date,
        vscode.TreeItemCollapsibleState.Expanded,
      );
      item.contextValue = 'dateGroup';
      item.description = `${count} session${count > 1 ? 's' : ''}`;
      item.iconPath = new vscode.ThemeIcon('calendar');
      return item;
    });
  }

  private getSessionsForDate(date: string): SessionTreeItem[] {
    return this.sessions
      .filter(s => {
        const d = s.startTime
          ? new Date(s.startTime).toISOString().slice(0, 10)
          : 'unknown';
        return d === date;
      })
      .map(s => {
        const title = this.deriveTitle(s);
        const item = new SessionTreeItem(
          title,
          vscode.TreeItemCollapsibleState.None,
        );
        item.contextValue = 'session';
        item.description = `${s.workspaceName} · ${s.messages.length} msgs`;
        item.iconPath = new vscode.ThemeIcon('comment-discussion');
        item.tooltip = new vscode.MarkdownString(
          `**${title}**\n\n` +
          `- Workspace: ${s.workspaceName}\n` +
          `- Messages: ${s.messages.length}\n` +
          `- Start: ${this.formatTime(s.startTime)}\n` +
          `- Session: \`${s.sessionId.slice(0, 8)}\``
        );
        item.command = {
          command: 'copilotChatSync.previewSession',
          title: 'Preview',
          arguments: [s],
        };
        return item;
      });
  }

  private deriveTitle(session: ChatSession): string {
    const firstUser = session.messages.find(m => m.role === 'user');
    if (firstUser?.content) {
      const preview = firstUser.content.replace(/\n/g, ' ').trim();
      return preview.length <= 60 ? preview : preview.slice(0, 57) + '...';
    }
    return `Session ${session.sessionId.slice(0, 8)}`;
  }

  private formatTime(iso: string): string {
    if (!iso) { return ''; }
    try {
      return new Date(iso).toLocaleString('zh-CN', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Shanghai',
      });
    } catch { return iso; }
  }

  /** Get all loaded sessions (for search) */
  getSessions(): ChatSession[] {
    this.loadSessions();
    return this.sessions;
  }
}

function compareDateDesc(a: string, b: string): number {
  if (a === 'unknown') { return 1; }
  if (b === 'unknown') { return -1; }
  return b.localeCompare(a);
}

export class SessionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }
}
