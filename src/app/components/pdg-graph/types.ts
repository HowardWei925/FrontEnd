export interface PDGNodeData {
  id: string;
  statement: string;
  type: 'declaration' | 'condition' | 'call' | 'return' | 'assignment' | 'other';
  location?: { line: number; column: number };
  properties?: Record<string, string>;
}

export interface PDGEdgeData {
  id: string;
  source: string;
  target: string;
  dependencyType: 'data' | 'control';
  label?: string;
  varName?: string;
}

export interface PDGGraphData {
  nodes: PDGNodeData[];
  edges: PDGEdgeData[];
  metadata?: {
    functionName: string;
  };
}

export interface PositionedGraphNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: PDGNodeData;
}

export interface PositionedGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  points: { x: number; y: number }[];
  label: string;
  dependencyType: 'data' | 'control';
}
