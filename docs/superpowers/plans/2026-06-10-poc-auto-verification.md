# PoC 自动验证功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 PoC 自动验证流程，支持用户提供 PoC 代码或验证命令，系统自动验证补丁有效性

**Architecture:** 
- 前端新增 PoC 输入组件和验证结果展示组件
- 使用 mock 模式模拟后端执行，预留 API 接口
- 验证流程整合到现有工作流（TaskCreation → Workflow → Agent）

**Tech Stack:** React, TypeScript, shadcn/ui, motion/react, lucide-react

---

## 文件结构

### 新增文件
- `src/app/components/poc/PocInput.tsx` - PoC 输入组件（代码/命令两种模式）
- `src/app/components/poc/PocResultCard.tsx` - 单条验证结果卡片
- `src/app/components/poc/PocVerificationPanel.tsx` - 验证面板（整合输入+结果+状态）
- `src/app/components/poc/index.ts` - 导出入口

### 修改文件
- `src/app/lib/agent-types.ts` - 增加 PoC 相关类型定义
- `src/app/lib/agent-tools.ts` - 增强 mock 验证逻辑
- `src/app/pages/TaskCreationPage.tsx` - 增加 PoC 输入区域
- `src/app/pages/WorkflowPage.tsx` - 验证步骤改为真实流程
- `src/app/pages/CodeComparisonPage.tsx` - 传递 PoC 数据到 AgentPage
- `src/app/pages/AgentPage.tsx` - 增加验证面板
- `src/app/components/agent/AnalysisPanel.tsx` - 展示验证结果

---

## Task 1: 类型定义

**Files:**
- Modify: `src/app/lib/agent-types.ts`

- [ ] **Step 1: 添加 PoC 相关类型**

```typescript
// 在 agent-types.ts 末尾添加

export type PocType = 'code' | 'command';

export interface PocInput {
  id: string;
  type: PocType;
  content: string;           // PoC 代码或验证命令
  language?: string;         // 代码语言（c, python, bash 等）
  description?: string;      // 用户对 PoC 的说明
}

export type VerificationStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error';

export interface PocVerificationResult {
  pocId: string;
  status: VerificationStatus;
  steps: VerificationStep[];
  summary: string;
  timestamp: number;
}

export interface VerificationStep {
  id: string;
  name: string;              // 步骤名称：编译、执行PoC、检查结果
  status: VerificationStatus;
  command?: string;          // 执行的命令
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  duration?: number;         // 毫秒
  error?: string;
}
```

- [ ] **Step 2: 验证类型无语法错误**

Run: `npx tsc --noEmit src/app/lib/agent-types.ts`
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add src/app/lib/agent-types.ts
git commit -m "feat: add PoC verification type definitions"
```

---

## Task 2: 增强 Mock 验证逻辑

**Files:**
- Modify: `src/app/lib/agent-tools.ts`

- [ ] **Step 1: 添加 PoC 验证 mock 函数**

```typescript
// 在 agent-tools.ts 中添加新的 mock 函数

