/**
 * Copilot Chat Sync — Parse Copilot Chat transcript JSONL files into structured data
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

/**
 * Parse a single JSONL transcript file into a ChatSession
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

  // First pass: collect tool execution info for enrichment
  const toolExecutions = new Map<string, { name: string; args: Record<string, unknown> }>();

  for (const line of lines) {
    let event: Record<string, unknown>;
    try { event = JSON.parse(line); } catch { continue; }
    const type = event.type as string;
    const data = event.data as Record<string, unknown> | undefined;
    if (type === 'tool.execution_start' && data) {
      const toolCallId = data.toolCallId as string;
      if (toolCallId) {
        toolExecutions.set(toolCallId, {
          name: (data.toolName as string) || '',
          args: safeParseArgs(data.arguments),
        });
      }
    }
  }

  // Second pass: build messages
  let turnCount = 0;

  for (const line of lines) {
    let event: Record<string, unknown>;
    try { event = JSON.parse(line); } catch { continue; }

    const type = event.type as string;
    const data = event.data as Record<string, unknown> | undefined;
    const timestamp = (event.timestamp as string) || '';

    switch (type) {
      case 'session.start': {
        sessionId = (data?.sessionId as string) || path.basename(filePath, '.jsonl');
        startTime = timestamp;
        copilotVersion = data?.copilotVersion as string | undefined;
        vscodeVersion = data?.vscodeVersion as string | undefined;
        break;
      }

      case 'user.message': {
        // Flush pending assistant message
        if (pendingAssistant) {
          messages.push({
            role: 'assistant',
            content: pendingAssistant.content,
            timestamp: pendingAssistant.timestamp,
            toolCalls: pendingAssistant.toolCalls.length > 0 ? pendingAssistant.toolCalls : undefined,
          });
          pendingAssistant = null;
        }

        const userContent = (data?.content as string) || '';
        // Skip terminal notification auto-messages
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
        turnCount++;
        // Flush previous assistant if exists
        if (pendingAssistant) {
          messages.push({
            role: 'assistant',
            content: pendingAssistant.content,
            timestamp: pendingAssistant.timestamp,
            toolCalls: pendingAssistant.toolCalls.length > 0 ? pendingAssistant.toolCalls : undefined,
          });
          pendingAssistant = null;
        }
        break;
      }

      case 'assistant.message': {
        const assistantContent = (data?.content as string) || '';
        const toolRequests = (data?.toolRequests as Array<Record<string, unknown>>) || [];
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
        if (pendingAssistant) {
          messages.push({
            role: 'assistant',
            content: pendingAssistant.content,
            timestamp: pendingAssistant.timestamp,
            toolCalls: pendingAssistant.toolCalls.length > 0 ? pendingAssistant.toolCalls : undefined,
          });
          pendingAssistant = null;
        }
        break;
      }
    }
  }

  // Flush any remaining assistant message
  if (pendingAssistant) {
    messages.push({
      role: 'assistant',
      content: pendingAssistant.content,
      timestamp: pendingAssistant.timestamp,
      toolCalls: pendingAssistant.toolCalls.length > 0 ? pendingAssistant.toolCalls : undefined,
    });
  }

  if (messages.length === 0) {
    return null;
  }

  // Derive workspace name from path
  const workspaceName = resolveWorkspaceName(workspaceHash);

  return {
    sessionId: sessionId || path.basename(filePath, '.jsonl'),
    startTime: startTime || messages[0]?.timestamp || '',
    endTime: endTime || messages[messages.length - 1]?.timestamp || '',
    workspaceName,
    workspaceHash,
    messages,
    copilotVersion,
    vscodeVersion,
  };
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

/**
 * Try to resolve workspace name from the workspace.json in storage
 */
function resolveWorkspaceName(workspaceHash: string): string {
  const basePath = getWorkspaceStorageBase();
  const wsJsonPath = path.join(basePath, workspaceHash, 'workspace.json');

  try {
    const wsData = JSON.parse(fs.readFileSync(wsJsonPath, 'utf-8'));
    const folder = wsData.folder as string | undefined;
    if (folder) {
      // file:///path/to/folder -> folder name
      const decoded = decodeURIComponent(folder.replace('file://', ''));
      return path.basename(decoded);
    }
  } catch {
    // ignore
  }
  return workspaceHash.slice(0, 8);
}

/**
 * Get the base workspace storage path for the current platform
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
 * Find all transcript JSONL files across all workspaces
 */
export function findAllTranscripts(): Array<{ filePath: string; workspaceHash: string }> {
  const base = getWorkspaceStorageBase();
  const results: Array<{ filePath: string; workspaceHash: string }> = [];

  if (!fs.existsSync(base)) {
    return results;
  }

  const entries = fs.readdirSync(base, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) { continue; }
    const transcriptDir = path.join(base, entry.name, 'GitHub.copilot-chat', 'transcripts');
    if (!fs.existsSync(transcriptDir)) { continue; }

    const jsonlFiles = fs.readdirSync(transcriptDir).filter(f => f.endsWith('.jsonl'));
    for (const jsonlFile of jsonlFiles) {
      results.push({
        filePath: path.join(transcriptDir, jsonlFile),
        workspaceHash: entry.name,
      });
    }
  }

  return results;
}
