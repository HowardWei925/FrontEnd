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
        return 'bg-cyan-500/20 border-cyan-500 text-cyan-300';
      case 'function':
        return 'bg-orange-500/20 border-orange-500 text-orange-300';
      case 'type':
        return 'bg-purple-500/20 border-purple-500 text-purple-300';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'stroke-emerald-400';
    if (score >= 0.7) return 'stroke-cyan-400';
    if (score >= 0.5) return 'stroke-orange-400';
    return 'stroke-red-400';
  };

  const calculatePath = (fromIndex: number, toIndex: number) => {
    const startY = 80 + fromIndex * 100;
    const endY = 80 + toIndex * 100;
    const startX = 350;
    const endX = 750;
    const midX = (startX + endX) / 2;

    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  };

  return (
    <div className="relative bg-slate-900/30 rounded-lg border border-white/10 p-8 overflow-hidden">
      <svg className="w-full h-[600px]">
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
                {/* Glow effect for hovered edge */}
                {isHovered && (
                  <motion.path
                    d={calculatePath(fromIndex, toIndex)}
                    fill="none"
                    stroke="url(#gradient-glow)"
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

                {/* Score label on line */}
                {isHovered && (
                  <motion.text
                    x={(350 + 750) / 2}
                    y={(80 + fromIndex * 100 + 80 + toIndex * 100) / 2 - 10}
                    className="fill-white text-xs font-mono"
                    textAnchor="middle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {(edge.score * 100).toFixed(1)}%
                  </motion.text>
                )}
              </motion.g>
            );
          })}
        </g>

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gradient-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Source Nodes (Left Side) */}
      <div className="absolute left-8 top-8 space-y-8">
        <div className="text-sm font-semibold text-gray-400 mb-4">
          Source Code (Vulnerable/Patched)
        </div>
        {sourceNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`px-4 py-2 rounded-lg border-2 ${getNodeColor(node.type)} backdrop-blur-sm font-mono text-sm shadow-lg`}
          >
            {node.label}
          </motion.div>
        ))}
      </div>

      {/* Target Nodes (Right Side) */}
      <div className="absolute right-8 top-8 space-y-8">
        <div className="text-sm font-semibold text-gray-400 mb-4 text-right">
          Target Code
        </div>
        {targetNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`px-4 py-2 rounded-lg border-2 ${getNodeColor(node.type)} backdrop-blur-sm font-mono text-sm shadow-lg`}
          >
            {node.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
