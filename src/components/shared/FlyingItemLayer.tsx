import React from 'react';

export interface FlyingItem {
  id: number;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  emoji: string;
}

interface FlyingItemLayerProps {
  items: FlyingItem[];
}

export default function FlyingItemLayer({ items }: FlyingItemLayerProps) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'fixed',
            left: '0px',
            top: '0px',
            zIndex: 9999,
            pointerEvents: 'none',
            '--start-x': `${item.x}px`,
            '--start-y': `${item.y}px`,
            '--target-x': `${item.targetX ?? item.x + 100}px`,
            '--target-y': `${item.targetY ?? item.y + 400}px`,
          } as React.CSSProperties}
          className="flying-emoji-node text-3xl select-none"
        >
          {item.emoji}
        </div>
      ))}

      {/* 内联动画样式（保持原有效果） */}
      <style>{`
        @keyframes flyToCenterCart {
          0% {
            opacity: 1;
            transform: translate(var(--start-x), var(--start-y)) scale(1) rotate(0deg);
          }
          35% {
            opacity: 1;
            transform: translate(calc(var(--start-x) - 15px), calc(var(--start-y) - 60px)) scale(1.3) rotate(-35deg);
          }
          100% {
            opacity: 0.15;
            transform: translate(var(--target-x), var(--target-y)) scale(0.25) rotate(540deg);
          }
        }
        .flying-emoji-node {
          animation: flyToCenterCart 0.85s cubic-bezier(0.1, 0.75, 0.3, 1) forwards;
        }
        @keyframes toastCenterIn {
          0% { opacity: 0; transform: scale(0.85); }
          12% { opacity: 1; transform: scale(1.08); }
          16% { opacity: 1; transform: scale(1); }
          85% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.92) translateY(8px); }
        }
        .animate-toast-center {
          animation: toastCenterIn 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </>
  );
}