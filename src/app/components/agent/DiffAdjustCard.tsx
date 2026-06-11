import { motion } from 'motion/react';
import { GitCompare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { DiffAdjustment } from '../../lib/agent-types';

export function DiffAdjustCard({ adjustment }: { adjustment: DiffAdjustment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200 hover:border-cyan-300 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <GitCompare className="size-4 text-cyan-600" />
            <CardTitle className="text-sm font-semibold text-slate-800">Diff 微调结果</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Changes list */}
          <div>
            <p className="text-xs text-slate-500 mb-1">变更说明：</p>
            <ul className="space-y-1">
              {adjustment.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <ArrowRight className="size-3 text-cyan-500 mt-0.5 shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>

          {/* Reasoning */}
          {adjustment.reasoning && (
            <div className="bg-cyan-50 border border-cyan-100 rounded p-2">
              <p className="text-xs text-cyan-800">{adjustment.reasoning}</p>
            </div>
          )}

          {/* New diff */}
          <div>
            <p className="text-xs text-slate-500 mb-1">修改后的 diff：</p>
            <pre className="font-mono text-xs bg-slate-50 rounded p-2 overflow-x-auto text-slate-700 max-h-48 overflow-y-auto">
              {adjustment.newDiff}
            </pre>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
