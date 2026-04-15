import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, GitCompare, ArrowDown, Info, Sparkles, ArrowRight, Network } from 'lucide-react';
import { useNavigate } from 'react-router';
import { CodeBlock } from '../components/CodeBlock';
import { Button } from '../components/ui/button';

// Sample code data
const vulnerableCode = [
  { number: 1, content: '#include <stdio.h>', type: 'normal' as const },
  { number: 2, content: '#include <string.h>', type: 'normal' as const },
  { number: 3, content: '', type: 'normal' as const },
  { number: 4, content: 'void process_input(char *input) {', type: 'normal' as const },
  { number: 5, content: '    char buffer[64];', type: 'normal' as const },
  { number: 6, content: '    strcpy(buffer, input);  // Vulnerable!', type: 'remove' as const },
  { number: 7, content: '    printf("Processed: %s\\n", buffer);', type: 'normal' as const },
  { number: 8, content: '}', type: 'normal' as const },
  { number: 9, content: '', type: 'normal' as const },
  { number: 10, content: 'int main(int argc, char **argv) {', type: 'normal' as const },
  { number: 11, content: '    if (argc < 2) return 1;', type: 'normal' as const },
  { number: 12, content: '    process_input(argv[1]);', type: 'normal' as const },
  { number: 13, content: '    return 0;', type: 'normal' as const },
  { number: 14, content: '}', type: 'normal' as const },
];

const patchedCode = [
  { number: 1, content: '#include <stdio.h>', type: 'normal' as const },
  { number: 2, content: '#include <string.h>', type: 'normal' as const },
  { number: 3, content: '', type: 'normal' as const },
  { number: 4, content: 'void process_input(char *input) {', type: 'normal' as const },
  { number: 5, content: '    char buffer[64];', type: 'normal' as const },
  { number: 6, content: '    // Boundary check added', type: 'add' as const },
  { number: 7, content: '    strncpy(buffer, input, sizeof(buffer) - 1);', type: 'add' as const },
  { number: 8, content: '    buffer[sizeof(buffer) - 1] = \'\\0\';', type: 'add' as const },
  { number: 9, content: '    printf("Processed: %s\\n", buffer);', type: 'normal' as const },
  { number: 10, content: '}', type: 'normal' as const },
  { number: 11, content: '', type: 'normal' as const },
  { number: 12, content: 'int main(int argc, char **argv) {', type: 'normal' as const },
  { number: 13, content: '    if (argc < 2) return 1;', type: 'normal' as const },
  { number: 14, content: '    process_input(argv[1]);', type: 'normal' as const },
  { number: 15, content: '    return 0;', type: 'normal' as const },
  { number: 16, content: '}', type: 'normal' as const },
];

const targetCode = [
  { number: 1, content: '#include <stdio.h>', type: 'normal' as const },
  { number: 2, content: '#include <string.h>', type: 'normal' as const },
  { number: 3, content: '#include "utils.h"', type: 'normal' as const },
  { number: 4, content: '', type: 'normal' as const },
  { number: 5, content: '// Target version has different variable names', type: 'normal' as const },
  { number: 6, content: 'void handle_data(char *user_input) {', type: 'normal' as const },
  { number: 7, content: '    char temp_buf[64];', type: 'normal' as const },
  { number: 8, content: '    // AI-migrated patch applied here', type: 'highlight' as const },
  { number: 9, content: '    strncpy(temp_buf, user_input, sizeof(temp_buf) - 1);', type: 'highlight' as const },
  { number: 10, content: '    temp_buf[sizeof(temp_buf) - 1] = \'\\0\';', type: 'highlight' as const },
  { number: 11, content: '    log_message("Data: %s\\n", temp_buf);', type: 'normal' as const },
  { number: 12, content: '}', type: 'normal' as const },
  { number: 13, content: '', type: 'normal' as const },
  { number: 14, content: 'int main(int argc, char **argv) {', type: 'normal' as const },
  { number: 15, content: '    if (argc < 2) return 1;', type: 'normal' as const },
  { number: 16, content: '    handle_data(argv[1]);', type: 'normal' as const },
  { number: 17, content: '    return 0;', type: 'normal' as const },
  { number: 18, content: '}', type: 'normal' as const },
];

export function CodeComparisonPage() {
  const navigate = useNavigate();
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<number | null>(null);

  const mappings = [
    { vulnerable: 6, patched: [6, 7, 8], target: [9, 10], description: 'strcpy → strncpy with bounds check' },
  ];

  return (
    <div className="min-h-screen bg-white  relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            
            
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Accent Gradient */}
      <motion.div
        className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.1, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-[1800px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
                <h1 className="text-3xl font-bold text-slate-900">
                  三方代码对比
                </h1>
              </div>
              <p className="text-slate-600">
                跨漏洞版本、修复版本和目标版本的分层补丁移植分析
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-400 rounded-lg">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span className="text-sm text-cyan-700">AI 分析</span>
            </div>
          </div>
        </motion.div>

        {/* Primary Comparison: Vulnerable vs Patched */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-white rounded-full" />
            <h2 className="text-xl font-semibold text-slate-900">
              基础对比：漏洞版本 vs 修复版本
            </h2>
            <div className="flex-1 h-px bg-white ml-4" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CodeBlock
              title="漏洞版本 (原始代码)"
              lines={vulnerableCode}
              accentColor="red"
              onLineHover={setHoveredLine}
            />
            <CodeBlock
              title="修复版本 (已修复)"
              lines={patchedCode}
              accentColor="green"
              onLineHover={setHoveredLine}
            />
          </div>
        </motion.div>

        {/* Mapping Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center my-6"
        >
          <div className="flex items-center gap-4 px-6 py-3 bg-slate-100/50 border border-cyan-400 rounded-full">
            <ArrowDown className="w-5 h-5 text-cyan-600" />
            <span className="text-sm text-slate-600 font-mono">
              语义映射与代码转换
            </span>
            <ArrowDown className="w-5 h-5 text-cyan-600" />
          </div>
        </motion.div>

        {/* Secondary Panel: Target Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-white rounded-full" />
            <h2 className="text-xl font-semibold text-slate-900">
              移植结果：目标版本
            </h2>
            <div className="flex-1 h-px bg-white ml-4" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CodeBlock
              title="目标版本 (AI 移植后)"
              lines={targetCode}
              accentColor="cyan"
              highlightedLines={[9, 10]}
            />
          </div>
        </motion.div>

        {/* Analysis Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white/80 backdrop-blur-sm border border-orange-400 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-700">
              AI 补丁移植分析
            </h3>
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
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                已应用的语义转换：
              </h4>
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
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-slate-600">核心修复:</span>
                  <span className="text-orange-700">使用 strncpy() 替换 strcpy() 并添加空字符结尾</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-emerald-400 rounded-lg p-4">
              <p className="text-sm text-emerald-700">
                <strong>✓ 验证通过：</strong> 补丁已成功移植到目标版本，在保留安全修复的同时适应了新的代码结构。
              </p>
            </div>
          </div>

          {/* View Semantic Mapping Button */}
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