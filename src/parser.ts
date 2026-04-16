/**
 * Copilot Chat Sync — Parse Copilot Chat storage files into structured data
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatSession {
  sessionId: string;
  startTime: string;
  endTime: string;
  workspaceName: string;
  workspaceHash: string;
  messages: ChatMessage[];
  copilotVersion?: string;
  vscodeVersion?: string;
}

export interface StoredSessionFile {
  filePath: string;
  workspaceHash: string;
  format: 'legacyTranscript' | 'workspaceSession' | 'emptyWindow';
}

/**
 * Parse a single legacy transcript JSONL file into a ChatSession.
 */
export function parseTranscript(filePath: string, workspaceHash: string): ChatSession | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  let sessionId = '';
  let startTime = '';
  let endTime = '';
  let copilotVersion: string | undefined;
  let vscodeVersion: string | undefined;
  const messages: ChatMessage[] = [];
  let pendingAssistant: { content: string; timestamp: string; toolCalls: ToolCall[] } | null = null;

  for (const line of lines) {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }

    const type = event.type as string;
    const data = event.data as Record<string, unknown> | undefined;
    const timestamp = (event.timestamp as string) || '';

    switch (type) {
      case 'session.start': {
        sessionId = (data?.sessionId as string) || basenameWithoutExt(filePath);
        startTime = timestamp;
        copilotVersion = data?.copilotVersion as string | undefined;
        vscodeVersion = data?.vscodeVersion as string | undefined;
        break;
      }

      case 'user.message': {
        flushPendingAssistant(messages, pendingAssistant);
        pendingAssistant = null;

        const userContent = (data?.content as string) || '';
        if (!userContent.startsWith('[Terminal ')) {
          messages.push({
            role: 'user',
            content: userContent,
            timestamp,
          });
        }
        break;
      }

      case 'assistant.turn_start': {
        flushPendingAssistant(messages, pendingAssistant);
        pendingAssistant = null;
        break;
      }

      case 'assistant.message': {
        const assistantContent = (data?.content as string) || '';
        const toolRequests = asRecordArray(data?.toolRequests);
        const tools: ToolCall[] = toolRequests.map(tr => ({
          name: (tr.name as string) || '',
          arguments: safeParseArgs(tr.arguments),
        }));

        if (!pendingAssistant) {
          pendingAssistant = { content: assistantContent, timestamp, toolCalls: tools };
        } else {
          if (assistantContent) {
            pendingAssistant.content += assistantContent;
          }
          pendingAssistant.toolCalls.push(...tools);
        }
        break;
      }

      case 'assistant.turn_end': {
        endTime = timestamp;
        flushPendingAssistant(messages, pendingAssistant);
        pendingAssistant = null;
        break;
      }
    }
  }

  flushPendingAssistant(messages, pendingAssistant);

  if (messages.length === 0) {
    return null;
  }

  return {
    sessionId: sessionId || basenameWithoutExt(filePath),
    startTime: startTime || messages[0]?.timestamp || '',
    endTime: endTime || messages[messages.length - 1]?.timestamp || '',
    workspaceName: resolveWorkspaceName(workspaceHash),
    workspaceHash,
    messages,
    copilotVersion,
    vscodeVersion,
  };
}

/**
 * Parse a workspace chatSessions file (.json or .jsonl) into a ChatSession.
 */
export function parseWorkspaceChatSession(filePath: string, workspaceHash: string): ChatSession | null {
  const state = readStoredSessionState(filePath);
  if (!state) {
    return null;
  }

  return parseStoredSessionState(state, {
    filePath,
    workspaceHash,
    workspaceName: resolveWorkspaceName(workspaceHash),
  });
}

/**
 * Parse an empty-window chat session file (.json or .jsonl) into a ChatSession.
 */
export function parseEmptyWindowSession(filePath: string): ChatSession | null {
  const state = readStoredSessionState(filePath);
  if (!state) {
    return null;
  }

  return parseStoredSessionState(state, {
    filePath,
    workspaceHash: 'emptyWindow',
    workspaceName: '(no workspace)',
  });
}

export function parseStoredSession(file: StoredSessionFile): ChatSession | null {
  switch (file.format) {
    case 'workspaceSession':
      return parseWorkspaceChatSession(file.filePath, file.workspaceHash);
    case 'emptyWindow':
      return parseEmptyWindowSession(file.filePath);
    default:
      return parseTranscript(file.filePath, file.workspaceHash);
  }
}

