import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../lib/agent-types';
import { ToolCallDisplay } from './ToolCallDisplay';

function formatContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      return (
        <pre key={i} className="font-mono text-xs bg-slate-100 rounded-md p-3 my-2 overflow-x-auto text-slate-700">
          {code}
        </pre>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part.split('\n').map((line, j) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={`${i}-${j}`} className="text-base font-semibold text-slate-800 mt-3 mb-1">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={`${i}-${j}`} className="font-semibold text-slate-700 mt-2">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <div key={`${i}-${j}`} className="flex items-start gap-1.5 ml-1">
            <span className="text-cyan-500 mt-0.5">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={`${i}-${j}`} className="flex items-start gap-1.5 ml-1">
            <span className="text-cyan-600 font-medium mt-0.5">{num}.</span>
            <span>{line.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      }
      return line ? <p key={`${i}-${j}`}>{line}</p> : <br key={`${i}-${j}`} />;
    });
  });
}

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  if (isTool) {
    return null; // tool results are shown inline with assistant messages
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`shrink-0 size-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-cyan-100' : 'bg-slate-100'
        }`}
      >
        {isUser ? (
          <User className="size-4 text-cyan-600" />
        ) : (
          <Bot className="size-4 text-slate-600" />
        )}
      </div>

      <div
        className={`max-w-[80%] space-y-1 ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        <div
          className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-cyan-50 border border-cyan-200 text-slate-800'
              : 'bg-slate-50 border border-slate-200 text-slate-700'
          }`}
        >
          {formatContent(message.content)}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
          )}
        </div>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1.5 w-full">
            {message.toolCalls.map((tc) => (
              <ToolCallDisplay key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        <span className="text-[10px] text-slate-400 px-1">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}
