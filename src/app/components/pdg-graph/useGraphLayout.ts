import { useMemo } from 'react';
import dagre from 'dagre';
import type { PDGNodeData, PDGEdgeData, PositionedGraphNode, PositionedGraphEdge } from './types';

interface LayoutOptions {
  rankdir: 'TB' | 'LR';
  nodeHeight: number;
  nodesep: number;
  ranksep: number;
}

const defaults: LayoutOptions = {
  rankdir: 'TB',
  nodeHeight: 52,
  nodesep: 60,
  ranksep: 80,
};

function estimateWidth(text: string): number {
  return Math.max(140, Math.min(280, text.length * 8 + 40));
}

export function useGraphLayout(
  nodes: PDGNodeData[],
  edges: PDGEdgeData[],
  options?: Partial<LayoutOptions>,
) {
  return useMemo(() => {
    const opts = { ...defaults, ...options };
    const g = new dagre.graphlib.Graph({ directed: true, compound: false, multigraph: true });
    g.setGraph({ rankdir: opts.rankdir, nodesep: opts.nodesep, ranksep: opts.ranksep, marginx: 20, marginy: 20 });
    g.setDefaultEdgeLabel(() => ({}));

    for (const node of nodes) {
      const w = estimateWidth(node.statement);
      g.setNode(node.id, { width: w, height: opts.nodeHeight });
    }
    for (const edge of edges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    const positionedNodes: PositionedGraphNode[] = nodes.map(node => {
      const dagNode = g.node(node.id);
      return {
        id: node.id,
        x: dagNode.x,
        y: dagNode.y,
        width: dagNode.width,
        height: dagNode.height,
        data: node,
      };
    });

    const positionedEdges: PositionedGraphEdge[] = edges.map(edge => {
      const dagEdge = g.edge(edge.source, edge.target);
      return {
        id: edge.id,
        sourceId: edge.source,
        targetId: edge.target,
        points: dagEdge.points || [],
        label: edge.label || edge.varName || '',
        dependencyType: edge.dependencyType,
      };
    });

    const allX = positionedNodes.flatMap(n => [n.x - n.width / 2, n.x + n.width / 2]);
    const allY = positionedNodes.flatMap(n => [n.y - n.height / 2, n.y + n.height / 2]);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    return {
      nodes: positionedNodes,
      edges: positionedEdges,
      bounds: { width: maxX - minX + 40, height: maxY - minY + 40 },
    };
  }, [nodes, edges, options]);
}
