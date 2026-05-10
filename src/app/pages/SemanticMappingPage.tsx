import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Network, TrendingUp, Code2, Hash, GitBranch, 
  CheckCircle2, AlertCircle, BarChart3, Share2, FileSearch 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { MappingGraph } from '../components/MappingGraph';
import { ASTComparisonView } from './ASTComparisonView';
import { PDGView } from './PDGView';
import { VulnTypeAnalysisView } from './VulnTypeAnalysisView';

// 原有 Mapping 接口定义
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

// 原有 mappingData
const mappingData: Mapping[] = [
  {
    id: '1',
    sourceSymbol: 'process_input()',
    targetSymbol: 'handle_data()',
    type: 'function',
    astMatch: 0.94,
    dataflowMatch: 0.98,
    overallScore: 0.96,
    context: 'Main processing function - signature match',
    status: 'confirmed',
  },
  {
    id: '2',
    sourceSymbol: 'buffer',
    targetSymbol: 'temp_buf',
    type: 'variable',
    astMatch: 0.89,
    dataflowMatch: 0.92,
    overallScore: 0.91,
    context: 'Local buffer variable - type and usage match',
    status: 'confirmed',
  },
  {
    id: '3',
    sourceSymbol: 'input',
    targetSymbol: 'user_input',
    type: 'variable',
    astMatch: 0.87,
    dataflowMatch: 0.95,
    overallScore: 0.91,
    context: 'Function parameter - dataflow analysis',
    status: 'confirmed',
  },
  {
    id: '4',
    sourceSymbol: 'strcpy()',
    targetSymbol: 'strncpy()',
    type: 'function',
    astMatch: 0.78,
    dataflowMatch: 0.85,
    overallScore: 0.82,
    context: 'String copy operation - patch transformation',
    status: 'suggested',
  },
  {
    id: '5',
    sourceSymbol: 'printf()',
    targetSymbol: 'log_message()',
    type: 'function',
    astMatch: 0.72,
    dataflowMatch: 0.68,
    overallScore: 0.70,
    context: 'Output function - semantic similarity',
    status: 'suggested',
  },
  {
    id: '6',
    sourceSymbol: 'char*',
    targetSymbol: 'char*',
    type: 'type',
    astMatch: 1.0,
    dataflowMatch: 1.0,
    overallScore: 1.0,
    context: '类型 compatibility - exact match',
    status: 'confirmed',
  },
];

// 原有 graphNodes
const graphNodes = [
  { id: 'fn1', label: 'process_input()', type: 'function' as const, side: 'source' as const },
  { id: 'var1', label: 'buffer', type: 'variable' as const, side: 'source' as const },
  { id: 'var2', label: 'input', type: 'variable' as const, side: 'source' as const },
  { id: 'fn2', label: 'strcpy()', type: 'function' as const, side: 'source' as const },
  { id: 'fn3', label: 'printf()', type: 'function' as const, side: 'source' as const },
  { id: 'type1', label: 'char*', type: 'type' as const, side: 'source' as const },
  { id: 'fn4', label: 'handle_data()', type: 'function' as const, side: 'target' as const },
  { id: 'var3', label: 'temp_buf', type: 'variable' as const, side: 'target' as const },
  { id: 'var4', label: 'user_input', type: 'variable' as const, side: 'target' as const },
  { id: 'fn5', label: 'strncpy()', type: 'function' as const, side: 'target' as const },
  { id: 'fn6', label: 'log_message()', type: 'function' as const, side: 'target' as const },
  { id: 'type2', label: 'char*', type: 'type' as const, side: 'target' as const },
];

// 原有 graphEdges
const graphEdges = [
  { from: 'fn1', to: 'fn4', score: 0.96, astMatch: 0.94, dataflowMatch: 0.98 },
  { from: 'var1', to: 'var3', score: 0.91, astMatch: 0.89, dataflowMatch: 0.92 },
  { from: 'var2', to: 'var4', score: 0.91, astMatch: 0.87, dataflowMatch: 0.95 },
  { from: 'fn2', to: 'fn5', score: 0.82, astMatch: 0.78, dataflowMatch: 0.85 },
  { from: 'fn3', to: 'fn6', score: 0.70, astMatch: 0.72, dataflowMatch: 0.68 },
  { from: 'type1', to: 'type2', score: 1.0, astMatch: 1.0, dataflowMatch: 1.0 },
];

