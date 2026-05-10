import { memo } from 'react';
import { motion } from 'motion/react';
import type { PositionedNode } from './types';

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  TranslationUnit: { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1' },
  FunctionDeclaration: { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
  IfStatement: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
  CallExpression: { bg: '#fdf2f8', border: '#ec4899', text: '#be185d' },
  ReturnStatement: { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
  CompoundStatement: { bg: '#f8fafc', border: '#94a3b8', text: '#475569' },
  Declaration: { bg: '#fefce8', border: '#84cc16', text: '#4d7c0f' },
  TypeSpecifier: { bg: '#fce7f3', border: '#f472b6', text: '#db2777' },
};

const defaultColor = { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' };

interface ASTTreeNodeProps {
  node: PositionedNode;
  isHovered: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  onHover: (id: string | null) => void;
  onToggleCollapse: (id: string) => void;
}

export const ASTTreeNode = memo(function ASTTreeNode({
  node, isHovered, isCollapsed, hasChildren, onHover, onToggleCollapse,
}: ASTTreeNodeProps) {
  const colors = typeColors[node.data.type] || defaultColor;
  const hw = node.width / 2;
  const hh = node.height / 2;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
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
        rx={6}
        fill={colors.bg}
        stroke={isHovered ? colors.border : colors.border + '80'}
        strokeWidth={isHovered ? 2.5 : 1.5}
        animate={{ scale: isHovered ? 1.03 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
      />
      <text
        x={node.x}
        y={node.y - 5}
        textAnchor="middle"
        dominantBaseline="auto"
        fill={colors.text}
        fontSize={9}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
      >
        {node.data.type.length > 18 ? node.data.type.slice(0, 16) + '...' : node.data.type}
      </text>
      <text
        x={node.x}
        y={node.y + 10}
        textAnchor="middle"
        dominantBaseline="auto"
        fill={colors.text}
        fontSize={11}
        fontFamily="ui-monospace, monospace"
        opacity={0.85}
      >
        {node.data.label.length > 20 ? node.data.label.slice(0, 18) + '...' : node.data.label}
      </text>
      {hasChildren && (
        <g
          onClick={(e) => { e.stopPropagation(); onToggleCollapse(node.id); }}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx={node.x}
            cy={node.y + hh}
            r={8}
            fill="white"
            stroke={colors.border}
            strokeWidth={1.5}
          />
          <text
            x={node.x}
            y={node.y + hh + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={12}
            fontWeight="bold"
            fontFamily="monospace"
          >
            {isCollapsed ? '+' : '−'}
          </text>
        </g>
      )}
    </motion.g>
  );
});
