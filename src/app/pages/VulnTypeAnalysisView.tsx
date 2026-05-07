import { motion } from 'motion/react';
import { FileSearch, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface Mapping {
  id: string;
  sourceSymbol: string;
  targetSymbol: string;
  type: 'variable' | 'function' | 'type';
  astMatch: number;
  dataflowMatch: number;
  overallScore: number;
  context: string;
  status: 'confirmed' | 'suggested' | 'uncertain';
}

interface VulnTypeAnalysisViewProps {
  mappingData: Mapping[];
}

// 根据匹配度判断漏洞类型
function determineVulnType(astMatch: number, dataflowMatch: number, overallScore: number): {
  type: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  color: string;
  icon: JSX.Element;
} {
  // Type 1: 完全相同
  if (astMatch === 1.0 && dataflowMatch === 1.0 && overallScore === 1.0) {
    return {
      type: 1,
      name: 'Type 1 - 文本相似性',
      description: '代码片段完全相同（除空白、注释、布局外）',
      color: 'text-emerald-600',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    };
  }
  // Type 2: 结构相同，名称不同
  if (astMatch >= 0.85 && dataflowMatch >= 0.85 && overallScore >= 0.85) {
    return {
      type: 2,
      name: 'Type 2 - 词汇相似性',
      description: '标识符名称和字面量值不同，但代码结构相同',
      color: 'text-cyan-600',
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-600" />,
    };
  }
  // Type 3: 语句级相似，有修改
  if (astMatch >= 0.7 && dataflowMatch >= 0.7 && overallScore >= 0.7) {
    return {
      type: 3,
      name: 'Type 3 - 句法相似性',
      description: '语句级别相似，可能有添加、删除或修改的语句',
      color: 'text-orange-600',
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
    };
  }
  // Type 4: 语义相似
  return {
    type: 4,
    name: 'Type 4 - 语义相似性',
    description: '语法不同但功能相同，需要深层语义理解',
    color: 'text-purple-600',
    icon: <HelpCircle className="w-5 h-5 text-purple-600" />,
  };
}

// 获取类型标签样式
function getTypeBadgeStyle(type: number) {
  switch (type) {
    case 1:
      return 'bg-emerald-500/20 text-emerald-700 border-emerald-200';
    case 2:
      return 'bg-cyan-500/20 text-cyan-700 border-cyan-200';
    case 3:
      return 'bg-orange-500/20 text-orange-700 border-orange-200';
    case 4:
      return 'bg-purple-500/20 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-500/20 text-gray-700 border-gray-200';
  }
}

export function VulnTypeAnalysisView({ mappingData }: VulnTypeAnalysisViewProps) {
  // 统计各类型数量
  const typeCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const analysisResults = mappingData.map((mapping) => {
    const result = determineVulnType(mapping.astMatch, mapping.dataflowMatch, mapping.overallScore);
    typeCount[result.type]++;
    return { mapping, result };
  });

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((type) => (
          <div
            key={type}
            className={`rounded-lg border p-4 text-center ${
              type === 1 ? 'border-emerald-200 bg-emerald-50/30' :
              type === 2 ? 'border-cyan-200 bg-cyan-50/30' :
              type === 3 ? 'border-orange-200 bg-orange-50/30' :
              'border-purple-200 bg-purple-50/30'
            }`}
          >
            <p className={`text-2xl font-bold ${
              type === 1 ? 'text-emerald-600' :
              type === 2 ? 'text-cyan-600' :
              type === 3 ? 'text-orange-600' :
              'text-purple-600'
            }`}>
              {typeCount[type]}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Type {type}
            </p>
          </div>
        ))}
      </div>

      {/* 漏洞类型说明 */}
      <div className="rounded-lg border bg-blue-50/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileSearch className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">漏洞类型判断标准</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 text-xs flex items-center justify-center font-bold">1</span>
            <span className="text-gray-600">完全相同（除空白/注释）</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-700 text-xs flex items-center justify-center font-bold">2</span>
            <span className="text-gray-600">结构相同，变量名/常量值不同</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-700 text-xs flex items-center justify-center font-bold">3</span>
            <span className="text-gray-600">语句级别相似，有增删改</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-700 text-xs flex items-center justify-center font-bold">4</span>
            <span className="text-gray-600">语法不同但功能相同</span>
          </div>
        </div>
      </div>

      {/* 分析结果表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="bg-slate-100/50 border-b border-slate-200 px-6 py-4">
          <h3 className="font-semibold text-slate-900">映射对漏洞类型分析结果</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">源符号</th>
                <th className="px-4 py-3 text-left">目标符号</th>
                <th className="px-4 py-3 text-center">AST匹配度</th>
                <th className="px-4 py-3 text-center">数据流匹配度</th>
                <th className="px-4 py-3 text-center">总分</th>
                <th className="px-4 py-3 text-center">漏洞类型</th>
                <th className="px-4 py-3 text-left">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analysisResults.map(({ mapping, result }) => (
                <tr key={mapping.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-red-600">{mapping.sourceSymbol}</td>
                  <td className="px-4 py-3 font-mono text-sm text-emerald-600">{mapping.targetSymbol}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-mono">{(mapping.astMatch * 100).toFixed(0)}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-mono">{(mapping.dataflowMatch * 100).toFixed(0)}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-mono font-bold">{(mapping.overallScore * 100).toFixed(0)}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeStyle(result.type)}`}>
                      Type {result.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{result.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}