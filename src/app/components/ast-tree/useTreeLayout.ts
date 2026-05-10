import { useMemo } from 'react';
import type { ASTNode, PositionedNode, PositionedEdge } from './types';

interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  levelHeight: number;
  siblingGap: number;
  subtreeGap: number;
}

const defaults: LayoutOptions = {
  nodeWidth: 150,
  nodeHeight: 44,
  levelHeight: 70,
  siblingGap: 16,
  subtreeGap: 30,
};

interface SubtreeInfo {
  width: number;
  leaves: number;
}

function measureSubtree(node: ASTNode, collapsed: Set<string>, opts: LayoutOptions): SubtreeInfo {
  if (!node.children?.length || collapsed.has(node.id)) {
    return { width: opts.nodeWidth, leaves: 1 };
  }
  let totalWidth = 0;
  let totalLeaves = 0;
  for (const child of node.children) {
    const info = measureSubtree(child, collapsed, opts);
    totalWidth += info.width;
    totalLeaves += info.leaves;
  }
  totalWidth += (node.children.length - 1) * opts.siblingGap;
  return { width: Math.max(opts.nodeWidth, totalWidth), leaves: totalLeaves };
}

function positionNodes(
  node: ASTNode,
  collapsed: Set<string>,
  opts: LayoutOptions,
  x: number,
  y: number,
  allocatedWidth: number,
  nodes: PositionedNode[],
  edges: PositionedEdge[],
  parentId: string | null,
) {
  const cx = x + allocatedWidth / 2;
  const cy = y;

  nodes.push({
    id: node.id,
    x: cx,
    y: cy,
    width: opts.nodeWidth,
    height: opts.nodeHeight,
    data: node,
  });

  if (parentId) {
    edges.push({
      id: `${parentId}-${node.id}`,
      sourceId: parentId,
      targetId: node.id,
      sx: 0, sy: 0, tx: 0, ty: 0,
    });
  }

  if (!node.children?.length || collapsed.has(node.id)) return;

  const childInfos = node.children.map(child => measureSubtree(child, collapsed, opts));
  const totalChildWidth = childInfos.reduce((sum, info) => sum + info.width, 0) + (node.children.length - 1) * opts.siblingGap;
  let childX = x + (allocatedWidth - totalChildWidth) / 2;

  for (let i = 0; i < node.children.length; i++) {
    positionNodes(
      node.children[i],
      collapsed,
      opts,
      childX,
      y + opts.levelHeight,
      childInfos[i].width,
      nodes,
      edges,
      node.id,
    );
    childX += childInfos[i].width + opts.siblingGap;
  }
}

function resolveEdges(nodes: PositionedNode[], edges: PositionedEdge[]): PositionedEdge[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  return edges.map(edge => {
    const source = nodeMap.get(edge.sourceId)!;
    const target = nodeMap.get(edge.targetId)!;
    return {
      ...edge,
      sx: source.x,
      sy: source.y + source.height / 2,
      tx: target.x,
      ty: target.y - target.height / 2,
    };
  });
}

export function useTreeLayout(
  root: ASTNode,
  collapsedIds: Set<string>,
  options?: Partial<LayoutOptions>,
) {
  return useMemo(() => {
    const opts = { ...defaults, ...options };
    const info = measureSubtree(root, collapsedIds, opts);
    const totalWidth = Math.max(opts.nodeWidth, info.width);
    const nodes: PositionedNode[] = [];
    const edges: PositionedEdge[] = [];

    positionNodes(root, collapsedIds, opts, 0, 0, totalWidth, nodes, edges, null);
    const resolvedEdges = resolveEdges(nodes, edges);

    const maxY = nodes.reduce((max, n) => Math.max(max, n.y + n.height), 0);
    const minX = nodes.reduce((min, n) => Math.min(min, n.x - n.width / 2), Infinity);
    const maxX = nodes.reduce((max, n) => Math.max(max, n.x + n.width / 2), -Infinity);

    return {
      nodes,
      edges: resolvedEdges,
      bounds: { width: maxX - minX + 40, height: maxY + 20 },
    };
  }, [root, collapsedIds, options]);
}
