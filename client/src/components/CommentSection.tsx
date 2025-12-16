import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

export interface Comment {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  isGuest: boolean;
  source?: 'youtube' | 'website';
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  compact?: boolean;
}

export function CommentSection({ comments, onAddComment, compact = false }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleSend = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
    // Force scroll to bottom when user sends a message
    setShouldAutoScroll(true);
  };

  // Check if user has scrolled up (to disable auto-scroll)
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // If user is within 50px of bottom, enable auto-scroll
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isNearBottom);
    }
  };

  // Auto-scroll to bottom when new comments arrive (only if shouldAutoScroll is true)
  useLayoutEffect(() => {
    if (shouldAutoScroll && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [comments, shouldAutoScroll]);

  return (
    <div className="bg-black/40 backdrop-blur-sm border-t border-white/10 p-4 h-full flex flex-col">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"/>
        Live Chat
      </h3>
      
      {/* Custom scrollable container instead of ScrollArea */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`${compact ? 'h-[150px]' : 'flex-1 min-h-[200px]'} overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`}
        style={{ 
          scrollBehavior: 'auto',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Avatar className="w-8 h-8 border border-white/10 shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user}`} />
                <AvatarFallback className="bg-white/10 text-white text-xs">{comment.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`text-sm font-medium truncate max-w-[120px] ${comment.source === 'youtube' ? 'text-red-400' : comment.isGuest ? 'text-neon-cyan' : 'text-neon-purple'}`}>
                    {comment.source === 'youtube' && <span className="text-[10px] mr-1">▶</span>}
                    {comment.user}
                  </span>
                  <span className="text-[10px] text-white/40 shrink-0">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed break-words">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to bottom indicator */}
      {!shouldAutoScroll && comments.length > 0 && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
          }}
          className="mb-2 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors text-center"
        >
          ↓ เลื่อนไปข้อความล่าสุด
        </button>
      )}

      <div className="flex gap-2 shrink-0">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="แสดงความคิดเห็นในฐานะผู้เยี่ยมชม..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-neon-blue"
        />
        <Button 
          onClick={handleSend}
          size="icon"
          className="bg-neon-blue hover:bg-neon-blue/80 text-black shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
