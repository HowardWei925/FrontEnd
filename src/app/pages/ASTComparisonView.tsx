import { motion } from 'motion/react';

export function ASTComparisonView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-red-600">📄 原始代码 AST</h2>
          <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-xs font-mono">
{`TranslationUnit
├── FunctionDeclaration
│   ├── Type: int
│   ├── Declarator: process_input
│   └── CompoundStatement
│       ├── IfStatement
│       │   ├── Condition: (buffer != NULL)
│       │   └── ThenStatement
│       │       └── CallExpression: strcpy
│       └── ReturnStatement: return 0`}
          </pre>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-emerald-600">📄 目标代码 AST</h2>
          <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-xs font-mono">
{`TranslationUnit
├── FunctionDeclaration
│   ├── Type: int
│   ├── Declarator: handle_data
│   └── CompoundStatement
│       ├── IfStatement
│       │   ├── Condition: (temp_buf != NULL)
│       │   └── ThenStatement
│       │       └── CallExpression: strncpy
│       └── ReturnStatement: return -1`}
          </pre>
        </div>
      </div>

      <div className="rounded-lg border bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          💡 AST 对比图说明：绿色节点表示相同结构，红色节点表示差异，黄色节点表示映射关系。
        </p>
        <p className="mt-2 text-xs text-gray-500">
          ⏳ 完整功能待后端对接，当前为示例数据
        </p>
      </div>
    </div>
  );
}