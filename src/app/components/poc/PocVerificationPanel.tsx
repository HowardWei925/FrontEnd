import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Shield, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { PocInput } from './PocInput';
import { PocResultCard } from './PocResultCard';
import type { PocInput as PocInputType, PocVerificationResult } from '../../lib/agent-types';
import { executeTool } from '../../lib/agent-tools';

interface PocVerificationPanelProps {
  targetCode?: string;
  diff?: { before: string[]; after: string[] };
}

export function PocVerificationPanel({ targetCode, diff }: PocVerificationPanelProps) {
  const [pocs, setPocs] = useState<PocInputType[]>([]);
  const [results, setResults] = useState<PocVerificationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPocIndex, setCurrentPocIndex] = useState(-1);

  const runVerification = useCallback(async () => {
    if (pocs.length === 0 || isRunning) return;

    setIsRunning(true);
    setResults([]);
    const newResults: PocVerificationResult[] = [];

    for (let i = 0; i < pocs.length; i++) {
      setCurrentPocIndex(i);
      const poc = pocs[i];

      try {
        const result = await executeTool('verifyPoc', {
          pocContent: poc.content,
          pocType: poc.type,
          targetCode: targetCode || '',
        });

        if (result.success) {
          newResults.push(result.data as PocVerificationResult);
        } else {
          newResults.push({
            pocId: poc.id,
            status: 'error',
            steps: [],
            summary: `验证出错: ${result.error}`,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        newResults.push({
          pocId: poc.id,
          status: 'error',
          steps: [],
          summary: `执行异常: ${err instanceof Error ? err.message : '未知错误'}`,
          timestamp: Date.now(),
        });
      }

      setResults([...newResults]);
    }

    setCurrentPocIndex(-1);
    setIsRunning(false);
  }, [pocs, isRunning, targetCode]);

  const reset = () => {
    setPocs([]);
    setResults([]);
    setCurrentPocIndex(-1);
  };

  const passedCount = results.filter(r => r.status === 'passed').length;
  const totalCount = results.length;

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">PoC 自动验证</h2>
            <p className="text-sm text-slate-500">验证补丁是否有效防御漏洞</p>
          </div>
        </div>
        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              passedCount === totalCount
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {passedCount}/{totalCount} 通过
            </div>
          </div>
        )}
      </div>

      {/* PoC 输入 */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
        <PocInput pocs={pocs} onChange={setPocs} maxPocs={5} />
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-3">
        <Button
          onClick={runVerification}
          disabled={pocs.length === 0 || isRunning}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {isRunning ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              验证中... ({currentPocIndex + 1}/{pocs.length})
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              开始验证 ({pocs.length} 个 PoC)
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={reset}
          disabled={isRunning}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      {/* 验证结果 */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-sm font-medium text-slate-700">验证结果</h3>
          {results.map((result) => (
            <PocResultCard key={result.pocId} result={result} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
