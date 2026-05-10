import { useState } from 'react';
import type { PDGGraphData } from './types';
import { useGraphLayout } from './useGraphLayout';
import { PDGGraphNode } from './PDGGraphNode';
import { PDGGraphEdge } from './PDGGraphEdge';
import { GraphContainer } from '../shared/GraphContainer';

interface PDGGraphVisualizationProps {
  data: PDGGraphData;
  title?: string;
}

export function PDGGraphVisualization({ data, title }: PDGGraphVisualizationProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { nodes, edges, bounds } = useGraphLayout(data.nodes, data.edges);

  const hoveredNode = hoveredId ? nodes.find(n => n.id === hoveredId) : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">{title || data.metadata?.functionName || 'PDG'}</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-500 rounded inline-block" />
            数据依赖
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-500 rounded inline-block border-dashed" style={{ borderTop: '2px dashed #f59e0b', background: 'none', height: 0 }} />
            控制依赖
          </span>
        </div>
      </div>
      <GraphContainer bounds={bounds} className="h-[500px] bg-white">
        <defs>
          <marker id="arrow-data" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse" pathContext="none">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-data-hl" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-control" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
          <marker id="arrow-control-hl" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
        </defs>
        <g>
          {edges.map(edge => {
            const isHl = hoveredId === edge.sourceId || hoveredId === edge.targetId;
            const markerId = edge.dependencyType === 'data'
              ? (isHl ? 'arrow-data-hl' : 'arrow-data')
              : (isHl ? 'arrow-control-hl' : 'arrow-control');
            return (
              <PDGGraphEdge
                key={edge.id}
                edge={edge}
                isHighlighted={isHl}
                markerId={markerId}
              />
            );
          })}
          {nodes.map(node => (
            <PDGGraphNode
              key={node.id}
              node={node}
              isHovered={hoveredId === node.id}
              onHover={setHoveredId}
            />
          ))}
        </g>
      </GraphContainer>
      {hoveredNode && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs">
          <span className="font-semibold text-slate-700">{hoveredNode.data.type.toUpperCase()}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-mono text-slate-600">{hoveredNode.data.statement}</span>
          {hoveredNode.data.location && (
            <span className="ml-3 text-slate-400">Line {hoveredNode.data.location.line}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== Demo Data ====================

export const demoPDGData: PDGGraphData = {
  nodes: [
    { id: 'n1', statement: 'int ret = 0;', type: 'declaration', location: { line: 5, column: 4 } },
    { id: 'n2', statement: 'char buffer[64];', type: 'declaration', location: { line: 6, column: 4 } },
    { id: 'n3', statement: 'if (!rval)', type: 'condition', location: { line: 8, column: 4 }, properties: { variable: 'rval' } },
    { id: 'n4', statement: 'strncpy(buffer, input, sizeof(buffer)-1)', type: 'call', location: { line: 9, column: 8 }, properties: { callee: 'strncpy' } },
    { id: 'n5', statement: 'buffer[sizeof(buffer)-1] = \'\\0\'', type: 'assignment', location: { line: 10, column: 8 } },
    { id: 'n6', statement: 'bsg_job_done(rval)', type: 'call', location: { line: 12, column: 8 }, properties: { callee: 'bsg_job_done' } },
    { id: 'n7', statement: 'return rval', type: 'return', location: { line: 14, column: 4 } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n3', dependencyType: 'data', label: 'rval', varName: 'rval' },
    { id: 'e2', source: 'n2', target: 'n4', dependencyType: 'data', label: 'buffer', varName: 'buffer' },
    { id: 'e3', source: 'n3', target: 'n4', dependencyType: 'control', label: 'then' },
    { id: 'e4', source: 'n3', target: 'n6', dependencyType: 'control', label: 'else' },
    { id: 'e5', source: 'n4', target: 'n5', dependencyType: 'data', label: 'buffer' },
    { id: 'e6', source: 'n6', target: 'n7', dependencyType: 'data', label: 'rval' },
  ],
  metadata: { functionName: 'process_input' },
};
