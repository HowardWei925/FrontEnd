import { useState, useCallback, useRef, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, Bot } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ChatPanel } from '../components/agent/ChatPanel';
import { AnalysisPanel } from '../components/agent/AnalysisPanel';
import { sendMessage, updateRuntimeConfig } from '../lib/llm-client';
import { executeTool } from '../lib/agent-tools';
import type { ChatMessage, ToolCall, ToolCallDelta, CWEResult, SecurityAuditResult, CommandResult, DiffAdjustment, PocInput as PocInputType, PocVerificationResult } from '../lib/agent-types';
import { PocVerificationPanel } from '../components/poc';

// --- State Management ---

interface AgentState {
  messages: ChatMessage[];
  isStreaming: boolean;
  toolCalls: ToolCall[];
  cweResults: CWEResult[];
  auditResults: SecurityAuditResult[];
  commandResults: CommandResult[];
  diffAdjustments: DiffAdjustment[];
}

type Action =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_ASSISTANT'; payload: { content: string; isStreaming?: boolean; toolCalls?: ToolCall[] } }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'ADD_TOOL_CALL'; payload: ToolCall }
  | { type: 'UPDATE_TOOL_CALL'; payload: { id: string; updates: Partial<ToolCall> } }
  | { type: 'ADD_CWE_RESULT'; payload: CWEResult }
  | { type: 'ADD_AUDIT_RESULT'; payload: SecurityAuditResult }
  | { type: 'ADD_COMMAND_RESULT'; payload: CommandResult }
  | { type: 'ADD_DIFF_ADJUSTMENT'; payload: DiffAdjustment };

let messageCounter = 0;
function genId() {
  return `msg-${Date.now()}-${++messageCounter}`;
}

function reducer(state: AgentState, action: Action): AgentState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_LAST_ASSISTANT': {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, ...action.payload };
      }
      return { ...state, messages: msgs };
    }
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };
    case 'ADD_TOOL_CALL':
      return { ...state, toolCalls: [...state.toolCalls, action.payload] };
    case 'UPDATE_TOOL_CALL': {
      return {
        ...state,
        toolCalls: state.toolCalls.map((tc) =>
          tc.id === action.payload.id ? { ...tc, ...action.payload.updates } : tc,
        ),
      };
    }
    case 'ADD_CWE_RESULT':
      return { ...state, cweResults: [...state.cweResults, action.payload] };
    case 'ADD_AUDIT_RESULT':
      return { ...state, auditResults: [...state.auditResults, action.payload] };
    case 'ADD_COMMAND_RESULT':
      return { ...state, commandResults: [...state.commandResults, action.payload] };
    case 'ADD_DIFF_ADJUSTMENT':
      return { ...state, diffAdjustments: [...state.diffAdjustments, action.payload] };
    default:
      return state;
  }
}

const initialState: AgentState = {
  messages: [],
  isStreaming: false,
  toolCalls: [],
  cweResults: [],
  auditResults: [],
  commandResults: [],
  diffAdjustments: [],
};

// --- Page Component ---

