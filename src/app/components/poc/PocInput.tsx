import { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Terminal, Plus, Trash2, FileCode, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { PocInput as PocInputType, PocType } from '../../lib/agent-types';

interface PocInputProps {
  pocs: PocInputType[];
  onChange: (pocs: PocInputType[]) => void;
  maxPocs?: number;
}

export function PocInput({ pocs, onChange, maxPocs = 5 }: PocInputProps) {
  const [activeTab, setActiveTab] = useState<PocType>('command');

  const addPoc = () => {
    const newPoc: PocInputType = {
      id: `poc-${Date.now()}`,
      type: activeTab,
      content: '',
      language: activeTab === 'code' ? 'c' : undefined,
      description: '',
    };
    onChange([...pocs, newPoc]);
  };

  const updatePoc = (id: string, updates: Partial<PocInputType>) => {
    onChange(pocs.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePoc = (id: string) => {
    onChange(pocs.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Tab 切换 */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('command')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'command'
              ? 'bg-white text-cyan-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          验证命令
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'code'
              ? 'bg-white text-cyan-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          PoC 代码
        </button>
      </div>

      {/* 说明文字 */}
      <div className="flex items-start gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-cyan-700">
          {activeTab === 'command'
            ? '输入用于验证漏洞是否修复的命令，如编译命令、测试脚本、PoC 执行命令等'
            : '粘贴 PoC 漏洞利用代码，系统将自动编译并执行验证'
          }
        </p>
      </div>

      {/* PoC 列表 */}
      <div className="space-y-3">
        {pocs.map((poc, index) => (
          <motion.div
            key={poc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-cyan-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {poc.type === 'code' ? (
                  <FileCode className="w-4 h-4 text-purple-600" />
                ) : (
                  <Terminal className="w-4 h-4 text-cyan-600" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  PoC #{index + 1}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePoc(poc.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* 描述 */}
            <div className="mb-3">
              <Label className="text-xs text-slate-500 mb-1">描述（可选）</Label>
              <Input
                value={poc.description || ''}
                onChange={(e) => updatePoc(poc.id, { description: e.target.value })}
                placeholder="例如：缓冲区溢出 PoC、SQL 注入测试..."
                className="h-8 text-sm"
              />
            </div>

            {/* 语言选择（代码模式） */}
            {poc.type === 'code' && (
              <div className="mb-3">
                <Label className="text-xs text-slate-500 mb-1">语言</Label>
                <select
                  value={poc.language || 'c'}
                  onChange={(e) => updatePoc(poc.id, { language: e.target.value })}
                  className="w-full h-8 px-3 text-sm border border-slate-200 rounded-md"
                >
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="bash">Bash</option>
                </select>
              </div>
            )}

            {/* 内容输入 */}
            <div>
              <Label className="text-xs text-slate-500 mb-1">
                {poc.type === 'command' ? '验证命令' : 'PoC 代码'}
              </Label>
              <Textarea
                value={poc.content}
                onChange={(e) => updatePoc(poc.id, { content: e.target.value })}
                placeholder={
                  poc.type === 'command'
                    ? 'gcc -o test test.c && ./test $(python -c "print(\'A\'*100)")'
                    : '#include <stdio.h>\n#include <string.h>\n\nint main() {\n  char buf[64];\n  strcpy(buf, "A" * 100);\n  return 0;\n}'
                }
                className="font-mono text-sm min-h-[100px] resize-y"
                rows={4}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 添加按钮 */}
      {pocs.length < maxPocs && (
        <Button
          variant="outline"
          onClick={addPoc}
          className="w-full border-dashed border-2 border-slate-300 hover:border-cyan-400 hover:text-cyan-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加 PoC（{pocs.length}/{maxPocs}）
        </Button>
      )}
    </div>
  );
}
