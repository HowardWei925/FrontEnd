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

// ==================== Diff 组件 ====================
function UnifiedDiffView({ before, after }: { before: string[]; after: string[] }) {
  const lines: { type: 'add' | 'remove' | 'normal'; content: string }[] = [];
  let i = 0, j = 0;
  
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      lines.push({ type: 'normal', content: before[i] });
      i++;
      j++;
    } else if (j < after.length && (i === before.length || before[i] !== after[j])) {
      lines.push({ type: 'add', content: after[j] });
      j++;
    } else if (i < before.length) {
      lines.push({ type: 'remove', content: before[i] });
      i++;
    }
  }
  
  return (
    <div className="bg-white font-mono text-sm">
      {lines.map((line, idx) => {
        if (line.type === 'add') {
          return (
            <div key={idx} className="px-4 py-0.5 bg-emerald-50 text-emerald-800">
              <span className="inline-block w-8 text-right mr-4 text-gray-400 select-none">+</span>
              <span className="whitespace-pre-wrap">{line.content === '' ? ' ' : line.content}</span>
            </div>
          );
        } else if (line.type === 'remove') {
          return (
            <div key={idx} className="px-4 py-0.5 bg-red-50 text-red-800">
              <span className="inline-block w-8 text-right mr-4 text-gray-400 select-none">-</span>
              <span className="whitespace-pre-wrap">{line.content}</span>
            </div>
          );
        } else {
          return (
            <div key={idx} className="px-4 py-0.5 text-gray-700">
              <span className="inline-block w-8 text-right mr-4 text-gray-400 select-none"> </span>
              <span className="whitespace-pre-wrap">{line.content}</span>
            </div>
          );
        }
      })}
    </div>
  );
}

export function CodeComparisonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: '', backgroundSize: '40px 40px' }} />
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

        {/* 映射指示器 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center my-6"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-100/50 border border-cyan-400 rounded-full">
            <ArrowDown className="w-5 h-5 text-cyan-600" />
            <span className="text-sm text-slate-600 font-mono">语义映射与代码转换</span>
            <ArrowDown className="w-5 h-5 text-cyan-600" />
          </div>
        </motion.div>

        {/* 移植结果 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-emerald-400 rounded-full" />
            <h2 className="text-xl font-semibold text-slate-900">移植结果：目标版本</h2>
            <div className="flex-1 h-px bg-slate-200 ml-4" />
          </div>
          <div className="rounded-lg border overflow-hidden shadow-sm bg-white">
            <div className="px-4 py-2 border-b font-mono font-semibold bg-cyan-50 text-cyan-700 border-cyan-200">
              目标版本差异 — 红色为删除，绿色为新增
            </div>
            <UnifiedDiffView before={patchedCodeText} after={targetText} />
          </div>
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