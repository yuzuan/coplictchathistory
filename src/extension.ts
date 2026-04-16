/**
 * Copilot Chat Sync — VS Code Extension Entry Point
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { findAllTranscripts, parseTranscript, getWorkspaceStorageBase } from './parser';
import { sessionToMarkdown, sessionToFilename, sessionToRelativePath } from './formatter';
import { ensureRepo, commitAndPush, GitConfig } from './git';

let syncTimer: ReturnType<typeof setInterval> | undefined;
let fileWatcher: vscode.FileSystemWatcher | undefined;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Copilot Chat Sync');
  log('Extension activated');

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('copilotChatSync.syncNow', () => syncNow()),
    vscode.commands.registerCommand('copilotChatSync.exportAll', () => exportAll()),
    vscode.commands.registerCommand('copilotChatSync.configure', () => configure()),
  );

  // Start auto-sync if configured
  const config = getConfig();
  if (config.autoSync && config.repoPath) {
    startAutoSync(config);
  }

  // Watch for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('copilotChatSync')) {
        restartAutoSync();
      }
    })
  );

  // Set up file watcher on transcript directories
  setupFileWatcher(context);
}

export function deactivate() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = undefined;
  }
}

// --- Config ---

interface ExtConfig {
  repoPath: string;
  remoteUrl: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  includeToolCalls: boolean;
}

function getConfig(): ExtConfig {
  const c = vscode.workspace.getConfiguration('copilotChatSync');
  return {
    repoPath: c.get('repoPath', ''),
    remoteUrl: c.get('remoteUrl', ''),
    autoSync: c.get('autoSync', true),
    syncIntervalMinutes: c.get('syncIntervalMinutes', 5),
    includeToolCalls: c.get('includeToolCalls', false),
  };
}

// --- Commands ---

async function syncNow() {
  const config = getConfig();

  if (!config.repoPath) {
    const choice = await vscode.window.showWarningMessage(
      'Copilot Chat Sync: No repository path configured.',
      'Configure Now'
    );
    if (choice === 'Configure Now') {
      await configure();
    }
    return;
  }

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Syncing Copilot Chat History...' },
    async () => {
      try {
        await doSync(config);
        vscode.window.showInformationMessage('Copilot Chat Sync: Sync complete!');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Copilot Chat Sync: ${msg}`);
        log(`Sync error: ${msg}`);
      }
    }
  );
}

async function exportAll() {
  const folder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: 'Select Export Directory',
  });
  if (!folder || folder.length === 0) { return; }

  const config = getConfig();
  const exportDir = folder[0].fsPath;
  const transcripts = findAllTranscripts();
  let count = 0;

  for (const t of transcripts) {
    const session = parseTranscript(t.filePath, t.workspaceHash);
    if (!session) { continue; }

    const markdown = sessionToMarkdown(session, { includeToolCalls: config.includeToolCalls });
    const relPath = sessionToRelativePath(session);
    const outPath = path.join(exportDir, relPath);
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(outPath, markdown, 'utf-8');
    count++;
  }

  vscode.window.showInformationMessage(`Exported ${count} chat sessions to ${exportDir}`);
}

async function configure() {
  const config = getConfig();

  // Step 1: Remote URL
  const remoteUrl = await vscode.window.showInputBox({
    prompt: 'GitHub repository URL',
    value: config.remoteUrl || 'https://github.com/yuzuan/coplictchathistory.git',
    placeHolder: 'https://github.com/user/repo.git',
  });
  if (remoteUrl === undefined) { return; }

  // Step 2: Local repo path
  const defaultPath = path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    '.copilot-chat-sync'
  );
  const repoPath = await vscode.window.showInputBox({
    prompt: 'Local directory for syncing (will be created if not exists)',
    value: config.repoPath || defaultPath,
  });
  if (repoPath === undefined) { return; }

  // Save settings
  const wsConfig = vscode.workspace.getConfiguration('copilotChatSync');
  await wsConfig.update('remoteUrl', remoteUrl, vscode.ConfigurationTarget.Global);
  await wsConfig.update('repoPath', repoPath, vscode.ConfigurationTarget.Global);

  // Initialize repo
  try {
    await ensureRepo({ repoPath, remoteUrl });
    vscode.window.showInformationMessage('Copilot Chat Sync: Repository configured successfully!');
    restartAutoSync();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Failed to initialize repo: ${msg}`);
  }
}

// --- Core Sync Logic ---

async function doSync(config: ExtConfig) {
  const gitConfig: GitConfig = {
    repoPath: config.repoPath,
    remoteUrl: config.remoteUrl,
  };
  await ensureRepo(gitConfig);

  const transcripts = findAllTranscripts();
  const files: Array<{ relativePath: string; content: string }> = [];

  // Track which sessions we already have
  const sessionsDir = path.join(config.repoPath, 'sessions');
  const existingFiles = new Set<string>();
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) {
      existingFiles.add(f);
    }
  }

  for (const t of transcripts) {
    const session = parseTranscript(t.filePath, t.workspaceHash);
    if (!session || session.messages.length === 0) { continue; }

    const relPath = sessionToRelativePath(session);
    const markdown = sessionToMarkdown(session, { includeToolCalls: config.includeToolCalls });

    // Always update (content may have changed for active sessions)
    files.push({
      relativePath: path.join('sessions', relPath),
      content: markdown,
    });
  }

  if (files.length === 0) {
    log('No sessions to sync');
    return;
  }

  // Generate index
  files.push({
    relativePath: 'README.md',
    content: generateIndex(files),
  });

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const result = await commitAndPush(
    config.repoPath,
    files,
    `sync: ${files.length - 1} sessions @ ${now}`
  );

  if (result.committed) {
    log(`Committed ${files.length - 1} sessions`);
  }
  if (result.pushed) {
    log('Pushed to remote');
  } else if (result.error) {
    log(`Push failed: ${result.error}`);
  }
}

function generateIndex(files: Array<{ relativePath: string; content: string }>): string {
  const lines: string[] = [];
  lines.push('# Copilot Chat History');
  lines.push('');
  lines.push(`> Auto-synced by [copilot-chat-sync](https://github.com/yuzuan/coplictchathistory)`);
  lines.push(`> Last updated: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  lines.push('');
  lines.push('## Sessions');
  lines.push('');
  lines.push('| Date | Workspace | File |');
  lines.push('|------|-----------|------|');

  const sessionFiles = files
    .filter(f => f.relativePath.startsWith('sessions/'))
    .sort((a, b) => b.relativePath.localeCompare(a.relativePath));

  for (const f of sessionFiles) {
    const name = path.basename(f.relativePath, '.md');
    const parts = name.split('_');
    const date = parts[0] || '';
    const workspace = parts.slice(1, -1).join('_') || '';
    lines.push(`| ${date} | ${workspace} | [${name}](${f.relativePath}) |`);
  }

  return lines.join('\n');
}

// --- Auto Sync ---

function startAutoSync(config: ExtConfig) {
  if (syncTimer) {
    clearInterval(syncTimer);
  }

  const intervalMs = Math.max(config.syncIntervalMinutes, 1) * 60 * 1000;
  log(`Auto-sync started: every ${config.syncIntervalMinutes} minutes`);

  syncTimer = setInterval(async () => {
    try {
      await doSync(config);
    } catch (err) {
      log(`Auto-sync error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, intervalMs);
}

function restartAutoSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = undefined;
  }

  const config = getConfig();
  if (config.autoSync && config.repoPath) {
    startAutoSync(config);
  }
}

function setupFileWatcher(context: vscode.ExtensionContext) {
  const base = getWorkspaceStorageBase();
  const pattern = new vscode.RelativePattern(
    vscode.Uri.file(base),
    '**/GitHub.copilot-chat/transcripts/*.jsonl'
  );

  fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
  fileWatcher.onDidChange(() => {
    const config = getConfig();
    if (config.autoSync && config.repoPath) {
      // Debounce: sync after a short delay
      log('Transcript changed, scheduling sync...');
    }
  });

  context.subscriptions.push(fileWatcher);
}

function log(msg: string) {
  const ts = new Date().toLocaleTimeString('zh-CN');
  outputChannel.appendLine(`[${ts}] ${msg}`);
}
