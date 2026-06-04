import { useState, useCallback, useRef, useReducer } from 'react';
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
import { sendMessage } from '../lib/llm-client';
import { executeTool } from '../lib/agent-tools';
import type { ChatMessage, ToolCall, ToolCallDelta, CWEResult, SecurityAuditResult } from '../lib/agent-types';

// --- State Management ---

interface AgentState {
  messages: ChatMessage[];
  isStreaming: boolean;
  toolCalls: ToolCall[];
  cweResults: CWEResult[];
  auditResults: SecurityAuditResult[];
}

type Action =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_ASSISTANT'; payload: { content: string; isStreaming?: boolean } }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'ADD_TOOL_CALL'; payload: ToolCall }
  | { type: 'UPDATE_TOOL_CALL'; payload: { id: string; updates: Partial<ToolCall> } }
  | { type: 'SET_TOOL_CALLS'; payload: ToolCall[] }
  | { type: 'ADD_CWE_RESULT'; payload: CWEResult }
  | { type: 'ADD_AUDIT_RESULT'; payload: SecurityAuditResult };

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
    case 'SET_TOOL_CALLS':
      return { ...state, toolCalls: action.payload };
    case 'ADD_CWE_RESULT':
      return { ...state, cweResults: [...state.cweResults, action.payload] };
    case 'ADD_AUDIT_RESULT':
      return { ...state, auditResults: [...state.auditResults, action.payload] };
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

  const handleSend = useCallback(
    async (content: string) => {
      abortRef.current = false;

      const userMsg: ChatMessage = {
        id: genId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMsg });

      const assistantMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
      dispatch({ type: 'SET_STREAMING', payload: true });

      const currentMessages = [...state.messages, userMsg, assistantMsg];

      let accumulated = '';
      const pendingToolCalls: Map<number, ToolCall> = new Map();

      await sendMessage({
        messages: currentMessages,
        onContent: (text) => {
          if (abortRef.current) return;
          accumulated += text;
          dispatch({
            type: 'UPDATE_LAST_ASSISTANT',
            payload: { content: accumulated, isStreaming: true },
          });
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
            } catch {
              // arguments still accumulating
            }
          }
          pendingToolCalls.set(delta.index, existing);
        },
        onDone: async () => {
          if (abortRef.current) return;

          // Execute tool calls if any
          if (pendingToolCalls.size > 0) {
            const toolCallsArray = Array.from(pendingToolCalls.values());
            dispatch({
              type: 'UPDATE_LAST_ASSISTANT',
              payload: { content: accumulated, toolCalls: toolCallsArray, isStreaming: false },
            });

            for (const tc of toolCallsArray) {
              dispatch({ type: 'ADD_TOOL_CALL', payload: { ...tc, status: 'running' } });

              const result = await executeTool(tc.name, tc.arguments);
              const completedTc = { ...tc, result, status: 'completed' as const };
              dispatch({
                type: 'UPDATE_TOOL_CALL',
                payload: { id: tc.id, updates: { result, status: 'completed' } },
              });

              // Extract structured results
              if (tc.name === 'getCWEInfo' && result.success) {
                dispatch({ type: 'ADD_CWE_RESULT', payload: result.data as CWEResult });
              }
              if (tc.name === 'analyzeAST' && result.success) {
                // Could extract audit info from AST analysis
              }
            }

            // Send tool results back for a follow-up response
            // For simplicity in mock mode, we just mark as done
          }

          dispatch({ type: 'UPDATE_LAST_ASSISTANT', payload: { content: accumulated, isStreaming: false } });
          dispatch({ type: 'SET_STREAMING', payload: false });
        },
        onError: (error) => {
          if (abortRef.current) return;
          dispatch({
            type: 'UPDATE_LAST_ASSISTANT',
            payload: {
              content: `抱歉，发生了错误：${error}\n\n请检查 API 配置或网络连接后重试。`,
              isStreaming: false,
            },
          });
          dispatch({ type: 'SET_STREAMING', payload: false });
        },
      });
    },
    [state.messages],
  );

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
                <p className="text-[11px] text-slate-500">漏洞分类 · 代码审计 · 安全分析</p>
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
              <AnalysisPanel
                cweResults={state.cweResults}
                auditResults={state.auditResults}
                toolCalls={state.toolCalls}
              />
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
              提示：留空 API Key 将使用 Mock 模式演示。配置后请刷新页面生效。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
