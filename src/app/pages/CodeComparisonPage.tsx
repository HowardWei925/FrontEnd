import { motion } from 'motion/react';
import { ArrowLeft, GitCompare, ArrowDown, Info, Sparkles, ArrowRight, Network } from 'lucide-react';
import { useNavigate } from 'react-router';
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

// ==================== GitHub 风格 Diff 组件 ====================
interface DiffLine {
  type: 'add' | 'remove' | 'normal';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

function GitHubDiffView({ before, after }: { before: string[]; after: string[] }) {
  const lines: DiffLine[] = [];
  let i = 0, j = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

  // 计算差异
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

  // 统计信息
  const additions = lines.filter(l => l.type === 'add').length;
  const deletions = lines.filter(l => l.type === 'remove').length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* 文件头 */}
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

      {/* Diff 内容 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const bgColor = line.type === 'add' ? 'bg-emerald-50' : line.type === 'remove' ? 'bg-red-50' : '';
              const lineColor = line.type === 'add' ? 'text-emerald-800' : line.type === 'remove' ? 'text-red-800' : 'text-gray-700';
              const sign = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';

              return (
                <tr key={idx} className={`${bgColor} hover:brightness-95 transition-colors`}>
                  {/* 旧文件行号 */}
                  <td className="w-12 px-2 py-0 text-right text-xs text-gray-400 select-none border-r border-gray-100 align-top">
                    {line.oldLineNum || ''}
                  </td>
                  {/* 新文件行号 */}
                  <td className="w-12 px-2 py-0 text-right text-xs text-gray-400 select-none border-r border-gray-100 align-top">
                    {line.newLineNum || ''}
                  </td>
                  {/* 符号 */}
                  <td className={`w-6 px-1 py-0 text-center select-none ${lineColor} align-top`}>
                    {sign}
                  </td>
                  {/* 代码内容 */}
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

export function CodeComparisonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Gradient Orbs */}
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
          <Button
            onClick={() => navigate('/workflow')}
            variant="ghost"
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回工作流
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GitCompare className="w-8 h-8 text-cyan-600" />
                <h1 className="text-3xl font-bold text-slate-900">代码对比</h1>
              </div>
              <p className="text-slate-600">修复版本 → 目标版本的补丁移植差异</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-400 rounded-lg">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span className="text-sm text-cyan-700">AI 分析</span>
            </div>
          </div>
        </motion.div>

        {/* 移植结果 - GitHub 风格 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-emerald-400 rounded-full" />
            <h2 className="text-xl font-semibold text-slate-900">移植结果：目标版本</h2>
            <div className="flex-1 h-px bg-slate-200 ml-4" />
          </div>
          <GitHubDiffView before={patchedCodeText} after={targetText} />
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

          <div className="mt-6 pt-6 border-t border-slate-200">
            <Button
              onClick={() => navigate('/semantic-mapping')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm transition-all"
            >
              <Network className="w-4 h-4 mr-2" />
              查看详细的语义映射分析
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
