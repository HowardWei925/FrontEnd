import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../../lib/agent-types';
import { ToolCallDisplay } from './ToolCallDisplay';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  if (isTool) {
    return null;
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
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold text-slate-800 mt-3 mb-1.5 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-slate-800 mt-2 mb-1">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-none space-y-1 my-1.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-none space-y-1 my-1.5">{children}</ol>
                ),
                li: ({ children, ordered, index }) => (
                  <div className="flex items-start gap-1.5 ml-1">
                    {ordered ? (
                      <span className="text-cyan-600 font-medium mt-0.5 shrink-0">
                        {(index ?? 0) + 1}.
                      </span>
                    ) : (
                      <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
                    )}
                    <span>{children}</span>
                  </div>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-800">{children}</strong>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  if (isBlock) {
                    return (
                      <pre className="font-mono text-xs bg-slate-100 rounded-md p-3 my-2 overflow-x-auto text-slate-700">
                        <code>{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="font-mono text-xs bg-slate-100 rounded-md p-3 my-2 overflow-x-auto text-slate-700">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full text-xs border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="text-left font-medium text-slate-600 px-2 py-1 border-b border-slate-200 bg-slate-100/50">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-2 py-1 border-b border-slate-100">{children}</td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-cyan-300 pl-3 my-2 text-slate-600 italic">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-3 border-slate-200" />,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 underline underline-offset-2"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </Markdown>
          )}
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
