import { useState } from 'react';
import { motion } from 'motion/react';
import { LoaderCircle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import type { ToolCall } from '../../lib/agent-types';

const statusConfig = {
  pending: { icon: LoaderCircle, color: 'text-slate-400', label: '等待中' },
  running: { icon: LoaderCircle, color: 'text-cyan-500 animate-spin', label: '执行中' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', label: '完成' },
  error: { icon: XCircle, color: 'text-red-500', label: '错误' },
};

export function ToolCallDisplay({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[toolCall.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100/50 transition-colors"
      >
        <Terminal className="size-3.5 text-slate-500" />
        <span className="font-mono text-xs font-medium text-slate-700">
          {toolCall.name}
        </span>
        <span className="text-xs text-slate-400 ml-1">{config.label}</span>
        <StatusIcon className={`size-3.5 ml-auto ${config.color}`} />
        {expanded ? (
          <ChevronDown className="size-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="size-3.5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-slate-200 px-3 py-2"
        >
          <div className="text-xs">
            <div className="text-slate-500 mb-1">参数：</div>
            <pre className="font-mono text-xs bg-white rounded p-2 overflow-x-auto text-slate-700">
              {JSON.stringify(toolCall.arguments, null, 2)}
            </pre>
          </div>
          {toolCall.result && (
            <div className="mt-2 text-xs">
              <div className="text-slate-500 mb-1">结果：</div>
              <pre className="font-mono text-xs bg-white rounded p-2 overflow-x-auto text-slate-700 max-h-48 overflow-y-auto">
                {JSON.stringify(toolCall.result.data, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
