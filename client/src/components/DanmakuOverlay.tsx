import { useEffect, useState, useRef } from 'react';

interface DanmakuMessage {
  id: number;
  text: string;
  top: number;
  duration: number;
  color: string;
}

interface DanmakuOverlayProps {
  messages: { id: number; text: string; user: string }[];
}

export function DanmakuOverlay({ messages }: DanmakuOverlayProps) {
  const [danmakuList, setDanmakuList] = useState<DanmakuMessage[]>([]);
  const lastMessageIdRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    
    // Only process new messages
    if (latestMessage.id <= lastMessageIdRef.current) return;
    lastMessageIdRef.current = latestMessage.id;

    // Create new danmaku item
    const newDanmaku: DanmakuMessage = {
      id: latestMessage.id,
      text: latestMessage.text,
      top: Math.random() * 80 + 5, // Random position between 5% and 85% from top
      duration: Math.random() * 5 + 8, // Random duration between 8s and 13s
      color: getRandomColor(),
    };

    setDanmakuList(prev => [...prev, newDanmaku]);

    // Cleanup old messages after they finish animation
    setTimeout(() => {
      setDanmakuList(prev => prev.filter(item => item.id !== newDanmaku.id));
    }, newDanmaku.duration * 1000 + 1000); // Add buffer time

  }, [messages]);

  const getRandomColor = () => {
    const colors = [
      '#ffffff', // White
      '#00ffff', // Cyan
      '#ff00ff', // Magenta
      '#ffff00', // Yellow
      '#00ff00', // Green
      '#ff9900', // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    >
      {danmakuList.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap text-lg font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-danmaku"
          style={{
            top: `${item.top}%`,
            color: item.color,
            animationDuration: `${item.duration}s`,
            right: '-100%', // Start off-screen right
          }}
        >
          {item.text}
        </div>
      ))}
      <style>{`
        @keyframes danmaku {
          from { transform: translateX(0); right: -20%; }
          to { transform: translateX(-150vw); right: 100%; }
        }
        .animate-danmaku {
          animation-name: danmaku;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
