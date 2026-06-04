import { motion } from 'motion/react';
import { Terminal, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { CommandResult } from '../../lib/agent-types';

export function CommandResultCard({ result }: { result: CommandResult }) {
  const success = result.exitCode === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200 hover:border-cyan-300 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-slate-600" />
              <CardTitle className="text-sm font-semibold text-slate-800">命令执行结果</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {success ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <XCircle className="size-4 text-red-500" />
              )}
              <span className={`text-xs font-mono ${success ? 'text-emerald-600' : 'text-red-600'}`}>
                exit: {result.exitCode}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="size-3" />
                {result.duration}ms
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.stdout && (
            <div>
              <p className="text-xs text-slate-500 mb-1">stdout:</p>
              <pre className="font-mono text-xs bg-slate-50 rounded p-2 overflow-x-auto text-slate-700 max-h-32 overflow-y-auto">
                {result.stdout}
              </pre>
            </div>
          )}
          {result.stderr && (
            <div>
              <p className="text-xs text-red-500 mb-1">stderr:</p>
              <pre className="font-mono text-xs bg-red-50 rounded p-2 overflow-x-auto text-red-700 max-h-32 overflow-y-auto">
                {result.stderr}
              </pre>
            </div>
          )}
          {!result.stdout && !result.stderr && (
            <p className="text-xs text-slate-400 italic">无输出</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