function parseStoredSessionState(
  state: Record<string, unknown>,
  options: { filePath: string; workspaceHash: string; workspaceName: string },
): ChatSession | null {
  const sessionId = (state.sessionId as string) || basenameWithoutExt(options.filePath);
  const customTitle = ((state.customTitle as string) || '').trim();
  const requests = asRecordArray(state.requests);
  const messages: ChatMessage[] = [];

  const startTime = toIsoTimestamp(state.creationDate);
  let endTime = toIsoTimestamp(state.lastMessageDate) || startTime;

  for (const request of requests) {
    const timestamp = toIsoTimestamp(request.timestamp) || startTime;
    const userText = extractUserText(request.message as Record<string, unknown> | undefined);

    if (userText && !userText.startsWith('[Terminal ')) {
      messages.push({
        role: 'user',
        content: userText,
        timestamp,
      });
    }

    const { content, toolCalls } = extractAssistantResponse(request.response);
    if (content || toolCalls.length > 0) {
      messages.push({
        role: 'assistant',
        content,
        timestamp,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      });

      if (timestamp) {
        endTime = timestamp;
      }
    }
  }

  if (messages.length === 0) {
    return null;
  }

  const workspaceName = options.workspaceHash === 'emptyWindow'
    ? (customTitle || options.workspaceName)
    : options.workspaceName;

  return {
    sessionId,
    startTime: startTime || messages[0]?.timestamp || '',
    endTime: endTime || messages[messages.length - 1]?.timestamp || '',
    workspaceName,
    workspaceHash: options.workspaceHash,
    messages,
  };
}

function extractUserText(message: Record<string, unknown> | undefined): string {
  if (!message) {
    return '';
  }

  const directText = message.text;
  if (typeof directText === 'string' && directText.trim()) {
    return directText;
  }

  const parts = asRecordArray(message.parts);
  const textParts = parts
    .map(part => (typeof part.text === 'string' ? part.text : ''))
    .filter(Boolean);

  return textParts.join('\n').trim();
}

function extractAssistantResponse(response: unknown): { content: string; toolCalls: ToolCall[] } {
  const parts = asRecordArray(response);
  let content = '';
  const toolCalls: ToolCall[] = [];

  for (const part of parts) {
    const text = extractAssistantTextPart(part);
    if (text) {
      content = appendTextBlock(content, text);
    }

    if ((part.kind as string | undefined) === 'toolInvocationSerialized') {
      const name =
        (part.toolId as string) ||
        (part.toolName as string) ||
        (part.invocationMessage as string) ||
        'toolInvocation';

      toolCalls.push({
        name,
        arguments: {},
      });
    }
  }

  return {
    content: content.trim(),
    toolCalls,
  };
}

function extractAssistantTextPart(part: Record<string, unknown>): string {
  const kind = part.kind as string | undefined;

  if (!kind && typeof part.value === 'string') {
    return part.value;
  }

  if (kind === 'markdownContent') {
    const content = part.content as Record<string, unknown> | undefined;
    return typeof content?.value === 'string' ? content.value : '';
  }

  if (kind === 'questionCarousel') {
    return formatQuestionCarousel(part);
  }

  return '';
}

function formatQuestionCarousel(part: Record<string, unknown>): string {
  const questions = asRecordArray(part.questions);
  const lines: string[] = [];

  for (const question of questions) {
    const prompt =
      (question.message as string) ||
      (question.title as string) ||
      '';

    if (prompt) {
      lines.push(prompt);
    }
  }

  const data = part.data as Record<string, unknown> | undefined;
  if (data) {
    for (const answer of Object.values(data)) {
      if (typeof answer !== 'object' || answer === null) {
        continue;
      }

      const selectedValue = (answer as Record<string, unknown>).selectedValue;
      if (typeof selectedValue === 'string' && selectedValue.trim()) {
        lines.push(`Selected: ${selectedValue}`);
      }
    }
  }

  return lines.join('\n').trim();
}

function appendTextBlock(existing: string, addition: string): string {
  const trimmed = addition.trim();
  if (!trimmed) {
    return existing;
  }
  if (!existing) {
    return trimmed;
  }
  return `${existing}\n\n${trimmed}`;
}

function flushPendingAssistant(
  messages: ChatMessage[],
  pendingAssistant: { content: string; timestamp: string; toolCalls: ToolCall[] } | null,
): void {
  if (!pendingAssistant) {
    return;
  }

  messages.push({
    role: 'assistant',
    content: pendingAssistant.content,
    timestamp: pendingAssistant.timestamp,
    toolCalls: pendingAssistant.toolCalls.length > 0 ? pendingAssistant.toolCalls : undefined,
  });
}

function safeParseArgs(args: unknown): Record<string, unknown> {
  if (typeof args === 'string') {
    try {
      return JSON.parse(args);
    } catch {
      return { raw: args };
    }
  }

  if (typeof args === 'object' && args !== null) {
    return args as Record<string, unknown>;
  }

  return {};
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is Record<string, unknown> => (
    typeof entry === 'object' && entry !== null
  ));
}

