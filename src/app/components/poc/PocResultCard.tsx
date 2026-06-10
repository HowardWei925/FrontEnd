import { motion } from 'motion/react';
import {
  CheckCircle2, XCircle, Loader2, AlertCircle, Clock,
  ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { useState } from 'react';
import type { PocVerificationResult, VerificationStep, VerificationStatus } from '../../lib/agent-types';

interface PocResultCardProps {
  result: PocVerificationResult;
}

const statusConfig: Record<VerificationStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', label: '等待中' },
  running: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', label: '执行中' },
  passed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: '通过' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: '失败' },
  error: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: '错误' },
};

function StepItem({ step, index }: { step: VerificationStep; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[step.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      className="border border-slate-100 rounded-lg overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${config.color} ${step.status === 'running' ? 'animate-spin' : ''}`} />
          </div>
          <span className="text-sm font-medium text-slate-700">{step.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {step.duration && (
            <span className="text-xs text-slate-400">{step.duration}ms</span>
          )}
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-3 pb-3 border-t border-slate-100"
        >
          {step.command && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-1">执行命令</p>
              <code className="block p-2 bg-slate-900 text-emerald-400 rounded text-xs font-mono">
                $ {step.command}
              </code>
            </div>
          )}
          {step.stdout && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-1">标准输出</p>
              <pre className="p-2 bg-slate-50 rounded text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                {step.stdout}
              </pre>
            </div>
          )}
          {step.stderr && (
            <div className="mt-2">
              <p className="text-xs text-red-500 mb-1">错误输出</p>
              <pre className="p-2 bg-red-50 rounded text-xs text-red-700 whitespace-pre-wrap">
                {step.stderr}
              </pre>
            </div>
          )}
          {step.exitCode !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">退出码:</span>
              <code className={`text-xs font-mono ${step.exitCode === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {step.exitCode}
              </code>
            </div>
          )}
          {step.error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {step.error}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export function PocResultCard({ result }: PocResultCardProps) {
  const config = statusConfig[result.status];
  const Icon = config.icon;
  const passedCount = result.steps.filter(s => s.status === 'passed').length;
  const totalCount = result.steps.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-2 rounded-xl overflow-hidden ${
        result.status === 'passed' ? 'border-emerald-200' :
        result.status === 'failed' ? 'border-red-200' :
        'border-slate-200'
      }`}
    >
      {/* 头部 */}
      <div className={`p-4 ${config.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center border ${
              result.status === 'passed' ? 'border-emerald-200' :
              result.status === 'failed' ? 'border-red-200' :
              'border-slate-200'
            }`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">PoC 验证结果</h3>
              <p className="text-xs text-slate-500">
                {passedCount}/{totalCount} 步骤通过
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            result.status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
            result.status === 'failed' ? 'bg-red-100 text-red-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {result.status === 'passed' ? '✅ 补丁有效' :
             result.status === 'failed' ? '❌ 补丁无效' :
             config.label}
          </div>
        </div>
      </div>

      {/* 摘要 */}
      <div className="p-4 bg-white border-b border-slate-100">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-700">{result.summary}</p>
        </div>
      </div>

      {/* 步骤详情 */}
      <div className="p-4 bg-white space-y-2">
        {result.steps.map((step, index) => (
          <StepItem key={step.id} step={step} index={index} />
        ))}
      </div>

      {/* 时间戳 */}
      <div className="px-4 py-2 bg-slate-50 text-xs text-slate-400 text-right">
        验证时间: {new Date(result.timestamp).toLocaleString('zh-CN')}
      </div>
    </motion.div>
  );
}
