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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
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
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflow
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GitCompare className="w-8 h-8 text-cyan-400" />
                <h1 className="text-3xl font-bold text-white">
                  Three-way Code Comparison
                </h1>
              </div>
              <p className="text-gray-400">
                Hierarchical patch migration analysis across vulnerable, patched, and target versions
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300">AI Analysis</span>
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
            <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-emerald-500 rounded-full" />
            <h2 className="text-xl font-semibold text-white">
              Primary Comparison: Vulnerability vs Patch
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CodeBlock
              title="Vulnerable Version (Original)"
              lines={vulnerableCode}
              accentColor="red"
              onLineHover={setHoveredLine}
            />
            <CodeBlock
              title="Patched Version (Fixed)"
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
          <div className="flex items-center gap-4 px-6 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-full">
            <ArrowDown className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-300 font-mono">
              Semantic mapping & transformation
            </span>
            <ArrowDown className="w-5 h-5 text-cyan-400" />
          </div>
        </motion.div>

        {/* Secondary Panel: Target Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-orange-500 rounded-full" />
            <h2 className="text-xl font-semibold text-white">
              Migrated Result: Target Version
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CodeBlock
              title="Target Version (After AI Migration)"
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
          className="mt-6 bg-slate-900/50 backdrop-blur-sm border border-orange-500/30 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-300">
              AI Patch Migration Analysis
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded p-3 border border-white/5">
                <p className="text-gray-500 mb-1">Vulnerability Type</p>
                <p className="text-white font-mono">Buffer Overflow (CWE-120)</p>
              </div>
              <div className="bg-slate-800/50 rounded p-3 border border-white/5">
                <p className="text-gray-500 mb-1">Patch Strategy</p>
                <p className="text-white font-mono">Bounds Checking</p>
              </div>
              <div className="bg-slate-800/50 rounded p-3 border border-white/5">
                <p className="text-gray-500 mb-1">Confidence Score</p>
                <p className="text-emerald-400 font-mono">97.8%</p>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-4 border border-white/5">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Semantic Transformations Applied:
              </h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-gray-400">Function name:</span>
                  <span className="text-red-400">process_input()</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-emerald-400">handle_data()</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-gray-400">Variable name:</span>
                  <span className="text-red-400">buffer</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-emerald-400">temp_buf</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-gray-400">Parameter name:</span>
                  <span className="text-red-400">input</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-emerald-400">user_input</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-gray-400">Core fix:</span>
                  <span className="text-orange-300">strcpy() replaced with strncpy() + null termination</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-900/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-sm text-emerald-300">
                <strong>✓ Verification Passed:</strong> The patch has been successfully migrated to the target version 
                while preserving the security fix and adapting to the different code structure.
              </p>
            </div>
          </div>

          {/* View Semantic Mapping Button */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <Button
              onClick={() => navigate('/semantic-mapping')}
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white"
            >
              <Network className="w-4 h-4 mr-2" />
              View Detailed Semantic Mapping Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}