import { Shield, Search, Terminal, Play, GitCompare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { CWEResult, SecurityAuditResult, ToolCall, CommandResult, DiffAdjustment } from '../../lib/agent-types';
import { CWEResultCard } from './CWEResultCard';
import { SecurityAuditCard } from './SecurityAuditCard';
import { CommandResultCard } from './CommandResultCard';
import { DiffAdjustCard } from './DiffAdjustCard';
import { ToolCallDisplay } from './ToolCallDisplay';

interface AnalysisPanelProps {
  cweResults: CWEResult[];
  auditResults: SecurityAuditResult[];
  commandResults: CommandResult[];
  diffAdjustments: DiffAdjustment[];
  toolCalls: ToolCall[];
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="size-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function AnalysisPanel({ cweResults, auditResults, commandResults, diffAdjustments, toolCalls }: AnalysisPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-cyan-600" />
          <span className="text-sm font-semibold text-slate-800">分析结果</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cwe" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-4 pt-3 overflow-x-auto">
          <TabsList className="w-full">
            <TabsTrigger value="cwe" className="flex-1 gap-1.5">
              <Shield className="size-3.5" />
              CWE
              {cweResults.length > 0 && (
                <span className="ml-1 size-4 rounded-full bg-cyan-100 text-cyan-700 text-[10px] flex items-center justify-center">
                  {cweResults.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex-1 gap-1.5">
              <Search className="size-3.5" />
              审计
              {auditResults.length > 0 && (
                <span className="ml-1 size-4 rounded-full bg-cyan-100 text-cyan-700 text-[10px] flex items-center justify-center">
                  {auditResults.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="commands" className="flex-1 gap-1.5">
              <Play className="size-3.5" />
              验证
              {commandResults.length > 0 && (
                <span className="ml-1 size-4 rounded-full bg-cyan-100 text-cyan-700 text-[10px] flex items-center justify-center">
                  {commandResults.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="diff" className="flex-1 gap-1.5">
              <GitCompare className="size-3.5" />
              Diff
              {diffAdjustments.length > 0 && (
                <span className="ml-1 size-4 rounded-full bg-cyan-100 text-cyan-700 text-[10px] flex items-center justify-center">
                  {diffAdjustments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex-1 gap-1.5">
              <Terminal className="size-3.5" />
              日志
              {toolCalls.length > 0 && (
                <span className="ml-1 size-4 rounded-full bg-cyan-100 text-cyan-700 text-[10px] flex items-center justify-center">
                  {toolCalls.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 min-h-0">
          <TabsContent value="cwe">
            {cweResults.length === 0 ? (
              <EmptyState icon={Shield} text="等待漏洞分析结果..." />
            ) : (
              <div className="space-y-3">
                {cweResults.map((result) => (
                  <CWEResultCard key={result.cweId} result={result} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit">
            {auditResults.length === 0 ? (
              <EmptyState icon={Search} text="等待安全审计结果..." />
            ) : (
              <div className="space-y-3">
                {auditResults.map((result, i) => (
                  <SecurityAuditCard key={i} result={result} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="commands">
            {commandResults.length === 0 ? (
              <EmptyState icon={Play} text="等待命令执行结果..." />
            ) : (
              <div className="space-y-3">
                {commandResults.map((result, i) => (
                  <CommandResultCard key={i} result={result} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="diff">
            {diffAdjustments.length === 0 ? (
              <EmptyState icon={GitCompare} text="等待 Diff 微调结果..." />
            ) : (
              <div className="space-y-3">
                {diffAdjustments.map((adj, i) => (
                  <DiffAdjustCard key={i} adjustment={adj} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools">
            {toolCalls.length === 0 ? (
              <EmptyState icon={Terminal} text="暂无工具调用记录" />
            ) : (
              <div className="space-y-2">
                {toolCalls.map((tc) => (
                  <ToolCallDisplay key={tc.id} toolCall={tc} />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