function basenameWithoutExt(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

function toIsoTimestamp(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  if (/^\d+$/.test(value)) {
    return new Date(Number(value)).toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
}

/**
 * Try to resolve workspace name from the workspace.json in storage.
 */
function resolveWorkspaceName(workspaceHash: string): string {
  const basePath = getWorkspaceStorageBase();
  const wsJsonPath = path.join(basePath, workspaceHash, 'workspace.json');

  try {
    const wsData = JSON.parse(fs.readFileSync(wsJsonPath, 'utf-8'));
    const folder = wsData.folder as string | undefined;
    if (folder) {
      const decoded = decodeURIComponent(folder.replace('file://', ''));
      return path.basename(decoded);
    }
  } catch {
    // ignore
  }

  return workspaceHash.slice(0, 8);
}

/**
 * Get the base workspace storage path for the current platform.
 */
export function getWorkspaceStorageBase(): string {
  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'workspaceStorage');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'Code', 'User', 'workspaceStorage');
  } else {
    return path.join(home, '.config', 'Code', 'User', 'workspaceStorage');
  }
}

/**
 * Get the globalStorage base path for empty-window sessions.
 */
export function getGlobalStorageBase(): string {
  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'globalStorage');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'Code', 'User', 'globalStorage');
  } else {
    return path.join(home, '.config', 'Code', 'User', 'globalStorage');
  }
}

/**
 * Reconstruct state from VS Code's incremental JSONL format.
 * kind=0: full init, kind=1: set at path, kind=2: push/extend array at path.
 */
function reconstructState(lines: string[]): Record<string, unknown> | null {
  let state: Record<string, unknown> = {};

  for (const line of lines) {
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }

    const kind = obj.kind as number;
    const k = (obj.k as Array<string | number>) || [];
    const v = obj.v;

    if (kind === 0) {
      state = (v as Record<string, unknown>) || {};
      continue;
    }

    if (kind === 1) {
      let target: unknown = state;
      for (const key of k.slice(0, -1)) {
        if (Array.isArray(target)) {
          target = target[Number(key)];
        } else if (typeof target === 'object' && target !== null) {
          target = (target as Record<string, unknown>)[String(key)];
        }
      }

      const lastKey = k[k.length - 1];
      if (Array.isArray(target)) {
        target[Number(lastKey)] = v;
      } else if (typeof target === 'object' && target !== null) {
        (target as Record<string, unknown>)[String(lastKey)] = v;
      }
      continue;
    }

    if (kind === 2) {
      let target: unknown = state;
      for (const key of k) {
        if (Array.isArray(target)) {
          target = target[Number(key)];
        } else if (typeof target === 'object' && target !== null) {
          target = (target as Record<string, unknown>)[String(key)];
        }
      }

      if (Array.isArray(target) && Array.isArray(v)) {
        target.push(...v);
      }
    }
  }

  return state;
}

function readStoredSessionState(filePath: string): Record<string, unknown> | null {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');

  if (ext === '.json') {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  const lines = content.split('\n').filter(line => line.trim());
  return reconstructState(lines);
}

function safeMtimeMs(filePath: string): number {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function registerSessionFile(
  results: Map<string, { file: StoredSessionFile; priority: number; mtimeMs: number }>,
  file: StoredSessionFile,
  priority: number,
): void {
  const sessionId = basenameWithoutExt(file.filePath);
  const key = `${file.workspaceHash}:${sessionId}`;
  const mtimeMs = safeMtimeMs(file.filePath);
  const existing = results.get(key);

  if (
    !existing ||
    priority > existing.priority ||
    (priority === existing.priority && mtimeMs > existing.mtimeMs)
  ) {
    results.set(key, { file, priority, mtimeMs });
  }
}

function getSessionFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs.readdirSync(dirPath)
    .filter(fileName => fileName.endsWith('.json') || fileName.endsWith('.jsonl'))
    .map(fileName => path.join(dirPath, fileName));
}

/**
 * Find all chat session sources across workspaces.
 * Prefer modern chatSessions files over legacy transcripts when both exist.
 */
export function findAllTranscripts(): StoredSessionFile[] {
  const results = new Map<string, { file: StoredSessionFile; priority: number; mtimeMs: number }>();
  const workspaceBase = getWorkspaceStorageBase();

  if (fs.existsSync(workspaceBase)) {
    const entries = fs.readdirSync(workspaceBase, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const workspaceHash = entry.name;

      const chatSessionsDir = path.join(workspaceBase, workspaceHash, 'chatSessions');
      for (const filePath of getSessionFiles(chatSessionsDir)) {
        registerSessionFile(results, {
          filePath,
          workspaceHash,
          format: 'workspaceSession',
        }, 3);
      }

      const transcriptDir = path.join(workspaceBase, workspaceHash, 'GitHub.copilot-chat', 'transcripts');
      for (const filePath of getSessionFiles(transcriptDir).filter(item => item.endsWith('.jsonl'))) {
        registerSessionFile(results, {
          filePath,
          workspaceHash,
          format: 'legacyTranscript',
        }, 4);
      }
    }
  }

  const globalBase = getGlobalStorageBase();
  const emptyDir = path.join(globalBase, 'emptyWindowChatSessions');
  for (const filePath of getSessionFiles(emptyDir)) {
    registerSessionFile(results, {
      filePath,
      workspaceHash: 'emptyWindow',
      format: 'emptyWindow',
    }, 3);
  }

  return Array.from(results.values())
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .map(item => item.file);
}
