import { memo } from 'react';
import { motion } from 'motion/react';
import type { PositionedEdge } from './types';

interface ASTTreeEdgeProps {
  edge: PositionedEdge;
  isHighlighted: boolean;
}

export const ASTTreeEdge = memo(function ASTTreeEdge({ edge, isHighlighted }: ASTTreeEdgeProps) {
  const midY = (edge.sy + edge.ty) / 2;
  const d = `M ${edge.sx} ${edge.sy} C ${edge.sx} ${midY}, ${edge.tx} ${midY}, ${edge.tx} ${edge.ty}`;

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={isHighlighted ? '#06b6d4' : '#cbd5e1'}
      strokeWidth={isHighlighted ? 2.5 : 1.5}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: isHighlighted ? 1 : 0.6 }}
      transition={{ duration: 0.5 }}
    />
  );
});