export function AgentPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [configOpen, setConfigOpen] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_LLM_API_KEY || '');
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_LLM_BASE_URL || 'https://api.deepseek.com/v1');
  const [model, setModel] = useState(import.meta.env.VITE_LLM_MODEL || 'deepseek-chat');
  const abortRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const [pocInputs, setPocInputs] = useState<PocInputType[]>([]);
  const [pocResults, setPocResults] = useState<PocVerificationResult[]>([]);
  const [targetCode, setTargetCode] = useState<string>('');

  // Read context from sessionStorage on mount
  useEffect(() => {
    const ctxStr = sessionStorage.getItem('agent_context');
    if (ctxStr) {
      sessionStorage.removeItem('agent_context');
      try {
        const ctx = JSON.parse(ctxStr);
        if (ctx.mode === 'verify' && ctx.diff) {
          const diffText = ctx.diff.before.map((l: string) => `- ${l}`).join('\n')
            + '\n'
            + ctx.diff.after.map((l: string) => `+ ${l}`).join('\n');
          const meta = ctx.metadata ? `\n漏洞类型：${ctx.metadata.vulnType || '未知'}\n修复策略：${ctx.metadata.fixStrategy || '未知'}` : '';
          setTimeout(() => {
            handleSendDirect(`请帮我验证以下补丁的有效性。我会提供测试命令来验证漏洞是否被修复。\n\n补丁 diff：\n\`\`\`\n${diffText}\n\`\`\`${meta}\n\n请先分析补丁的修复逻辑，然后等待我提供测试命令。`);
          }, 500);
        } else if (ctx.mode === 'adjust' && ctx.diff) {
          const diffText = ctx.diff.before.map((l: string) => `- ${l}`).join('\n')
            + '\n'
            + ctx.diff.after.map((l: string) => `+ ${l}`).join('\n');
          setTimeout(() => {
            handleSendDirect(`请帮我微调以下补丁 diff。我会告诉你需要哪些修改。\n\n当前 diff：\n\`\`\`\n${diffText}\n\`\`\`\n\n请分析当前补丁，等待我的修改需求。`);
          }, 500);
        }
        // 读取额外的上下文数据
        if (ctx.targetCode) setTargetCode(ctx.targetCode);
        if (ctx.pocInputs) setPocInputs(ctx.pocInputs);
        if (ctx.pocResults) setPocResults(ctx.pocResults);
      } catch { /* ignore parse errors */ }
    }

    // 读取 PoC 输入
    const pocStr = sessionStorage.getItem('poc_inputs');
    if (pocStr) {
      try {
        setPocInputs(JSON.parse(pocStr));
      } catch { /* ignore */ }
    }
  }, []);

  // Internal send without user message (for auto-sends)
  const handleSendDirect = useCallback(async (content: string) => {
    const userMsg: ChatMessage = { id: genId(), role: 'user', content, timestamp: Date.now() };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    dispatch({ type: 'SET_STREAMING', payload: true });
    await runAgentLoop([...stateRef.current.messages, userMsg]);
  }, []);

  // Agent loop: send message → execute tools → feed results back → repeat
  const runAgentLoop = useCallback(async (messages: ChatMessage[]) => {
    abortRef.current = false;
    let loopMessages = [...messages];
    const MAX_LOOPS = 10; // safety limit

    for (let i = 0; i < MAX_LOOPS; i++) {
      if (abortRef.current) break;

      let accumulated = '';
      const pendingToolCalls: Map<number, ToolCall> = new Map();

      // Create assistant message for this round
      const assistantMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });

      const result = await new Promise<{ hasToolCalls: boolean; toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> } | null>((resolve) => {
        sendMessage({
          messages: [...loopMessages, assistantMsg],
          onContent: (text) => {
            if (abortRef.current) return;
            accumulated += text;
            dispatch({ type: 'UPDATE_LAST_ASSISTANT', payload: { content: accumulated, isStreaming: true } });
          },
          onToolCall: (delta: ToolCallDelta) => {
            if (abortRef.current) return;
            const existing = pendingToolCalls.get(delta.index) || {
              id: delta.id || `tc-${Date.now()}-${delta.index}`,
              name: '',
              arguments: {},
              status: 'pending' as const,
            };
            if (delta.id) existing.id = delta.id;
            if (delta.name) existing.name = delta.name;
            if (delta.argumentsDelta) {
              try {
                const parsed = JSON.parse(delta.argumentsDelta);
                existing.arguments = { ...existing.arguments, ...parsed };
              } catch { /* still accumulating */ }
            }
            pendingToolCalls.set(delta.index, existing);
          },
          onDone: (r) => resolve(r),
          onError: (error) => {
            dispatch({ type: 'UPDATE_LAST_ASSISTANT', payload: { content: `抱歉，发生了错误：${error}`, isStreaming: false } });
            dispatch({ type: 'SET_STREAMING', payload: false });
            resolve(null);
          },
        });
      });

      if (!result || abortRef.current) break;

      if (!result.hasToolCalls) {
        // No more tool calls, mark as done
        dispatch({ type: 'UPDATE_LAST_ASSISTANT', payload: { content: accumulated, isStreaming: false } });
        dispatch({ type: 'SET_STREAMING', payload: false });
        return;
      }

      // Execute tool calls
      const toolCallsArray = Array.from(pendingToolCalls.values());
      dispatch({ type: 'UPDATE_LAST_ASSISTANT', payload: { content: accumulated, toolCalls: toolCallsArray, isStreaming: false } });

      // Build tool result messages to feed back to LLM
      const toolResultMessages: ChatMessage[] = [];

      for (const tc of toolCallsArray) {
        dispatch({ type: 'ADD_TOOL_CALL', payload: { ...tc, status: 'running' } });

        const toolResult = await executeTool(tc.name, tc.arguments);

        dispatch({ type: 'UPDATE_TOOL_CALL', payload: { id: tc.id, updates: { result: toolResult, status: 'completed' } } });

        // Extract structured results for the analysis panel
        if (tc.name === 'getCWEInfo' && toolResult.success) {
          dispatch({ type: 'ADD_CWE_RESULT', payload: toolResult.data as CWEResult });
        }
        if (tc.name === 'runCommand' && toolResult.success) {
          dispatch({ type: 'ADD_COMMAND_RESULT', payload: toolResult.data as CommandResult });
        }
        if (tc.name === 'adjustDiff' && toolResult.success) {
          dispatch({ type: 'ADD_DIFF_ADJUSTMENT', payload: toolResult.data as DiffAdjustment });
        }

        // Create tool result message for LLM
        toolResultMessages.push({
          id: genId(),
          role: 'tool',
          content: JSON.stringify(toolResult.data),
          timestamp: Date.now(),
          toolCallId: tc.id,
        });
      }

      // Update loop messages: add assistant msg (with tool calls) + tool results
      const updatedAssistantMsg = { ...assistantMsg, content: accumulated, toolCalls: toolCallsArray, isStreaming: false };
      loopMessages = [...loopMessages, updatedAssistantMsg, ...toolResultMessages];
    }

    // Safety exit
    dispatch({ type: 'SET_STREAMING', payload: false });
  }, []);

  const handleSend = useCallback(async (content: string) => {
    abortRef.current = false;
    const userMsg: ChatMessage = { id: genId(), role: 'user', content, timestamp: Date.now() };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    dispatch({ type: 'SET_STREAMING', payload: true });
    await runAgentLoop([...stateRef.current.messages, userMsg]);
  }, [runAgentLoop]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-cyan-50/50 rounded-full blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 bg-orange-50/50 rounded-full blur-2xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/task-creation')}
              className="gap-1.5 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              返回
            </Button>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Bot className="size-4 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900">AI 安全分析助手</h1>
                <p className="text-[11px] text-slate-500">漏洞分类 · 补丁验证 · Diff 微调 · 安全审计</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigOpen(true)}
            className="gap-1.5 text-slate-600"
          >
            <Settings className="size-3.5" />
            配置
          </Button>
        </motion.div>

        {/* Main Content - Resizable Panels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-h-0"
        >
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={58} minSize={35}>
              <ChatPanel
                messages={state.messages}
                isStreaming={state.isStreaming}
                onSend={handleSend}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={42} minSize={25}>
              <div className="h-full overflow-auto p-4 space-y-4">
                <AnalysisPanel
                  cweResults={state.cweResults}
                  auditResults={state.auditResults}
                  commandResults={state.commandResults}
                  diffAdjustments={state.diffAdjustments}
                  toolCalls={state.toolCalls}
                />

                {pocInputs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <PocVerificationPanel
                      targetCode={targetCode}
                      initialPocs={pocInputs}
                      initialResults={pocResults}
                      onVerificationComplete={(results) => {
                        setPocResults(results);
                      }}
                    />
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </motion.div>
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>LLM 配置</DialogTitle>
            <DialogDescription>
              配置 AI 模型接口。支持 OpenAI 兼容 API（DeepSeek、通义千问、Ollama 等）。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">模型名称</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="deepseek-chat"
              />
            </div>
            <p className="text-xs text-slate-500">
              提示：留空 API Key 将使用 Mock 模式演示。保存后立即生效。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              取消
            </Button>
            <Button onClick={() => {
              updateRuntimeConfig({ apiKey, baseUrl, model });
              setConfigOpen(false);
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
