import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, GitCompare, ArrowDown, Info, Sparkles, ArrowRight, Network } from 'lucide-react';
import { useNavigate } from 'react-router';
import { CodeBlock } from '../components/CodeBlock';
import { Button } from '../components/ui/button';

// ==================== 修复后的 Diff 算法 ====================
function computeDiff(original: string[], patched: string[]) {
  // 使用 Myers diff 算法思想，简化版：基于最长公共子序列
  const result: { type: 'add' | 'remove' | 'normal'; content: string; lineNum: number }[] = [];
  
  let i = 0, j = 0;
  let lineNum = 1;
  
  // 预处理：去除空行的影响，但保留空行在结果中
  while (i < original.length || j < patched.length) {
    // 如果都还有行且内容相同
    if (i < original.length && j < patched.length && original[i].trim() === patched[j].trim()) {
      // 相同行，标记为 normal
      result.push({ type: 'normal', content: original[i], lineNum: lineNum++ });
      i++;
      j++;
    } 
    // 检查是否只是空行差异
    else if (i < original.length && original[i].trim() === '' && j < patched.length && patched[j].trim() !== '') {
      // 原代码有空白行，目标代码没有 → 删除空白行
      result.push({ type: 'remove', content: original[i], lineNum: lineNum++ });
      i++;
    }
    else if (j < patched.length && patched[j].trim() === '' && i < original.length && original[i].trim() !== '') {
      // 目标代码有空白行，原代码没有 → 新增空白行
      result.push({ type: 'add', content: patched[j], lineNum: lineNum++ });
      j++;
    }
    // 原代码有行，目标代码没有（或不同）
    else if (i < original.length && (j >= patched.length || original[i] !== patched[j])) {
      result.push({ type: 'remove', content: original[i], lineNum: lineNum++ });
      i++;
    }
    // 目标代码有新行，原代码没有
    else if (j < patched.length) {
      result.push({ type: 'add', content: patched[j], lineNum: lineNum++ });
      j++;
    }
    else {
      i++;
      j++;
    }
  }
  
  return result;
}

// Diff 视图组件
function DiffCodeBlock({ title, lines, accentColor }: { 
  title: string; 
  lines: { type: 'add' | 'remove' | 'normal'; content: string; lineNum: number }[];
  accentColor: 'red' | 'green' | 'cyan';
}) {
  const getHeaderColor = () => {
    if (accentColor === 'red') return 'bg-red-50 text-red-700 border-red-200';
    if (accentColor === 'green') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  };
  
  return (
    <div className="rounded-lg border overflow-hidden shadow-sm bg-white">
      <div className={`px-4 py-2 border-b font-mono font-semibold ${getHeaderColor()}`}>
        {title}
      </div>
      <div className="bg-white font-mono text-sm">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`px-3 py-0.5 ${
              line.type === 'add' ? 'bg-emerald-50 text-emerald-800' :
              line.type === 'remove' ? 'bg-red-50 text-red-800' :
              'text-gray-700'
            }`}
          >
            <span className="inline-block w-8 text-right mr-3 text-gray-400 select-none">
              {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
            </span>
            <span className="inline-block w-8 text-right mr-3 text-gray-400 select-none">{line.lineNum}</span>
            <span>{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 数据定义 ====================
const vulnerableCodeLines = [
  '#include <stdio.h>',
  '#include <string.h>',
  '',
  'void process_input(char *input) {',
  '    char buffer[64];',
  '    strcpy(buffer, input); // Vulnerable!',
  '    printf("Processed: %s\\n", buffer);',
  '}',
  '',
  'int main(int argc, char **argv) {',
  '    if (argc < 2) return 1;',
  '    process_input(argv[1]);',
  '    return 0;',
  '}',
];

const patchedCodeLines = [
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

const targetCodeLines = [
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

export function CodeComparisonPage() {
  const navigate = useNavigate();
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  
  // 计算两个 diff
  const diff1 = computeDiff(vulnerableCodeLines, patchedCodeLines);
  const diff2 = computeDiff(patchedCodeLines, targetCodeLines);

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

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-[1800px]">
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
                <h1 className="text-3xl font-bold text-slate-900">三方代码对比</h1>
              </div>
              <p className="text-slate-600">跨漏洞版本、修复版本和目标版本的分层补丁移植分析</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-400 rounded-lg">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span className="text-sm text-cyan-700">AI 分析</span>
            </div>
          </div>
        </motion.div>

        {/* 第一张图：漏洞版本 → 修复版本 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-white rounded-full" />
            <h2 className="text-xl font-semibold text-slate-900">基础对比：漏洞版本 vs 修复版本</h2>
            <div className="flex-1 h-px bg-white ml-4" />
          </div>
          <DiffCodeBlock 
            title="补丁差异 — 红色为删除，绿色为新增"
            lines={diff1}
            accentColor="red"
          />
        </motion.div>

        {/* 映射指示器 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center my-6"
        >
          <div className="flex items-center gap-4 px-6 py-3 bg-slate-100/50 border border-cyan-400 rounded-full">
            <ArrowDown className="w-5 h-5 text-cyan-600" />
            <span className="text-sm text-slate-600 font-mono">语义映射与代码转换</span>
            <ArrowDown className="w-5 h-5 text-cyan-600" />
          </div>
        </motion.div>

        {/* 第二张图：修复版本 → 目标版本 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-white rounded-full" />
            <h2 className="text-xl font-semibold text-slate-900">移植结果：目标版本</h2>
            <div className="flex-1 h-px bg-white ml-4" />
          </div>
          <DiffCodeBlock 
            title="目标版本差异 — 基于修复版本的 AI 移植结果"
            lines={diff2}
            accentColor="green"
          />
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