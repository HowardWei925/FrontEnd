import { useState, useCallback } from 'react';
import type { ASTNode, ASTTreeData } from './types';
import { useTreeLayout } from './useTreeLayout';
import { ASTTreeNode } from './ASTTreeNode';
import { ASTTreeEdge } from './ASTTreeEdge';
import { GraphContainer } from '../shared/GraphContainer';

interface ASTTreeVisualizationProps {
  data: ASTTreeData;
  title?: string;
  accentColor?: 'red' | 'emerald';
}

function getAllIds(node: ASTNode): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllIds(child));
    }
  }
  return ids;
}

function getDescendantIds(node: ASTNode): string[] {
  const ids: string[] = [];
  if (node.children) {
    for (const child of node.children) {
      ids.push(child.id, ...getDescendantIds(child));
    }
  }
  return ids;
}

export function ASTTreeVisualization({ data, title, accentColor = 'emerald' }: ASTTreeVisualizationProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsed(new Set()), []);
  const collapseAll = useCallback(() => {
    const ids = getAllIds(data.root).filter(id => {
      const find = (n: ASTNode): ASTNode | null => {
        if (n.id === id) return n;
        if (n.children) {
          for (const c of n.children) {
            const r = find(c);
            if (r) return r;
          }
        }
        return null;
      };
      const node = find(data.root);
      return node?.children && node.children.length > 0;
    });
    setCollapsed(new Set(ids));
  }, [data.root]);

  const { nodes, edges, bounds } = useTreeLayout(data.root, collapsed);

  const borderColor = accentColor === 'red' ? 'border-red-200' : 'border-emerald-200';
  const titleColor = accentColor === 'red' ? 'text-red-700' : 'text-emerald-700';

  return (
    <div className={`rounded-lg border ${borderColor} bg-white overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
        <h3 className={`text-sm font-semibold ${titleColor}`}>{title || data.metadata?.functionName || 'AST'}</h3>
        <div className="flex gap-1">
          <button onClick={expandAll} className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors">
            全部展开
          </button>
          <button onClick={collapseAll} className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors">
            全部折叠
          </button>
        </div>
      </div>
      <GraphContainer bounds={bounds} className="h-[500px] bg-white">
        <g>
          {edges.map(edge => (
            <ASTTreeEdge
              key={edge.id}
              edge={edge}
              isHighlighted={hoveredId === edge.sourceId || hoveredId === edge.targetId}
            />
          ))}
          {nodes.map(node => {
            const hasChildren = !!(node.data.children?.length);
            return (
              <ASTTreeNode
                key={node.id}
                node={node}
                isHovered={hoveredId === node.id}
                isCollapsed={collapsed.has(node.id)}
                hasChildren={hasChildren}
                onHover={setHoveredId}
                onToggleCollapse={toggleCollapse}
              />
            );
          })}
        </g>
      </GraphContainer>
      {hoveredId && (() => {
        const node = nodes.find(n => n.id === hoveredId);
        if (!node) return null;
        const props = node.data.properties;
        return (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs">
            <span className="font-semibold text-slate-700">{node.data.type}</span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="font-mono text-slate-600">{node.data.label}</span>
            {props && Object.entries(props).map(([k, v]) => (
              <span key={k} className="ml-3 text-slate-500">
                {k}: <span className="font-mono">{v}</span>
              </span>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ==================== Demo Data ====================

export const sourceASTData: ASTTreeData = {
  root: {
    id: 'root',
    type: 'TranslationUnit',
    label: 'main.c',
    children: [
      {
        id: 'func1',
        type: 'FunctionDeclaration',
        label: 'process_input',
        properties: { return: 'int', params: 'char *input' },
        children: [
          {
            id: 'type1',
            type: 'TypeSpecifier',
            label: 'int',
          },
          {
            id: 'compound1',
            type: 'CompoundStatement',
            label: '{ ... }',
            children: [
              {
                id: 'decl1',
                type: 'Declaration',
                label: 'char buffer[64]',
                properties: { type: 'char[64]', name: 'buffer' },
              },
              {
                id: 'if1',
                type: 'IfStatement',
                label: 'if (buffer != NULL)',
                children: [
                  {
                    id: 'call1',
                    type: 'CallExpression',
                    label: 'strcpy(buffer, input)',
                    properties: { callee: 'strcpy', args: 'buffer, input' },
                  },
                ],
              },
              {
                id: 'ret1',
                type: 'ReturnStatement',
                label: 'return 0',
              },
            ],
          },
        ],
      },
    ],
  },
  metadata: { functionName: 'process_input', language: 'C' },
};

export const targetASTData: ASTTreeData = {
  root: {
    id: 'root',
    type: 'TranslationUnit',
    label: 'main.c',
    children: [
      {
        id: 'func2',
        type: 'FunctionDeclaration',
        label: 'handle_data',
        properties: { return: 'int', params: 'char *user_input' },
        children: [
          {
            id: 'type2',
            type: 'TypeSpecifier',
            label: 'int',
          },
          {
            id: 'compound2',
            type: 'CompoundStatement',
            label: '{ ... }',
            children: [
              {
                id: 'decl2',
                type: 'Declaration',
                label: 'char temp_buf[64]',
                properties: { type: 'char[64]', name: 'temp_buf' },
              },
              {
                id: 'if2',
                type: 'IfStatement',
                label: 'if (temp_buf != NULL)',
                children: [
                  {
                    id: 'call2',
                    type: 'CallExpression',
                    label: 'strncpy(temp_buf, user_input, ...)',
                    properties: { callee: 'strncpy', args: 'temp_buf, user_input, sizeof-1' },
                  },
                ],
              },
              {
                id: 'ret2',
                type: 'ReturnStatement',
                label: 'return -1',
              },
            ],
          },
        ],
      },
    ],
  },
  metadata: { functionName: 'handle_data', language: 'C' },
};
