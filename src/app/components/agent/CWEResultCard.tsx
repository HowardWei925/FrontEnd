import { motion } from 'motion/react';
import { ShieldAlert, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { CWEResult } from '../../lib/agent-types';

const severityConfig = {
  critical: { color: 'bg-red-100 text-red-700 border-red-200', icon: ShieldAlert, label: '严重' },
  high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle, label: '高危' },
  medium: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: Info, label: '中危' },
  low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Info, label: '低危' },
};

export function CWEResultCard({ result }: { result: CWEResult }) {
  const config = severityConfig[result.severity];
  const SeverityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200 hover:border-cyan-300 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <SeverityIcon className="size-5 text-slate-600" />
              <CardTitle className="text-base font-semibold text-slate-900">
                {result.cweId}
              </CardTitle>
              <Badge variant="outline" className={config.color}>
                {config.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <span className="font-mono font-medium">CVSS {result.cvssScore}</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-700 mt-1">{result.name}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">{result.description}</p>

          {result.affectedFunctions.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">受影响函数：</p>
              <div className="flex flex-wrap gap-1.5">
                {result.affectedFunctions.map((fn) => (
                  <span
                    key={fn}
                    className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                  >
                    {fn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.recommendations.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">修复建议：</p>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-cyan-500 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <a
            href={`https://cwe.mitre.org/data/definitions/${result.cweId.replace('CWE-', '')}.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            查看 CWE 官方文档
            <ExternalLink className="size-3" />
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}
