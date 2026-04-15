import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';

interface CodeLine {
  number: number;
  content: string;
  type?: 'add' | 'remove' | 'normal' | 'highlight';
}

interface CodeBlockProps {
  title: string;
  lines: CodeLine[];
  accentColor?: 'red' | 'green' | 'cyan';
  onLineHover?: (lineNumber: number | null) => void;
  highlightedLines?: number[];
}

const accentColors = {
  red: {
    border: 'border-red-400',
    bg: 'bg-red-500/5',
    text: 'text-red-600',
    lineBg: 'bg-red-500/10',
    lineIndicator: 'bg-red-500',
  },
  green: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-600',
    lineBg: 'bg-emerald-500/10',
    lineIndicator: 'bg-emerald-500',
  },
  cyan: {
    border: 'border-cyan-400',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-600',
    lineBg: 'bg-cyan-500/10',
    lineIndicator: 'bg-cyan-500',
  },
};

export function CodeBlock({ 
  title, 
  lines, 
  accentColor = 'cyan',
  onLineHover,
  highlightedLines = []
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const colors = accentColors[accentColor];

  const handleCopy = () => {
    const code = lines.map(line => line.content).join('\n');
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineClass = (line: CodeLine) => {
    if (highlightedLines.includes(line.number)) {
      return 'bg-cyan-500/20 border-l-2 border-cyan-500';
    }
    switch (line.type) {
      case 'add':
        return 'bg-emerald-500/10 border-l-2 border-emerald-500';
      case 'remove':
        return 'bg-red-500/10 border-l-2 border-red-500';
      case 'highlight':
        return 'bg-orange-500/10 border-l-2 border-orange-500';
      default:
        return 'hover:bg-white';
    }
  };

  const getLinePrefix = (line: CodeLine) => {
    switch (line.type) {
      case 'add':
        return '+';
      case 'remove':
        return '-';
      default:
        return ' ';
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm border ${colors.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.bg} border-b ${colors.border} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${colors.lineIndicator}`} />
          <h3 className={`text-sm font-semibold ${colors.text}`}>{title}</h3>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        <div className="font-mono text-sm">
          {lines.map((line) => (
            <motion.div
              key={line.number}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: line.number * 0.01 }}
              className={`flex ${getLineClass(line)} transition-colors cursor-pointer`}
              onMouseEnter={() => onLineHover?.(line.number)}
              onMouseLeave={() => onLineHover?.(null)}
            >
              {/* Line Number */}
              <div className="select-none text-gray-600 px-4 py-1 text-right min-w-[4rem] border-r border-slate-100">
                {line.number}
              </div>
              
              {/* Diff Prefix */}
              <div className="select-none px-2 py-1 text-gray-600">
                {getLinePrefix(line)}
              </div>

              {/* Code Content */}
              <div className="flex-1 px-2 py-1 text-slate-600 overflow-x-auto">
                <code>{line.content}</code>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
