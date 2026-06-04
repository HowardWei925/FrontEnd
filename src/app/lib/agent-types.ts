export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: ToolResult;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
}

export interface CWEResult {
  cweId: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  affectedFunctions: string[];
  recommendations: string[];
}

export interface SecurityAuditResult {
  overallRisk: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  findings: AuditFinding[];
  summary: string;
}

export interface AuditFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  description: string;
  recommendation: string;
  cweId?: string;
}

export interface StreamChunk {
  type: 'content' | 'tool_calls' | 'done';
  text?: string;
  toolCallDelta?: ToolCallDelta;
}

export interface ToolCallDelta {
  index: number;
  id?: string;
  name?: string;
  argumentsDelta?: string;
}

export interface OpenAIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface DiffAdjustment {
  newDiff: string;
  changes: string[];
  reasoning: string;
}

export interface PatchContext {
  mode: 'verify' | 'adjust';
  diff: { before: string[]; after: string[] };
  metadata?: {
    vulnType?: string;
    fixStrategy?: string;
    confidence?: number;
  };
}
