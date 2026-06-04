import { ShieldAlert, Search, Database, Code } from 'lucide-react';
import { Button } from '../ui/button';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  prompt: string;
}

const quickActions: QuickAction[] = [
  {
    label: '分析漏洞类型',
    icon: ShieldAlert,
    prompt: '请分析以下代码的漏洞类型，给出 CWE 分类和风险评估：\n\n```c\nvoid vulnerable_function(char *input) {\n    char buffer[64];\n    strcpy(buffer, input);\n    printf(buffer);\n}\n```',
  },
  {
    label: '代码安全审计',
    icon: Search,
    prompt: '请对以下代码进行全面的安全审计，识别潜在的安全漏洞和风险：\n\n```c\nint process_data(char *data, int len) {\n    char *buf = malloc(len);\n    if (!buf) return -1;\n    memcpy(buf, data, len);\n    // process...\n    return 0;\n}\n```',
  },
  {
    label: '查询 CWE 信息',
    icon: Database,
    prompt: '请详细解释 CWE-120（缓冲区溢出）漏洞的原理、危害和修复方法。',
  },
  {
    label: '解释代码语义',
    icon: Code,
    prompt: '请解释以下代码的语义和功能，并分析其中的安全风险：\n\n```c\nvoid copy_input(char *dst, const char *src) {\n    while (*src) {\n        *dst++ = *src++;\n    }\n    *dst = \'\\0\';\n}\n```',
  },
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onSelect(action.prompt)}
            className="h-8 text-xs border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-colors gap-1.5"
          >
            <Icon className="size-3.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
