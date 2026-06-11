import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, GitCompare, Info, Sparkles, Play, Edit3, Save, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

// ==================== 修复版本代码 ====================
const patchedCodeText = [
  '#include <stdio.h>',
  '#include <string.h>',
  '',
  'void process_input(char *input) {',
  '    char buffer[64];',
  '    // Boundary check added',
  '    strncpy(buffer, input, sizeof(buffer) - 1);',
  '    buffer[sizeof(buffer) - 1] = \'\\0\';',
  '    printf("Processed: %s\\n", buffer);',
  '}',
  '',
  'int main(int argc, char **argv) {',
  '    if (argc < 2) return 1;',
  '    process_input(argv[1]);',
  '    return 0;',
  '}',
];

// ==================== 目标版本文本 ====================
const targetText = [
  '#include <stdio.h>',
  '#include <string.h>',
  '#include "utils.h"',
  '',
  '// Target version has different variable names',
  'void handle_data(char *user_input) {',
  '    char temp_buf[64];',
  '    // AI-migrated patch applied here',
  '    strncpy(temp_buf, user_input, sizeof(temp_buf) - 1);',
  '    temp_buf[sizeof(temp_buf) - 1] = \'\\0\';',
  '    log_message("Data: %s\\n", temp_buf);',
  '}',
  '',
  'int main(int argc, char **argv) {',
  '    if (argc < 2) return 1;',
  '    handle_data(argv[1]);',
  '    return 0;',
  '}',
];

// ==================== Diff 行接口 ====================
interface DiffLine {
  type: 'add' | 'remove' | 'normal';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

// ==================== 生成 Diff 行 ====================
function generateDiffLines(before: string[], after: string[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let i = 0, j = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      lines.push({ type: 'normal', content: before[i], oldLineNum: oldLineNum++, newLineNum: newLineNum++ });
      i++;
      j++;
    } else if (j < after.length && (i === before.length || before[i] !== after[j])) {
      lines.push({ type: 'add', content: after[j], newLineNum: newLineNum++ });
      j++;
    } else if (i < before.length) {
      lines.push({ type: 'remove', content: before[i], oldLineNum: oldLineNum++ });
      i++;
    }
  }
  return lines;
}

// ==================== 将 Diff 行转换为文本（用于编辑） ====================
function diffLinesToText(lines: DiffLine[]): string {
  return lines.map(line => {
    const prefix = line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  ';
    return `${prefix}${line.content}`;
  }).join('\n');
}

// ==================== 将文本解析回 Diff 行（用于保存） ====================
function textToDiffLines(text: string): DiffLine[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const result: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (const line of lines) {
    const prefix = line[0];
    const content = line.length > 1 ? line.substring(2) : '';
    if (prefix === '+') {
      result.push({ type: 'add', content, newLineNum: newLineNum++ });
    } else if (prefix === '-') {
      result.push({ type: 'remove', content, oldLineNum: oldLineNum++ });
    } else {
      result.push({ type: 'normal', content: line.substring(2), oldLineNum: oldLineNum++, newLineNum: newLineNum++ });
    }
  }
  return result;
}

// ==================== localStorage key ====================
const STORAGE_KEY = 'custom_diff_lines';

