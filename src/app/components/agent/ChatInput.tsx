import { useState, useRef, useCallback } from 'react';
import { Send, LoaderCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export function ChatInput({ onSend, disabled, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, disabled, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="输入代码或安全问题..."
        disabled={disabled || isStreaming}
        className="min-h-[40px] max-h-[150px] resize-none border-slate-200 focus-visible:ring-cyan-500/30 focus-visible:border-cyan-400 text-sm"
        rows={1}
      />
      <Button
        size="icon"
        disabled={!input.trim() || disabled || isStreaming}
        onClick={handleSend}
        className="shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white size-10"
      >
        {isStreaming ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  );
}
