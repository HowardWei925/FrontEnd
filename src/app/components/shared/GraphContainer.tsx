import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, ZoomOut, Maximize2, Maximize, Minimize } from 'lucide-react';

interface GraphContainerProps {
  bounds: { width: number; height: number };
  children: ReactNode;
  className?: string;
  initialPadding?: number;
}

export function GraphContainer({ bounds, children, className = '', initialPadding = 40 }: GraphContainerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const cleanupWheel = useRef<(() => void) | null>(null);

  // 完美绑定原生滚轮事件的 ref callback，不会因为 DOM 重绘而丢失
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (cleanupWheel.current) {
      cleanupWheel.current();
      cleanupWheel.current = null;
    }
    if (node) {
      const handleWheel = (e: WheelEvent) => e.preventDefault();
      node.addEventListener('wheel', handleWheel, { passive: false });
      cleanupWheel.current = () => node.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const fitToView = useCallback(() => {
    setViewBox({
      x: -initialPadding,
      y: -initialPadding,
      width: bounds.width + initialPadding * 2,
      height: bounds.height + initialPadding * 2,
    });
  }, [bounds.width, bounds.height, initialPadding]);

  useEffect(() => {
    fitToView();
  }, [fitToView]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
    const mouseY = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;

    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const newWidth = viewBox.width * factor;
    const newHeight = viewBox.height * factor;

    setViewBox({
      x: mouseX - (mouseX - viewBox.x) * factor,
      y: mouseY - (mouseY - viewBox.y) * factor,
      width: newWidth,
      height: newHeight,
    });
  }, [viewBox]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  }, [viewBox.x, viewBox.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - panStart.current.x) / rect.width) * viewBox.width;
    const dy = ((e.clientY - panStart.current.y) / rect.height) * viewBox.height;

    setViewBox(prev => ({ ...prev, x: panStart.current.vx - dx, y: panStart.current.vy - dy }));
  }, [isPanning, viewBox.width, viewBox.height]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const zoomIn = useCallback(() => {
    setViewBox(prev => ({
      x: prev.x + prev.width * 0.1,
      y: prev.y + prev.height * 0.1,
      width: prev.width * 0.8,
      height: prev.height * 0.8,
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewBox(prev => ({
      x: prev.x - prev.width * 0.125,
      y: prev.y - prev.height * 0.125,
      width: prev.width * 1.25,
      height: prev.height * 1.25,
    }));
  }, []);

  const content = (
    <div 
      ref={containerRef} 
      style={isFullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, backgroundColor: '#f8fafc' } : undefined}
      className={`relative ${!isFullscreen ? className : ''}`}
    >
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        <button onClick={zoomIn} className="p-1.5 bg-white/90 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm" title="放大">
          <ZoomIn className="w-4 h-4 text-slate-600" />
        </button>
        <button onClick={zoomOut} className="p-1.5 bg-white/90 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm" title="缩小">
          <ZoomOut className="w-4 h-4 text-slate-600" />
        </button>
        <button onClick={fitToView} className="p-1.5 bg-white/90 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm" title="适配视图">
          <Maximize2 className="w-4 h-4 text-slate-600" />
        </button>
        <button onClick={toggleFullscreen} className="p-1.5 bg-white/90 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm" title={isFullscreen ? "退出全屏" : "全屏"}>
          {isFullscreen ? <Minimize className="w-4 h-4 text-slate-600" /> : <Maximize className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </svg>
    </div>
  );

  if (isFullscreen && typeof document !== 'undefined') {
    return (
      <>
        <div className={className} /> {/* 原位置占位，防止全屏后页面布局跳动 */}
        {createPortal(content, document.body)}
      </>
    );
  }

  return content;
}