function mockVerifyPoc(args: Record<string, unknown>): ToolResult {
  const pocContent = (args.pocContent as string) || '';
  const pocType = (args.pocType as string) || 'command';
  const targetCode = (args.targetCode as string) || '';

  const steps: VerificationStep[] = [];
  const lower = pocContent.toLowerCase();

  // Step 1: 编译（如果是代码）
  if (pocType === 'code' || lower.includes('gcc') || lower.includes('compile')) {
    steps.push({
      id: 'step-1',
      name: '编译目标代码',
      status: 'passed',
      command: 'gcc -o target target.c -fstack-protector-all',
      stdout: '',
      stderr: '',
      exitCode: 0,
      duration: 1200,
    });
  }

  // Step 2: 执行 PoC
  const isExploit = lower.includes('exploit') || lower.includes('payload') || 
                    lower.includes('overflow') || lower.includes('inject') ||
                    lower.includes('$(python') || lower.includes('shellcode');

  steps.push({
    id: `step-${steps.length + 1}`,
    name: '执行 PoC 验证',
    status: isExploit ? 'passed' : 'passed',  // 补丁后应该防御成功
    command: pocType === 'command' ? pocContent : './poc_exploit',
    stdout: isExploit 
      ? 'PoC 执行完成\n检测到边界检查生效，输入被安全截断\n程序正常退出，未触发崩溃'
      : '验证命令执行成功',
    stderr: '',
    exitCode: 0,
    duration: 150,
  });

  // Step 3: 检查安全性
  steps.push({
    id: `step-${steps.length + 1}`,
    name: '安全检查',
    status: 'passed',
    command: 'echo "Checking for vulnerabilities..."',
    stdout: '未检测到内存损坏\n栈保护 canary 完整\nASLR 正常工作',
    stderr: '',
    exitCode: 0,
    duration: 80,
  });

  const allPassed = steps.every(s => s.status === 'passed');

  return {
    success: true,
    data: {
      pocId: `poc-${Date.now()}`,
      status: allPassed ? 'passed' : 'failed',
      steps,
      summary: allPassed 
        ? '✅ 补丁验证通过：PoC 未能触发漏洞，补丁有效防御了攻击'
        : '❌ 补丁验证失败：PoC 成功触发漏洞，补丁可能无效',
      timestamp: Date.now(),
    },
  };
}
```

- [ ] **Step 2: 注册新工具到 toolDefinitions**

```typescript
// 在 toolDefinitions 数组末尾添加
{
  type: 'function',
  function: {
    name: 'verifyPoc',
    description: '验证 PoC（概念验证）是否能触发漏洞。用于确认补丁的有效性。返回编译、执行、安全检查等步骤的结果。',
    parameters: {
      type: 'object',
      properties: {
        pocContent: { type: 'string', description: 'PoC 代码内容或验证命令' },
        pocType: { type: 'string', description: 'PoC 类型：code（代码）或 command（命令）' },
        targetCode: { type: 'string', description: '目标代码（打了补丁后的版本）' },
      },
      required: ['pocContent'],
    },
  },
},
```

- [ ] **Step 3: 注册到 mockExecutors**

```typescript
const mockExecutors: Record<string, (args: Record<string, unknown>) => ToolResult> = {
  analyzeAST: mockAnalyzeAST,
  getPDG: mockGetPDG,
  getCWEInfo: mockGetCWEInfo,
  runCommand: mockRunCommand,
  adjustDiff: mockAdjustDiff,
  verifyPoc: mockVerifyPoc,  // 新增
};
```

- [ ] **Step 4: 更新 imports**

```typescript
// 在文件顶部 import 类型
import type { OpenAIToolDefinition, ToolResult, VerificationStep } from './agent-types';
```

- [ ] **Step 5: Commit**

```bash
git add src/app/lib/agent-tools.ts
git commit -m "feat: add verifyPoc mock tool with multi-step verification"
```

---

## Task 3: PoC 输入组件

**Files:**
- Create: `src/app/components/poc/PocInput.tsx`
- Create: `src/app/components/poc/index.ts`

- [ ] **Step 1: 创建 PocInput 组件**

```typescript
// src/app/components/poc/PocInput.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Terminal, Plus, Trash2, FileCode, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { PocInput as PocInputType, PocType } from '../../lib/agent-types';

interface PocInputProps {
  pocs: PocInputType[];
  onChange: (pocs: PocInputType[]) => void;
  maxPocs?: number;
}