// ==================== Diff 视图组件（查看模式） ====================
function GitHubDiffView({ lines }: { lines: DiffLine[] }) {
  const additions = lines.filter(l => l.type === 'add').length;
  const deletions = lines.filter(l => l.type === 'remove').length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-700">patched.c → target.c</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
            +{additions}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            -{deletions}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const bgColor = line.type === 'add' ? 'bg-emerald-50' : line.type === 'remove' ? 'bg-red-50' : '';
              const lineColor = line.type === 'add' ? 'text-emerald-800' : line.type === 'remove' ? 'text-red-800' : 'text-gray-700';
              const sign = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';

              return (
                <tr key={idx} className={`${bgColor} hover:brightness-95 transition-colors`}>
                  <td className="w-12 px-2 py-0 text-right text-xs text-gray-400 select-none border-r border-gray-100 align-top">
                    {line.oldLineNum || ''}
                  </td>
                  <td className="w-12 px-2 py-0 text-right text-xs text-gray-400 select-none border-r border-gray-100 align-top">
                    {line.newLineNum || ''}
                  </td>
                  <td className={`w-6 px-1 py-0 text-center select-none ${lineColor} align-top`}>
                    {sign}
                  </td>
                  <td className={`px-2 py-0 font-mono text-sm whitespace-pre-wrap ${lineColor} align-top`}>
                    {line.content || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== 编辑模式组件 ====================
function EditDiffView({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-mono text-gray-700">编辑模式 — 手动修改 diff（格式：+ 新增行，- 删除行，空格 正常行）</span>
      </div>
      <textarea
        className="w-full h-[500px] font-mono text-sm p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function CodeComparisonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 存储编辑后的 diff 行，从 localStorage 读取
  const [customDiffLines, setCustomDiffLines] = useState<DiffLine[] | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // 获取当前显示的 diff 行（优先使用自定义的，否则用默认的）
  const currentDiffLines = customDiffLines || generateDiffLines(patchedCodeText, targetText);

  // 当进入编辑模式时，用当前 diff 内容填充编辑框
  const handleEdit = () => {
    setEditContent(diffLinesToText(currentDiffLines));
    setIsEditing(true);
  };

  const handleSave = () => {
    const newLines = textToDiffLines(editContent);
    setCustomDiffLines(newLines);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLines));
    setIsEditing(false);
    toast.success('修改已保存', { description: '刷新页面后依然有效' });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomDiffLines(null);
    toast.info('已重置为原始 diff');
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-[1200px]">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/semantic-mapping')}
              variant="ghost"
              className="mb-4 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回语义映射
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GitCompare className="w-8 h-8 text-cyan-600" />
                <h1 className="text-3xl font-bold text-slate-900">代码对比</h1>
              </div>
              <p className="text-slate-600">修复版本 → 目标版本的补丁移植差异</p>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={handleEdit} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    <Edit3 className="w-4 h-4 mr-2" />
                    手动修改
                  </Button>
                  {customDiffLines && (
                    <Button onClick={handleReset} variant="outline" className="border-yellow-300 text-yellow-600 hover:bg-yellow-50">
                      重置原始
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    <X className="w-4 h-4 mr-2" />
                    取消
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* 移植结果 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-emerald-400 rounded-full" />
            <h2 className="text-xl font-semibold text-slate-900">移植结果：目标版本</h2>
            <div className="flex-1 h-px bg-slate-200 ml-4" />
          </div>

          {isEditing ? (
            <EditDiffView value={editContent} onChange={(e) => setEditContent(e.target.value)} />
          ) : (
            <GitHubDiffView lines={currentDiffLines} />
          )}
        </motion.div>

        {/* 分析面板 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white/80 backdrop-blur-sm border border-orange-400 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-700">AI 补丁移植分析</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-100/50 rounded p-3 border border-slate-100">
                <p className="text-gray-600 mb-1">漏洞类型</p>
                <p className="text-slate-900 font-mono">缓冲区溢出 (CWE-120)</p>
              </div>
              <div className="bg-slate-100/50 rounded p-3 border border-slate-100">
                <p className="text-gray-600 mb-1">修复策略</p>
                <p className="text-slate-900 font-mono">边界检查</p>
              </div>
              <div className="bg-slate-100/50 rounded p-3 border border-slate-100">
                <p className="text-gray-600 mb-1">置信度评分</p>
                <p className="text-emerald-600 font-mono">97.8%</p>
              </div>
            </div>

            <div className="bg-slate-100/30 rounded-lg p-4 border border-slate-100">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">已应用的语义转换：</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-slate-600">函数名:</span>
                  <span className="text-red-600">process_input()</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-emerald-600">handle_data()</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-slate-600">变量名:</span>
                  <span className="text-red-600">buffer</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-emerald-600">temp_buf</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-slate-600">参数名:</span>
                  <span className="text-red-600">input</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-emerald-600">user_input</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-emerald-400 rounded-lg p-4">
              <p className="text-sm text-emerald-700">
                <strong>✓ 验证通过：</strong> 补丁已成功移植到目标版本。
              </p>
            </div>
          </div>
        </motion.div>

        {/* Workflow Completion Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-3">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">补丁移植流程完成</h2>
            <p className="text-sm text-slate-500">你可以使用 AI 进一步验证或微调补丁</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => {
                const pocInputs = JSON.parse(sessionStorage.getItem('poc_inputs') || '[]');
                sessionStorage.setItem('agent_context', JSON.stringify({
                  mode: 'verify',
                  diff: currentDiffLines,
                  metadata: { vulnType: '缓冲区溢出 (CWE-120)', fixStrategy: '边界检查', confidence: 97.8 },
                  pocInputs,
                }));
                navigate('/agent');
              }}
              className="group bg-white border-2 border-cyan-200 hover:border-cyan-400 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-cyan-100 group-hover:bg-cyan-200 flex items-center justify-center transition-colors">
                  <Play className="size-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">AI 验证补丁</h3>
                  <p className="text-xs text-slate-500">输入测试命令，验证漏洞是否修复</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                让 AI 执行编译、PoC 复现、单元测试等命令，自动判断补丁有效性。
              </p>
            </button>

            <button
              onClick={() => {
                sessionStorage.setItem('agent_context', JSON.stringify({
                  mode: 'adjust',
                  diff: currentDiffLines,
                  metadata: { vulnType: '缓冲区溢出 (CWE-120)', fixStrategy: '边界检查' },
                }));
                navigate('/agent');
              }}
              className="group bg-white border-2 border-orange-200 hover:border-orange-400 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                  <GitCompare className="size-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">AI 微调补丁</h3>
                  <p className="text-xs text-slate-500">用自然语言修改 diff</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                通过对话告诉 AI 你的修改需求，多轮迭代直到生成满意的补丁。
              </p>
            </button>
          </div>
        </motion.div>

        <div className="h-12" />
      </div>
    </div>
  );
}
