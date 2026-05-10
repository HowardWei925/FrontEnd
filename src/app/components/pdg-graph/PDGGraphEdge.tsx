import { memo } from 'react';
import { motion } from 'motion/react';
import type { PositionedGraphEdge } from './types';

interface PDGGraphEdgeProps {
  edge: PositionedGraphEdge;
  isHighlighted: boolean;
  markerId: string;
}

export const PDGGraphEdge = memo(function PDGGraphEdge({ edge, isHighlighted, markerId }: PDGGraphEdgeProps) {
  const points = edge.points;
  if (points.length < 2) return null;

  let d = `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    d += ` L ${points[1].x} ${points[1].y}`;
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i];
      const next = points[i + 1];
      const mx = (p.x + next.x) / 2;
      const my = (p.y + next.y) / 2;
      d += ` Q ${p.x} ${p.y} ${mx} ${my}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
  }

  const isData = edge.dependencyType === 'data';
  const color = isData ? '#3b82f6' : '#f59e0b';
  const midIdx = Math.floor(points.length / 2);
  const midPoint = points[midIdx];

  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke={isHighlighted ? color : color + '70'}
        strokeWidth={isHighlighted ? 2.5 : 1.8}
        strokeDasharray={isData ? 'none' : '8,5'}
        markerEnd={`url(#${markerId})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      {edge.label && (
        <g>
          <rect
            x={midPoint.x - edge.label.length * 3.5 - 4}
            y={midPoint.y - 10}
            width={edge.label.length * 7 + 8}
            height={16}
            rx={4}
            fill="white"
            stroke={isHighlighted ? color : color + '40'}
            strokeWidth={1}
          />
          <text
            x={midPoint.x}
            y={midPoint.y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={10}
            fontFamily="ui-monospace, monospace"
            fontWeight={500}
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
});
