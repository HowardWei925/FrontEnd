import { memo } from 'react';
import { motion } from 'motion/react';
import type { PositionedGraphNode } from './types';

const typeStyles: Record<string, { fill: string; stroke: string; text: string }> = {
  declaration: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  condition: { fill: '#fef3c7', stroke: '#f59e0b', text: '#b45309' },
  call: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534' },
  return: { fill: '#f3f4f6', stroke: '#6b7280', text: '#374151' },
  assignment: { fill: '#ccfbf1', stroke: '#14b8a6', text: '#115e59' },
  other: { fill: '#f1f5f9', stroke: '#94a3b8', text: '#475569' },
};

interface PDGGraphNodeProps {
  node: PositionedGraphNode;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

export const PDGGraphNode = memo(function PDGGraphNode({ node, isHovered, onHover }: PDGGraphNodeProps) {
  const style = typeStyles[node.data.type] || typeStyles.other;
  const hw = node.width / 2;
  const hh = node.height / 2;

  const truncate = (text: string, max: number) => text.length > max ? text.slice(0, max - 1) + '...' : text;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      <motion.rect
        x={node.x - hw}
        y={node.y - hh}
        width={node.width}
        height={node.height}
        rx={8}
        fill={style.fill}
        stroke={isHovered ? style.stroke : style.stroke + '80'}
        strokeWidth={isHovered ? 2.5 : 1.5}
        animate={{ scale: isHovered ? 1.04 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
      />
      <text
        x={node.x}
        y={node.y - 5}
        textAnchor="middle"
        dominantBaseline="auto"
        fill={style.text}
        fontSize={9}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
      >
        {node.data.type.toUpperCase()}
      </text>
      <text
        x={node.x}
        y={node.y + 10}
        textAnchor="middle"
        dominantBaseline="auto"
        fill={style.text}
        fontSize={11}
        fontFamily="ui-monospace, monospace"
        opacity={0.9}
      >
        {truncate(node.data.statement, 28)}
      </text>
    </motion.g>
  );
});
