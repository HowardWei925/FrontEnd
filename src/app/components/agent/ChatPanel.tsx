import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Bot, Wifi, WifiOff } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../lib/agent-types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { isRealAPIAvailable } from '../../lib/llm-client';

interface ChatPanelProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  onSend: (message: string) => void;
}

export function ChatPanel({ messages, isStreaming, onSend }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleQuickAction = useCallback(
    (prompt: string) => {
      onSend(prompt);
    },
    [onSend],
  );

  const useRealAPI = isRealAPIAvailable();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-cyan-600" />
          <span className="text-sm font-semibold text-slate-800">AI 安全分析助手</span>
        </div>
        <div className="flex items-center gap-1.5">
          {useRealAPI ? (
            <>
              <Wifi className="size-3.5 text-emerald-500" />
              <span className="text-[10px] text-emerald-600">API 已连接</span>
            </>
          ) : (
            <>
              <WifiOff className="size-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500">Mock 模式</span>
            </>
          )}
        </div>
      </div>

      {/* Messages - scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 min-h-0">
        <div className="py-4 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center pt-12 text-center"
            >
              <div className="size-14 rounded-full bg-cyan-50 flex items-center justify-center mb-3">
                <Bot className="size-7 text-cyan-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">
                PatchFlow 安全分析助手
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                输入代码片段或安全问题，AI 将为你进行漏洞分析和代码审计
              </p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area - always at bottom */}
      <div className="shrink-0 border-t border-slate-200 p-4 space-y-3 bg-white">
        <QuickActions onSelect={handleQuickAction} disabled={isStreaming} />
        <ChatInput onSend={onSend} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
