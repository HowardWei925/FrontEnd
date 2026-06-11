import { motion } from 'motion/react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { SecurityAuditResult, AuditFinding } from '../../lib/agent-types';

const riskConfig = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', icon: ShieldAlert, label: '严重风险', color: 'text-red-600' },
  high: { bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle, label: '高风险', color: 'text-orange-600' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Info, label: '中等风险', color: 'text-yellow-600' },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, label: '低风险', color: 'text-blue-600' },
  safe: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: ShieldCheck, label: '安全', color: 'text-emerald-600' },
};

const severityBadge = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

function FindingItem({ finding }: { finding: AuditFinding }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border border-slate-200 rounded-lg p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={severityBadge[finding.severity]}>
            {finding.severity.toUpperCase()}
          </Badge>
          <span className="text-sm font-medium text-slate-800">{finding.title}</span>
        </div>
        {finding.cweId && (
          <span className="font-mono text-xs text-slate-500">{finding.cweId}</span>
        )}
      </div>
      <div className="text-xs text-slate-500">
        位置：<span className="font-mono text-slate-700">{finding.location}</span>
      </div>
      <p className="text-sm text-slate-600">{finding.description}</p>
      <div className="bg-cyan-50 border border-cyan-100 rounded p-2">
        <p className="text-xs text-cyan-800">
          <span className="font-medium">修复建议：</span>{finding.recommendation}
        </p>
      </div>
    </motion.div>
  );
}

export function SecurityAuditCard({ result }: { result: SecurityAuditResult }) {
  const config = riskConfig[result.overallRisk];
  const RiskIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className={`${config.bg} ${config.border} border rounded-lg p-3 flex items-center gap-3`}>
            <RiskIcon className={`size-6 ${config.color}`} />
            <div>
              <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{result.summary}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">发现的安全问题</span>
            <Badge variant="outline" className="bg-slate-50">
              {result.findings.length} 项
            </Badge>
          </div>
          <div className="space-y-3">
            {result.findings.map((finding) => (
              <FindingItem key={finding.id} finding={finding} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
