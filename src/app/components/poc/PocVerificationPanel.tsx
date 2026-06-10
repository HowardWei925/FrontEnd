import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Shield, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { PocInput } from './PocInput';
import { PocResultCard } from './PocResultCard';
import type { PocInput as PocInputType, PocVerificationResult } from '../../lib/agent-types';
import { executeTool } from '../../lib/agent-tools';

interface PocVerificationPanelProps {
  targetCode?: string;
  diff?: { before: string[]; after: string[] };
  initialPocs?: PocInputType[];
  initialResults?: PocVerificationResult[];
  onVerificationComplete?: (results: PocVerificationResult[]) => void;
}

export function PocVerificationPanel({
  targetCode,
  diff,
  initialPocs,
  initialResults,
  onVerificationComplete,
}: PocVerificationPanelProps) {
  const [pocs, setPocs] = useState<PocInputType[]>(initialPocs || []);
  const [results, setResults] = useState<PocVerificationResult[]>(initialResults || []);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPocIndex, setCurrentPocIndex] = useState(-1);

  // 从 sessionStorage 读取初始数据
  useEffect(() => {
    if (!initialPocs) {
      const stored = sessionStorage.getItem('poc_inputs');
      if (stored) {
        try {
          setPocs(JSON.parse(stored));
        } catch { /* ignore */ }
      }
    }
    if (!initialResults) {
      const storedResults = sessionStorage.getItem('poc_results');
      if (storedResults) {
        try {
          setResults(JSON.parse(storedResults));
        } catch { /* ignore */ }
      }
    }
    if (!targetCode) {
      const storedCode = sessionStorage.getItem('target_code');
      if (storedCode) {
        // 这里需要通过 props 传入，或者直接使用
      }
    }
  }, [initialPocs, initialResults, targetCode]);

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

    // 存储结果到 sessionStorage
    sessionStorage.setItem('poc_results', JSON.stringify(newResults));

    // 回调通知父组件
    if (onVerificationComplete) {
      onVerificationComplete(newResults);
    }
  }, [pocs, isRunning, targetCode, onVerificationComplete]);

  const reset = () => {
    setPocs([]);
    setResults([]);
    setCurrentPocIndex(-1);
    sessionStorage.removeItem('poc_results');
  };

  const retryVerification = () => {
    setResults([]);
    runVerification();
  };

  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const totalCount = results.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;
  const hasFailed = failedCount > 0;

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
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            {allPassed ? (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                全部通过
              </div>
            ) : hasFailed ? (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                <XCircle className="w-4 h-4" />
                {failedCount} 个失败
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                {passedCount}/{totalCount} 通过
              </div>
            )}
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
          ) : totalCount > 0 && hasFailed ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              重新验证 ({pocs.length} 个 PoC)
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
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700">验证结果</h3>
            {hasFailed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retryVerification}
                disabled={isRunning}
                className="text-orange-600 hover:text-orange-700"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                重试失败项
              </Button>
            )}
          </div>
          {results.map((result) => (
            <PocResultCard key={result.pocId} result={result} />
          ))}
        </motion.div>
      )}

      {/* 验证通过提示 */}
      {allPassed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700">补丁验证通过</p>
              <p className="text-sm text-emerald-600">所有 PoC 均未能触发漏洞，补丁有效。</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 验证失败提示 */}
      {hasFailed && !isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium text-red-700">补丁验证失败</p>
              <p className="text-sm text-red-600">
                {failedCount} 个 PoC 成功触发漏洞，建议修改补丁或 PoC 后重试。
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