// 导航栏组件（顺序调整）
function NavigationTabs({ currentTab, onTabChange }: { currentTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'mapping', label: '语义映射', icon: Share2 },
    { id: 'ast', label: 'AST对比图', icon: BarChart3 },
    { id: 'pdg', label: '程序依赖图 (PDG)', icon: GitBranch },
    { id: 'type', label: '漏洞类型分析', icon: FileSearch },
  ];

  return (
    <div className="mb-6 border-b border-slate-200">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center gap-2 ${
              currentTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-700 border-b-2 border-cyan-500'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 导出主组件
export function SemanticMappingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'variable' | 'function' | 'type'>('all');

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'mapping';

  const handleTabChange = (tab: string) => {
    navigate(`/semantic-mapping?tab=${tab}`);
  };

  const filteredMappings = filterType === 'all'
    ? mappingData
    : mappingData.filter(m => m.type === filterType);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-600';
    if (score >= 0.7) return 'text-cyan-600';
    if (score >= 0.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.9) return 'bg-emerald-500';
    if (score >= 0.7) return 'bg-cyan-500';
    if (score >= 0.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'suggested':
        return <TrendingUp className="w-4 h-4 text-cyan-600" />;
      case 'uncertain':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  // 根据 currentTab 显示不同内容
  const renderContent = () => {
    if (currentTab === 'ast') {
      return <ASTComparisonView />;
    }
    if (currentTab === 'pdg') {
      return <PDGView />;
    }
    if (currentTab === 'type') {
      return <VulnTypeAnalysisView mappingData={mappingData} />;
    }
    // mapping 视图（原页面内容）
    return (
      <>
        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">类型筛选:</span>
            <div className="flex gap-2">
              {(['all', 'function', 'variable', 'type'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === type
                      ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-700'
                      : 'bg-slate-100/50 border border-slate-200 text-slate-600 hover:border-cyan-400'
                  }`}
                >
                  {{ all: '全部', function: '函数', variable: '变量', type: '类型' }[type]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 映射详情对照表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-semibold text-slate-900">映射详情对照表</h2>
            <div className="flex-1 h-px bg-white ml-4" />
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 gap-4 bg-slate-100/50 border-b border-slate-200 px-6 py-4 text-sm font-semibold text-slate-600">
              <div className="col-span-2">源符号</div>
              <div className="col-span-2">目标符号</div>
              <div className="col-span-1">类型</div>
              <div className="col-span-2">AST 匹配度</div>
              <div className="col-span-2">数据流匹配度</div>
              <div className="col-span-2">总分</div>
              <div className="col-span-1">状态</div>
            </div>
            <div className="divide-y divide-white/5">
              {filteredMappings.map((mapping, index) => (
                <motion.div
                  key={mapping.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedMapping(mapping)}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-colors ${
                    selectedMapping?.id === mapping.id
                      ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                      : 'hover:bg-white'
                  }`}
                >
                  <div className="col-span-2 font-mono text-sm text-red-600">{mapping.sourceSymbol}</div>
                  <div className="col-span-2 font-mono text-sm text-emerald-600">{mapping.targetSymbol}</div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      mapping.type === 'function' ? 'bg-orange-500/20 text-orange-700' :
                      mapping.type === 'variable' ? 'bg-cyan-500/20 text-cyan-700' :
                      'bg-purple-500/20 text-purple-700'
                    }`}>
                      {mapping.type}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mapping.astMatch * 100}%` }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          className={`h-full ${getScoreBgColor(mapping.astMatch)}`}
                        />
                      </div>
                      <span className={`text-xs font-mono ${getScoreColor(mapping.astMatch)}`}>
                        {(mapping.astMatch * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mapping.dataflowMatch * 100}%` }}
                          transition={{ delay: index * 0.05 + 0.3 }}
                          className={`h-full ${getScoreBgColor(mapping.dataflowMatch)}`}
                        />
                      </div>
                      <span className={`text-xs font-mono ${getScoreColor(mapping.dataflowMatch)}`}>
                        {(mapping.dataflowMatch * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mapping.overallScore * 100}%` }}
                          transition={{ delay: index * 0.05 + 0.4 }}
                          className={`h-full ${getScoreBgColor(mapping.overallScore)}`}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(mapping.overallScore)}`}>
                        {(mapping.overallScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    {getStatusIcon(mapping.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Selected 映射详细信息 */}
        {selectedMapping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white backdrop-blur-md border border-cyan-500/50 rounded-xl p-8 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-semibold text-slate-900">映射详细信息</h3>
              </div>
              <button
                onClick={() => setSelectedMapping(null)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">上下文分析</p>
                <p className="text-slate-600">{selectedMapping.context}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">采用的匹配技术</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-slate-600">抽象语法树 (AST) 对比分析</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-slate-600">控制流与数据流分析</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-slate-600">类型 system compatibility check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-slate-600">语义嵌入相似度计算 (AI 模型)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedMapping.status)}
                <span className="text-sm text-slate-600">
                  状态: <span className="text-slate-900 font-semibold capitalize">{selectedMapping.status}</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/60 border border-slate-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-slate-600">极好 (90-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded" />
              <span className="text-slate-600">良好 (70-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span className="text-slate-600">一般 (50-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-slate-600">较低 (&lt;50%)</span>
            </div>
          </div>
        </motion.div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: '', backgroundSize: '40px 40px' }} />
      </div>

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-[1800px]">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            onClick={() => navigate('/comparison')}
            variant="ghost"
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回对比页
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Network className="w-8 h-8 text-cyan-600" />
                <h1 className="text-3xl font-bold text-slate-900">
                  {currentTab === 'ast' ? 'AST 对比图' : currentTab === 'pdg' ? '程序依赖图 (PDG)' : currentTab === 'type' ? '漏洞类型分析' : '语义映射分析'}
                </h1>
              </div>
              <p className="text-slate-600">
                {currentTab === 'ast' 
                  ? '抽象语法树对比 - 原始代码 vs 目标代码'
                  : currentTab === 'pdg'
                  ? '节点=语句，边=数据依赖/控制依赖关系'
                  : currentTab === 'type'
                  ? '分析代码克隆类型 (Type 1/2/3/4)'
                  : '探索源端和目标代码库之间的 AI 符号映射关系与相似度评分'
                }
              </p>
            </div>

            {/* Stats - 只在 mapping 页面显示 */}
            {currentTab === 'mapping' && (
              <div className="flex gap-4">
                <div className="bg-white/80 border border-cyan-400 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600">总映射数</p>
                  <p className="text-2xl font-bold text-cyan-600">{mappingData.length}</p>
                </div>
                <div className="bg-white/80 border border-emerald-400 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600">已确认</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {mappingData.filter(m => m.status === 'confirmed').length}
                  </p>
                </div>
                <div className="bg-white/80 border border-orange-400 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600">平均分</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(mappingData.reduce((sum, m) => sum + m.overallScore, 0) / mappingData.length * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 导航栏 */}
        <NavigationTabs currentTab={currentTab} onTabChange={handleTabChange} />

        {/* Visual Graph - 只在 mapping 页面显示 */}
        {currentTab === 'mapping' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-cyan-600" />
              <h2 className="text-xl font-semibold text-slate-900">可视化映射图谱</h2>
              <div className="flex-1 h-px bg-white ml-4" />
            </div>

            <MappingGraph 
              nodes={graphNodes} 
              edges={graphEdges}
              onEdgeHover={setHoveredEdge}
            />

            {hoveredEdge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-slate-100 backdrop-blur-sm border border-cyan-400 rounded-lg p-4"
              >
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">总分</p>
                    <p className={`text-2xl font-bold ${getScoreColor(hoveredEdge.score)}`}>
                      {(hoveredEdge.score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">AST 匹配度</p>
                    <p className={`text-2xl font-bold ${getScoreColor(hoveredEdge.astMatch)}`}>
                      {(hoveredEdge.astMatch * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">数据流匹配度</p>
                    <p className={`text-2xl font-bold ${getScoreColor(hoveredEdge.dataflowMatch)}`}>
                      {(hoveredEdge.dataflowMatch * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 主要内容区域 */}
        {renderContent()}
      </div>
    </div>
  );
}