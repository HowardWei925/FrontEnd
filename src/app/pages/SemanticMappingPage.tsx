import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Network, TrendingUp, Code2, Hash, GitBranch, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { MappingGraph } from '../components/MappingGraph';

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
    context: 'Type compatibility - exact match',
    status: 'confirmed',
  },
];

const graphNodes = [
  { id: 'fn1', label: 'process_input()', type: 'function' as const, side: 'source' as const },
  { id: 'var1', label: 'buffer', type: 'variable' as const, side: 'source' as const },
  { id: 'var2', label: 'input', type: 'variable' as const, side: 'source' as const },
  { id: 'fn2', label: 'strcpy()', type: 'function' as const, side: 'source' as const },
  { id: 'fn3', label: 'printf()', type: 'function' as const, side: 'source' as const },
  
  { id: 'fn4', label: 'handle_data()', type: 'function' as const, side: 'target' as const },
  { id: 'var3', label: 'temp_buf', type: 'variable' as const, side: 'target' as const },
  { id: 'var4', label: 'user_input', type: 'variable' as const, side: 'target' as const },
  { id: 'fn5', label: 'strncpy()', type: 'function' as const, side: 'target' as const },
  { id: 'fn6', label: 'log_message()', type: 'function' as const, side: 'target' as const },
];

const graphEdges = [
  { from: 'fn1', to: 'fn4', score: 0.96, astMatch: 0.94, dataflowMatch: 0.98 },
  { from: 'var1', to: 'var3', score: 0.91, astMatch: 0.89, dataflowMatch: 0.92 },
  { from: 'var2', to: 'var4', score: 0.91, astMatch: 0.87, dataflowMatch: 0.95 },
  { from: 'fn2', to: 'fn5', score: 0.82, astMatch: 0.78, dataflowMatch: 0.85 },
  { from: 'fn3', to: 'fn6', score: 0.70, astMatch: 0.72, dataflowMatch: 0.68 },
];

export function SemanticMappingPage() {
  const navigate = useNavigate();
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'variable' | 'function' | 'type'>('all');

  const filteredMappings = filterType === 'all' 
    ? mappingData 
    : mappingData.filter(m => m.type === filterType);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-400';
    if (score >= 0.7) return 'text-cyan-400';
    if (score >= 0.5) return 'text-orange-400';
    return 'text-red-400';
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
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'suggested':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'uncertain':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-[1800px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate('/comparison')}
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Comparison
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Network className="w-8 h-8 text-cyan-400" />
                <h1 className="text-3xl font-bold text-white">
                  Semantic Mapping Analysis
                </h1>
              </div>
              <p className="text-gray-400">
                AI-powered symbol mapping and similarity scoring between source and target codebases
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500">Total Mappings</p>
                <p className="text-2xl font-bold text-cyan-400">{mappingData.length}</p>
              </div>
              <div className="bg-slate-900/50 border border-emerald-500/30 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {mappingData.filter(m => m.status === 'confirmed').length}
                </p>
              </div>
              <div className="bg-slate-900/50 border border-orange-500/30 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500">Avg. Score</p>
                <p className="text-2xl font-bold text-orange-400">
                  {(mappingData.reduce((sum, m) => sum + m.overallScore, 0) / mappingData.length * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Visual Mapping Graph
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
          </div>

          <MappingGraph 
            nodes={graphNodes} 
            edges={graphEdges}
            onEdgeHover={setHoveredEdge}
          />

          {/* Hover Info */}
          {hoveredEdge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4"
            >
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(hoveredEdge.score)}`}>
                    {(hoveredEdge.score * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">AST Match</p>
                  <p className={`text-2xl font-bold ${getScoreColor(hoveredEdge.astMatch)}`}>
                    {(hoveredEdge.astMatch * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Dataflow Match</p>
                  <p className={`text-2xl font-bold ${getScoreColor(hoveredEdge.dataflowMatch)}`}>
                    {(hoveredEdge.dataflowMatch * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Filter by type:</span>
            <div className="flex gap-2">
              {(['all', 'function', 'variable', 'type'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === type
                      ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300'
                      : 'bg-slate-800/50 border border-white/10 text-gray-400 hover:border-cyan-500/30'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Detailed Mapping Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Detailed Mapping Table
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-slate-800/50 border-b border-white/10 px-6 py-4 text-sm font-semibold text-gray-400">
              <div className="col-span-2">Source Symbol</div>
              <div className="col-span-2">Target Symbol</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">AST Match</div>
              <div className="col-span-2">Dataflow Match</div>
              <div className="col-span-2">Overall Score</div>
              <div className="col-span-1">Status</div>
            </div>

            {/* Table Rows */}
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
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Source Symbol */}
                  <div className="col-span-2 font-mono text-sm text-red-400">
                    {mapping.sourceSymbol}
                  </div>

                  {/* Target Symbol */}
                  <div className="col-span-2 font-mono text-sm text-emerald-400">
                    {mapping.targetSymbol}
                  </div>

                  {/* Type */}
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      mapping.type === 'function' ? 'bg-orange-500/20 text-orange-300' :
                      mapping.type === 'variable' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {mapping.type}
                    </span>
                  </div>

                  {/* AST Match */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800/50 rounded-full h-2 overflow-hidden">
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

                  {/* Dataflow Match */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800/50 rounded-full h-2 overflow-hidden">
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

                  {/* Overall Score */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800/50 rounded-full h-2 overflow-hidden">
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

                  {/* Status */}
                  <div className="col-span-1 flex items-center">
                    {getStatusIcon(mapping.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Selected Mapping Details */}
        {selectedMapping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-br from-slate-900/80 to-cyan-900/20 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">
                  Mapping Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedMapping(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Context Analysis</p>
                <p className="text-gray-300">{selectedMapping.context}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Matching Techniques</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-gray-300">Abstract Syntax Tree (AST) comparison</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-gray-300">Control-flow and dataflow analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-gray-300">Type system compatibility check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-gray-300">Semantic embedding similarity (AI)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedMapping.status)}
                <span className="text-sm text-gray-400">
                  Status: <span className="text-white font-semibold capitalize">{selectedMapping.status}</span>
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
          className="mt-8 bg-slate-900/30 border border-white/10 rounded-lg p-4"
        >
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-gray-400">Excellent (90-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded" />
              <span className="text-gray-400">Good (70-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span className="text-gray-400">Fair (50-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-400">Low (&lt;50%)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