export function PocInput({ pocs, onChange, maxPocs = 5 }: PocInputProps) {
  const [activeTab, setActiveTab] = useState<PocType>('command');

  const addPoc = () => {
    const newPoc: PocInputType = {
      id: `poc-${Date.now()}`,
      type: activeTab,
      content: '',
      language: activeTab === 'code' ? 'c' : undefined,
      description: '',
    };
    onChange([...pocs, newPoc]);
  };

  const updatePoc = (id: string, updates: Partial<PocInputType>) => {
    onChange(pocs.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePoc = (id: string) => {
    onChange(pocs.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Tab 切换 */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('command')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'command'
              ? 'bg-white text-cyan-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          验证命令
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'code'
              ? 'bg-white text-cyan-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          PoC 代码
        </button>
      </div>

      {/* 说明文字 */}
      <div className="flex items-start gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-cyan-700">
          {activeTab === 'command' 
            ? '输入用于验证漏洞是否修复的命令，如编译命令、测试脚本、PoC 执行命令等'
            : '粘贴 PoC 漏洞利用代码，系统将自动编译并执行验证'
          }
        </p>
      </div>

      {/* PoC 列表 */}
      <div className="space-y-3">
        {pocs.map((poc, index) => (
          <motion.div
            key={poc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-cyan-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {poc.type === 'code' ? (
                  <FileCode className="w-4 h-4 text-purple-600" />
                ) : (
                  <Terminal className="w-4 h-4 text-cyan-600" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  PoC #{index + 1}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePoc(poc.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* 描述 */}
            <div className="mb-3">
              <Label className="text-xs text-slate-500 mb-1">描述（可选）</Label>
              <Input
                value={poc.description || ''}
                onChange={(e) => updatePoc(poc.id, { description: e.target.value })}
                placeholder="例如：缓冲区溢出 PoC、SQL 注入测试..."
                className="h-8 text-sm"
              />
            </div>

            {/* 语言选择（代码模式） */}
            {poc.type === 'code' && (
              <div className="mb-3">
                <Label className="text-xs text-slate-500 mb-1">语言</Label>
                <select
                  value={poc.language || 'c'}
                  onChange={(e) => updatePoc(poc.id, { language: e.target.value })}
                  className="w-full h-8 px-3 text-sm border border-slate-200 rounded-md"
                >
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="bash">Bash</option>
                </select>
              </div>
            )}

            {/* 内容输入 */}
            <div>
              <Label className="text-xs text-slate-500 mb-1">
                {poc.type === 'command' ? '验证命令' : 'PoC 代码'}
              </Label>
              <Textarea
                value={poc.content}
                onChange={(e) => updatePoc(poc.id, { content: e.target.value })}
                placeholder={
                  poc.type === 'command'
                    ? 'gcc -o test test.c && ./test $(python -c "print(\'A\'*100)")'
                    : '#include <stdio.h>\n#include <string.h>\n\nint main() {\n  char buf[64];\n  strcpy(buf, "A" * 100);\n  return 0;\n}'
                }
                className="font-mono text-sm min-h-[100px] resize-y"
                rows={4}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 添加按钮 */}
      {pocs.length < maxPocs && (
        <Button
          variant="outline"
          onClick={addPoc}
          className="w-full border-dashed border-2 border-slate-300 hover:border-cyan-400 hover:text-cyan-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加 PoC（{pocs.length}/{maxPocs}）
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建导出入口**

```typescript
// src/app/components/poc/index.ts
export { PocInput } from './PocInput';
```

- [ ] **Step 3: 验证编译**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 4: Commit**

```bash
git add src/app/components/poc/
git commit -m "feat: add PocInput component with code/command modes"
```

---

## Task 4: 验证结果卡片组件

**Files:**
- Create: `src/app/components/poc/PocResultCard.tsx`
- Modify: `src/app/components/poc/index.ts`

- [ ] **Step 1: 创建 PocResultCard 组件**

```typescript
// src/app/components/poc/PocResultCard.tsx
import { motion } from 'motion/react';
import { 
  CheckCircle2, XCircle, Loader2, AlertCircle, Clock,
  ChevronDown, ChevronUp, Terminal, Shield
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
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
```

- [ ] **Step 2: 更新导出入口**

```typescript
// src/app/components/poc/index.ts
export { PocInput } from './PocInput';
export { PocResultCard } from './PocResultCard';
```

- [ ] **Step 3: 验证编译**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add src/app/components/poc/
git commit -m "feat: add PocResultCard component with multi-step display"
```

---

## Task 5: 验证面板组件

**Files:**
- Create: `src/app/components/poc/PocVerificationPanel.tsx`
- Modify: `src/app/components/poc/index.ts`

- [ ] **Step 1: 创建 PocVerificationPanel 组件**

```typescript
// src/app/components/poc/PocVerificationPanel.tsx
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Shield, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { PocInput } from './PocInput';
import { PocResultCard } from './PocResultCard';
import type { PocInput as PocInputType, PocVerificationResult, VerificationStep } from '../../lib/agent-types';
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
          {results.map((result, index) => (
            <PocResultCard key={result.pocId} result={result} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 更新导出入口**

```typescript
// src/app/components/poc/index.ts
export { PocInput } from './PocInput';
export { PocResultCard } from './PocResultCard';
export { PocVerificationPanel } from './PocVerificationPanel';
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/poc/
git commit -m "feat: add PocVerificationPanel with integrated workflow"
```

---

## Task 6: 修改 TaskCreationPage 增加 PoC 输入

**Files:**
- Modify: `src/app/pages/TaskCreationPage.tsx`

- [ ] **Step 1: 添加 PoC 相关 state 和导入**

```typescript
// 在文件顶部添加导入
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeftRight, ArrowRight, Bot, Play, Shield, Sparkles, Terminal } from 'lucide-react';
import { CodeVersionInput } from '../components/CodeVersionInput';
import { Button } from '../components/ui/button';
import { PocInput } from '../components/poc';
import type { PocInput as PocInputType } from '../lib/agent-types';
```

- [ ] **Step 2: 添加 state 和处理函数**

```typescript
export function TaskCreationPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [pocs, setPocs] = useState<PocInputType[]>([]);  // 新增

  const handleStartMigration = () => {
    // 将 PoC 数据存储到 sessionStorage
    if (pocs.length > 0) {
      sessionStorage.setItem('poc_inputs', JSON.stringify(pocs));
    }
    navigate('/workflow');
  };
```

- [ ] **Step 3: 添加 PoC 输入区域**

```typescript
{/* 在 CodeVersionInput 网格后面添加 */}
{/* PoC 配置区域 */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="mb-12"
>
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
      <Terminal className="w-6 h-6 text-cyan-600" />
      PoC 验证配置（可选）
    </h2>
    <p className="text-slate-600">
      提供 PoC 代码或验证命令，系统将在补丁移植后自动验证补丁有效性
    </p>
  </div>

  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
    <PocInput pocs={pocs} onChange={setPocs} maxPocs={3} />
  </div>
</motion.div>
```

- [ ] **Step 4: 更新统计卡片**

```typescript
{/* Info Cards - 更新最后一项 */}
{[
  { label: 'Patch Locate', value: 'AST Analysis' },
  { label: 'Semantic Map', value: 'AI-Driven' },
  { label: 'Transfer', value: 'Automated' },
  { label: 'Verification', value: pocs.length > 0 ? `${pocs.length} PoC` : 'Multi-Test' },
].map((item, index) => (
  // ... 其余代码不变
))}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/TaskCreationPage.tsx
git commit -m "feat: add PoC input section to TaskCreationPage"
```

---

## Task 7: 修改 WorkflowPage 验证步骤

**Files:**
- Modify: `src/app/pages/WorkflowPage.tsx`

- [ ] **Step 1: 添加 PoC 相关 state 和类型**

```typescript
// 在文件顶部添加导入
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, ArrowRight, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { Button } from '../components/ui/button';
import type { PocInput as PocInputType, PocVerificationResult } from '../lib/agent-types';
import { executeTool } from '../lib/agent-tools';
```

- [ ] **Step 2: 添加验证逻辑**

```typescript
export function WorkflowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pocInputs, setPocInputs] = useState<PocInputType[]>([]);  // 新增
  const [pocResults, setPocResults] = useState<PocVerificationResult[]>([]);  // 新增
  const [isVerifying, setIsVerifying] = useState(false);  // 新增

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 读取 PoC 输入
  useEffect(() => {
    const stored = sessionStorage.getItem('poc_inputs');
    if (stored) {
      try {
        setPocInputs(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  // 执行 PoC 验证
  const runPocVerification = async () => {
    if (pocInputs.length === 0) return;
    
    setIsVerifying(true);
    const results: PocVerificationResult[] = [];

    for (const poc of pocInputs) {
      const result = await executeTool('verifyPoc', {
        pocContent: poc.content,
        pocType: poc.type,
      });
      if (result.success) {
        results.push(result.data as PocVerificationResult);
      }
      setPocResults([...results]);
    }

    setIsVerifying(false);
  };

  // 模拟工作流进度
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) {
          return prev + 1;
        }
        setIsLoading(false);
        // 到达验证步骤时自动执行 PoC 验证
        if (pocInputs.length > 0) {
          runPocVerification();
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [pocInputs]);
```

- [ ] **Step 3: 更新验证步骤内容**

```typescript
const getStepContent = () => {
  switch (currentStep) {
    case 4:
      return {
        title: '验证 (Verification)',
        description: pocInputs.length > 0 
          ? `正在执行 ${pocInputs.length} 个 PoC 验证...`
          : '运行综合测试以验证补丁有效性...',
        details: pocInputs.length > 0 
          ? pocInputs.map((p, i) => `PoC #${i + 1}: ${p.description || p.content.substring(0, 50)}...`)
          : [
              '编译修改后的目标代码',
              '执行概念验证 (PoC) 漏洞利用',
              '运行单元测试集',
              '验证安全属性',
            ],
      };
    // ... 其余 case 不变
  }
};
```

- [ ] **Step 4: 添加 PoC 结果展示**

```typescript
{/* 在 Success Message 前面添加 */}
{/* PoC 验证结果 */}
{currentStep === 4 && pocResults.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mt-8 space-y-4"
  >
    <div className="flex items-center gap-2 mb-4">
      <Shield className="w-5 h-5 text-cyan-600" />
      <h3 className="text-lg font-semibold text-slate-900">PoC 验证结果</h3>
    </div>
    {pocResults.map((result) => (
      <div
        key={result.pocId}
        className={`p-4 rounded-xl border-2 ${
          result.status === 'passed' 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          {result.status === 'passed' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-medium ${
            result.status === 'passed' ? 'text-emerald-700' : 'text-red-700'
          }`}>
            {result.status === 'passed' ? '补丁有效' : '补丁无效'}
          </span>
        </div>
        <p className="text-sm text-slate-600">{result.summary}</p>
      </div>
    ))}
  </motion.div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/WorkflowPage.tsx
git commit -m "feat: integrate PoC verification into WorkflowPage"
```

---

## Task 8: 修改 AgentPage 增加验证面板

**Files:**
- Modify: `src/app/pages/AgentPage.tsx`

- [ ] **Step 1: 添加导入和 state**

```typescript
// 添加导入
import { PocVerificationPanel } from '../components/poc';
import type { PocInput as PocInputType } from '../lib/agent-types';
```

- [ ] **Step 2: 添加 PoC 相关 state**

```typescript
export function AgentPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [configOpen, setConfigOpen] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_LLM_API_KEY || '');
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_LLM_BASE_URL || 'https://api.deepseek.com/v1');
  const [model, setModel] = useState(import.meta.env.VITE_LLM_MODEL || 'deepseek-chat');
  const [pocInputs, setPocInputs] = useState<PocInputType[]>([]);  // 新增
  const abortRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
```

- [ ] **Step 3: 读取 PoC 数据**

```typescript
// Read context from sessionStorage on mount
useEffect(() => {
  const ctxStr = sessionStorage.getItem('agent_context');
  if (!ctxStr) return;
  sessionStorage.removeItem('agent_context');
  try {
    const ctx = JSON.parse(ctxStr);
    // ... 现有逻辑不变
  } catch { /* ignore parse errors */ }

  // 读取 PoC 输入
  const pocStr = sessionStorage.getItem('poc_inputs');
  if (pocStr) {
    try {
      setPocInputs(JSON.parse(pocStr));
    } catch { /* ignore */ }
  }
}, []);
```

- [ ] **Step 4: 在 AnalysisPanel 区域添加 PoC 面板**

```typescript
// 修改 ResizablePanel 部分
<ResizablePanel defaultSize={42} minSize={25}>
  <div className="h-full overflow-auto p-4 space-y-4">
    {/* 现有的 AnalysisPanel */}
    <AnalysisPanel
      cweResults={state.cweResults}
      auditResults={state.auditResults}
      commandResults={state.commandResults}
      diffAdjustments={state.diffAdjustments}
      toolCalls={state.toolCalls}
    />
    
    {/* PoC 验证面板 */}
    {pocInputs.length > 0 && (
      <div className="mt-4 pt-4 border-t border-slate-200">
        <PocVerificationPanel
          diff={undefined}  // 可以从 context 中获取
        />
      </div>
    )}
  </div>
</ResizablePanel>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/AgentPage.tsx
git commit -m "feat: add PoC verification panel to AgentPage"
```

---

## Task 9: 更新 AnalysisPanel 支持验证结果

**Files:**
- Modify: `src/app/components/agent/AnalysisPanel.tsx`

- [ ] **Step 1: 添加验证结果类型和 props**

```typescript
// 在 AnalysisPanel props 中添加
interface AnalysisPanelProps {
  cweResults: CWEResult[];
  auditResults: SecurityAuditResult[];
  commandResults: CommandResult[];
  diffAdjustments: DiffAdjustment[];
  toolCalls: ToolCall[];
  pocResults?: PocVerificationResult[];  // 新增
}
```

- [ ] **Step 2: 添加验证结果展示区**

```typescript
export function AnalysisPanel({
  cweResults,
  auditResults,
  commandResults,
  diffAdjustments,
  toolCalls,
  pocResults = [],  // 新增
}: AnalysisPanelProps) {
  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* 现有内容... */}
      
      {/* PoC 验证结果 Tab */}
      {pocResults.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">PoC 验证</h3>
          {pocResults.map((result) => (
            <div key={result.pocId} className="mb-2 p-3 bg-slate-50 rounded-lg">
              <p className={`text-sm font-medium ${
                result.status === 'passed' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {result.status === 'passed' ? '✅ 通过' : '❌ 失败'}
              </p>
              <p className="text-xs text-slate-500 mt-1">{result.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/agent/AnalysisPanel.tsx
git commit -m "feat: add PoC results display to AnalysisPanel"
```

---

## Task 10: 最终验证

- [ ] **Step 1: 运行构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 2: 运行类型检查**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 手动测试流程**

1. 访问 `/task-creation`
2. 填写代码版本信息
3. 添加 1-2 个 PoC（命令或代码）
4. 点击"开始补丁移植"
5. 观察 WorkflowPage 验证步骤
6. 查看验证结果展示
7. 点击"查看语义映射分析"
8. 点击"AI 验证补丁"跳转 AgentPage
9. 查看右侧 PoC 验证面板

- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "feat: complete PoC auto-verification feature with mock mode"
```

---

## 后续接入真实 API

当后端准备好后，只需：

1. **修改 `agent-tools.ts` 中的 `mockVerifyPoc`** → 替换为真实 API 调用
2. **修改 `PocVerificationPanel`** → 添加 API 请求逻辑
3. **修改 `WorkflowPage`** → 调用后端验证接口

核心类型定义和 UI 组件无需改动。
