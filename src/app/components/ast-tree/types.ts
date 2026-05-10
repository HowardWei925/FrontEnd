export interface ASTNode {
  id: string;
  type: string;
  label: string;
  properties?: Record<string, string>;
  children?: ASTNode[];
}

export interface ASTTreeData {
  root: ASTNode;
  metadata?: {
    functionName: string;
    language: string;
  };
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: ASTNode;
}

export interface PositionedEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}
