import React, { useState, useRef, useEffect } from 'react';
import { Screen } from '../../types';

interface FlowViewProps {
  screens: Screen[];
  onScreenClick: (screenId: string) => void;
  onScreenMove: (id: string, x: number, y: number) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onDisconnect: (sourceId: string, targetId: string) => void;
}

export const FlowView: React.FC<FlowViewProps> = ({ screens, onScreenClick, onScreenMove, onConnect, onDisconnect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for dragging screens
  const [draggingScreen, setDraggingScreen] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // State for creating connections
  const [connectingSource, setConnectingSource] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, screenId: string) => {
    // Only drag if not clicking the connector or other interactive elements
    if ((e.target as HTMLElement).closest('.connector-handle')) return;
    if ((e.target as HTMLElement).closest('.action-button')) return;
    
    e.preventDefault(); 
    e.stopPropagation();
    
    const screen = screens.find(s => s.id === screenId);
    if (screen && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setDraggingScreen(screenId);
      setDragOffset({
        x: e.clientX - containerRect.left - screen.x,
        y: e.clientY - containerRect.top - screen.y
      });
    }
  };

  const handleConnectorMouseDown = (e: React.MouseEvent, screenId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectingSource(screenId);
    
    // Set initial mouse pos
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  // Use window events for smoother dragging that doesn't get lost if you move mouse too fast
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setMousePos({ x, y });

        if (draggingScreen) {
            onScreenMove(draggingScreen, x - dragOffset.x, y - dragOffset.y);
        }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
        if (connectingSource) {
             // Check if dropped on a screen
             const elements = document.elementsFromPoint(e.clientX, e.clientY);
             const screenCard = elements.find(el => el.closest('.screen-card'))?.closest('.screen-card');
             
             if (screenCard) {
                 const targetId = screenCard.getAttribute('data-id');
                 if (targetId && targetId !== connectingSource) {
                     onConnect(connectingSource, targetId);
                 }
             }
        }
        
        setDraggingScreen(null);
        setConnectingSource(null);
    };

    if (draggingScreen || connectingSource) {
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingScreen, connectingSource, dragOffset, onScreenMove, onConnect]);


  // SVG Paths
  const renderConnections = () => {
    const paths = [];

    // Existing connections
    screens.forEach(screen => {
      screen.connections.forEach(targetId => {
        const target = screens.find(s => s.id === targetId);
        if (target) {
            paths.push({
                id: `${screen.id}-${targetId}`,
                path: getPath(screen, target),
                color: '#64748b', // slate-500
                active: false,
                source: screen.id,
                target: targetId
            });
        }
      });
    });

    // Temporary connection while dragging
    if (connectingSource && containerRef.current) {
        const sourceScreen = screens.find(s => s.id === connectingSource);
        if (sourceScreen) {
            const startX = sourceScreen.x + 192; // Right side
            const startY = sourceScreen.y + 64; // Middle
            
            const endX = mousePos.x;
            const endY = mousePos.y;

            // Bezier curve
            const cp1x = startX + (endX - startX) / 2;
            const cp1y = startY;
            const cp2x = startX + (endX - startX) / 2;
            const cp2y = endY;
            
            const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
            
            return (
                <>
                    {paths.map(p => renderPath(p))}
                    <path d={d} stroke="#22d3ee" strokeWidth="3" fill="none" strokeDasharray="6,4" className="animate-[dash_1s_linear_infinite] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                    <style>{`@keyframes dash { to { stroke-dashoffset: -10; } }`}</style>
                </>
            );
        }
    }

    return paths.map(p => renderPath(p));
  };

  const getPath = (source: Screen, target: Screen) => {
    const startX = source.x + 192;
    const startY = source.y + 64;
    const endX = target.x;
    const endY = target.y + 64;

    const cp1x = startX + (endX - startX) / 2;
    const cp1y = startY;
    const cp2x = startX + (endX - startX) / 2;
    const cp2y = endY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  const renderPath = (p: any) => (
      <g key={p.id} className="group cursor-pointer" onClick={() => onDisconnect(p.source, p.target)}>
          {/* Invisible wide path for easier clicking */}
          <path d={p.path} stroke="transparent" strokeWidth="20" fill="none" />
          {/* Visible path */}
          <path 
            d={p.path} 
            stroke={p.color} 
            strokeWidth="2" 
            fill="none" 
            className="group-hover:stroke-red-400 transition-colors duration-300"
          />
           <circle cx={0} cy={0} r="3" fill={p.color} className="group-hover:fill-red-400">
             <animateMotion dur="3s" repeatCount="indefinite" path={p.path} />
           </circle>
      </g>
  );

  return (
    <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-slate-950 cursor-crosshair select-none"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         <div 
            className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{
                backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
         ></div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {renderConnections()}
      </svg>
      
      {screens.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center opacity-60 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
                  <div className="text-6xl mb-4 grayscale animate-pulse">🌌</div>
                  <h3 className="text-2xl font-bold text-slate-200">The Canvas is Empty</h3>
                  <p className="text-slate-400">Click "+ Add Screen" to begin your journey</p>
              </div>
          </div>
      )}

      {screens.map((screen, index) => (
        <div
          key={screen.id}
          data-id={screen.id}
          className={`screen-card absolute w-48 flex flex-col rounded-xl transition-all group z-20
            ${connectingSource === screen.id ? 'ring-2 ring-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]'}
            ${draggingScreen === screen.id ? 'cursor-grabbing scale-105 z-50 ring-2 ring-cyan-400 shadow-[0_10px_40px_rgba(0,0,0,0.8)]' : 'cursor-grab shadow-[0_4px_20px_rgba(0,0,0,0.6)]'}
          `}
          style={{ 
              left: screen.x, 
              top: screen.y,
              // Explicit Z-index layering: active screen higher, new screens naturally higher via index if not active
              zIndex: draggingScreen === screen.id ? 100 : 20 + index, 
              background: 'linear-gradient(145deg, #1e293b, #0f172a)',
              border: '1px solid #475569'
          }}
          onMouseDown={(e) => handleMouseDown(e, screen.id)}
        >
            {/* Header */}
            <div className="p-3 border-b border-slate-600/50 flex justify-between items-center bg-white/5 rounded-t-xl select-none">
                <span className="font-bold text-slate-100 truncate text-sm shadow-sm">{screen.name}</span>
                <div className="flex gap-1 action-button">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors border border-transparent hover:border-red-300" title="Delete" />
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors border border-transparent hover:border-yellow-300" />
                </div>
            </div>
            
            {/* Body */}
            <div 
                className="p-4 h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors relative rounded-b-xl"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!draggingScreen && !connectingSource) {
                        onScreenClick(screen.id);
                    }
                }}
            >
                <div className="text-4xl mb-3 text-cyan-500 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    {screen.components.length > 0 ? '📱' : '🆕'}
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white font-mono font-semibold transition-colors">
                    {screen.components.length} Components
                </span>
                <div className="absolute bottom-2 text-[10px] text-cyan-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit UI
                </div>
            </div>

            {/* Input Port (Visual Only) */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-700 rounded-full border border-slate-400 shadow-md z-30" />

            {/* Output Port (Connector Handle) */}
            <div 
                className="connector-handle absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-cyan-500 rounded-full border-2 border-white cursor-alias hover:scale-125 transition-transform z-30 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                onMouseDown={(e) => handleConnectorMouseDown(e, screen.id)}
                title="Drag to connect"
            />
        </div>
      ))}
    </div>
  );
};