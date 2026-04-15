import { motion } from 'motion/react';
import { useState } from 'react';

interface MappingNode {
  id: string;
  label: string;
  type: 'variable' | 'function' | 'type';
  side: 'source' | 'target';
}

interface MappingEdge {
  from: string;
  to: string;
  score: number;
  astMatch: number;
  dataflowMatch: number;
}

interface MappingGraphProps {
  nodes: MappingNode[];
  edges: MappingEdge[];
  onEdgeHover?: (edge: MappingEdge | null) => void;
}

export function MappingGraph({ nodes, edges, onEdgeHover }: MappingGraphProps) {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const sourceNodes = nodes.filter(n => n.side === 'source');
  const targetNodes = nodes.filter(n => n.side === 'target');

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'variable':
        return 'bg-cyan-500/20 border-cyan-500 text-cyan-700';
      case 'function':
        return 'bg-orange-500/20 border-orange-500 text-orange-700';
      case 'type':
        return 'bg-purple-500/20 border-purple-500 text-purple-700';
      default:
        return 'bg-gray-500/20 border-gray-500 text-slate-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'stroke-emerald-400';
    if (score >= 0.7) return 'stroke-cyan-400';
    if (score >= 0.5) return 'stroke-orange-400';
    return 'stroke-red-400';
  };

  const getYPos = (index: number) => 100 + index * 70;

  const calculatePath = (fromIndex: number, toIndex: number) => {
    const startY = 100 + fromIndex * 70 + 20; // 20 is half node height
    const endY = 100 + toIndex * 70 + 20;
    const startX = 0;
    const endX = 100;
    const midX = 50;

    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  };

  return (
    <div className="relative bg-white/60 rounded-lg border border-slate-200 p-8 overflow-hidden h-[600px]">
      <svg className="absolute left-[250px] right-[250px] h-full" style={{ width: "calc(100% - 500px)" }} viewBox="0 0 100 600" preserveAspectRatio="none">     
        {/* Connection Lines */}
        <g>
          {edges.map((edge, index) => {
            const fromIndex = sourceNodes.findIndex(n => n.id === edge.from);
            const toIndex = targetNodes.findIndex(n => n.id === edge.to);
            const edgeKey = `${edge.from}-${edge.to}`;
            const isHovered = hoveredEdge === edgeKey;

            return (
              <motion.g
                key={edgeKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => {
                  setHoveredEdge(edgeKey);
                  onEdgeHover?.(edge);
                }}
                onMouseLeave={() => {
                  setHoveredEdge(null);
                  onEdgeHover?.(null);
                }}
              >
                {/* Hover effect for hovered edge */}
                {isHovered && (
                  <motion.path
                    d={calculatePath(fromIndex, toIndex)}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="8"
                    className="opacity-50 blur-sm"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Main line */}
                <motion.path
                  d={calculatePath(fromIndex, toIndex)}
                  fill="none"
                  className={`${getScoreColor(edge.score)} transition-all cursor-pointer`}
                  strokeWidth={isHovered ? "3" : "2"}
                  strokeDasharray={isHovered ? "0" : "5,5"}
                  opacity={isHovered ? 1 : 0.6}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />

                
              </motion.g>
            );
          })}
        </g>

      </svg>

      {/* HTML absolute nodes for score labels to avoid SVG transform stretching */}
      {edges.map((edge, index) => {
        const fromIndex = sourceNodes.findIndex(n => n.id === edge.from);
        const toIndex = targetNodes.findIndex(n => n.id === edge.to);
        const edgeKey = `${edge.from}-${edge.to}`;
        const isHovered = hoveredEdge === edgeKey;
        
        if (!isHovered) return null;

        return (
          <motion.div
            key={`score-${edgeKey}`}
            className="absolute left-[250px] right-[250px] pointer-events-none flex justify-center z-20"
            style={{ 
              top: (100 + fromIndex * 70 + 20 + 100 + toIndex * 70 + 20) / 2 - 10,
              height: "20px"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-slate-900 text-xs font-mono bg-slate-100 px-3 py-1 flex items-center rounded-full border border-slate-200 shadow-lg">
              {(edge.score * 100).toFixed(1)}%
            </span>
          </motion.div>
        );
      })}

      {/* Source Nodes (Left Side) */}
      {/* Source Nodes (Left Side) */}
      <div className="absolute left-8 top-8 w-[200px]">
        <div className="text-sm font-semibold text-slate-600 mb-4 h-[40px] flex items-center">
          源端代码 (漏洞/补丁)
        </div>
        {sourceNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ top: getYPos(index), position: 'absolute', width: '100%' }}
            className={`px-4 py-2 rounded-lg border-2 ${getNodeColor(node.type)} backdrop-blur-sm font-mono text-sm shadow-lg z-10 flex items-center justify-between pointer-events-auto cursor-pointer`}
          >
            <span className="truncate">{node.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Target Nodes (Right Side) */}
      <div className="absolute right-8 top-8 w-[200px]">
        <div className="text-sm font-semibold text-slate-600 mb-4 text-right h-[40px] flex items-center justify-end">
          目标端代码
        </div>
        {targetNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ top: getYPos(index), position: 'absolute', width: '100%' }}
            className={`px-4 py-2 rounded-lg border-2 ${getNodeColor(node.type)} backdrop-blur-sm font-mono text-sm shadow-lg z-10 flex items-center justify-between pointer-events-auto cursor-pointer`}
          >
            <span className="truncate">{node.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
