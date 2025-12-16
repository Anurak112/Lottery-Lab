import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tv, Youtube, Users, MessageSquare, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { CommentSection, Comment } from "./CommentSection";
import { DanmakuOverlay } from "./DanmakuOverlay";
import { TextToSpeech } from "./TextToSpeech";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useUIStore } from "@/stores/uiStore";
import { generateMockComment, getRandomMessageInterval } from "@/lib/mockThaiChat";

export function LiveStream() {
  const [videoId, setVideoId] = useState<string>("zNrJt_dsXaU");
  const [isLive, setIsLive] = useState(false);
  const [statusText, setStatusText] = useState("กำลังโหลด...");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [lastCommentText, setLastCommentText] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [activeChat, setActiveChat] = useState<'youtube' | 'website' | 'both'>('both');
  
  // Chat State - Website comments only (YouTube chat is embedded)
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Notification Sound
  const { playPopSound } = useNotificationSound();
  const { chatSettings, setChatSettings } = useUIStore();
  const prevCommentsLengthRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  // Fetch live status from YouTube API
  const { data: liveStatus } = trpc.youtube.getLiveStatus.useQuery(
    undefined,
    {
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );

  // Fetch chat messages from database
  const { data: dbMessages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { limit: 50 },
    {
      refetchInterval: 5000,
      staleTime: 3000,
    }
  );

  // Send message mutation
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  // Update video status when API responds
  useEffect(() => {
    if (liveStatus) {
      if (liveStatus.isLive && liveStatus.videoId) {
        setIsLive(true);
        setVideoId(liveStatus.videoId);
        setStatusText("🔴 ถ่ายทอดสด: การออกรางวัลสลากกินแบ่งรัฐบาล");
      } else if (liveStatus.videoId) {
        setIsLive(false);
        setVideoId(liveStatus.videoId);
        setStatusText("📺 รายการล่าสุด: " + (liveStatus.title || "การออกรางวัลสลากกินแบ่งรัฐบาล"));
      } else {
        checkLiveStatusByTime();
      }
    }
  }, [liveStatus]);

  // Fallback time-based live check
  const checkLiveStatusByTime = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isDrawDay = currentDay === 1 || currentDay === 16;
    const isLiveTime = currentHour >= 13 && (currentHour < 16 || (currentHour === 13 && currentMinute >= 30));

    if (isDrawDay && isLiveTime) {
      setIsLive(true);
      setStatusText("🔴 ถ่ายทอดสด: การออกรางวัลสลากกินแบ่งรัฐบาล");
    } else {
      setIsLive(false);
      setStatusText("📺 รายการล่าสุด");
    }
  }, []);

  // Load database messages and play notification sound for new messages
  useEffect(() => {
    if (dbMessages && dbMessages.length > 0) {
      const formattedMessages: Comment[] = dbMessages.map((msg: {
        id: number;
        guestName: string | null;
        message: string;
        createdAt: Date | string;
        isGuest: boolean;
        user?: { name: string } | null;
      }) => ({
        id: msg.id,
        user: msg.isGuest ? (msg.guestName || 'ผู้เยี่ยมชม') : (msg.user?.name || 'User'),
        text: msg.message,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGuest: msg.isGuest,
        source: 'website' as const,
      }));
      
      // Play notification sound for new messages (not on initial load)
      const newLength = formattedMessages.length;
      if (!isInitialLoadRef.current && newLength > prevCommentsLengthRef.current && chatSettings.soundEnabled) {
        playPopSound();
      }
      prevCommentsLengthRef.current = newLength;
      isInitialLoadRef.current = false;
      
      setComments(formattedMessages.slice(-100));
    }
  }, [dbMessages, chatSettings.soundEnabled, playPopSound]);

  // Simulate viewer count
  useEffect(() => {
    setViewerCount(Math.floor(Math.random() * 5000) + 2000);
    
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(1000, prev + Math.floor(Math.random() * 40) - 20));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Mock Thai chat messages (4-15 messages per minute)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mockIdCounter = Date.now();
    
    const addMockMessage = () => {
      const mockComment = generateMockComment(mockIdCounter++);
      
      setComments(prev => {
        const updated = [...prev, mockComment].slice(-100);
        setLastCommentText(mockComment.text);
        return updated;
      });
      
      // Play notification sound for mock messages
      if (chatSettings.soundEnabled) {
        playPopSound();
      }
      
      // Schedule next message with random interval (4-15 messages per minute)
      timeoutId = setTimeout(addMockMessage, getRandomMessageInterval());
    };
    
    // Start mock messages after initial delay
    timeoutId = setTimeout(addMockMessage, getRandomMessageInterval());
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [chatSettings.soundEnabled, playPopSound]);

  const handleAddComment = useCallback((text: string) => {
    const guestName = `ผู้เยี่ยมชม_${Math.floor(Math.random() * 1000)}`;
    
    sendMessage.mutate({
      message: text,
      guestName: guestName,
    });

    const comment: Comment = {
      id: Date.now(),
      user: guestName,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGuest: true,
      source: 'website',
    };
    
    setComments(prev => {
      const updated = [...prev, comment];
      setLastCommentText(comment.text);
      return updated;
    });
  }, [sendMessage]);

  // YouTube Live Chat embed URL
  const youtubeChatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;

  return (
    <Card className="glass-card border-none overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <Tv className={`w-5 h-5 ${isLive ? 'text-red-500 animate-pulse' : 'text-neon-blue'}`} />
            {statusText}
          </CardTitle>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            {isLive && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {viewerCount.toLocaleString()} กำลังรับชม
              </span>
            )}
            
            {/* Sound Notification Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatSettings({ soundEnabled: !chatSettings.soundEnabled })}
              className={`p-2 h-8 w-8 transition-colors ${
                chatSettings.soundEnabled 
                  ? 'text-neon-cyan hover:text-neon-cyan/80' 
                  : 'text-gray-500 hover:text-gray-400'
              }`}
              title={chatSettings.soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
            >
              {chatSettings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Main Content: Video + Chat Side by Side on Large Screens */}
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Video Section */}
          <div className="flex-1 aspect-video w-full relative group">
            <iframe
              className="w-full h-full absolute inset-0"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title="Thai Lottery Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {/* Danmaku Overlay - Only shows website comments */}
            <DanmakuOverlay messages={comments} />

            {/* Text to Speech Control */}
            <TextToSpeech 
              text={lastCommentText} 
              enabled={ttsEnabled} 
              onToggle={() => setTtsEnabled(!ttsEnabled)} 
            />
          </div>

          {/* Chat Section - Side Panel on Large Screens - EXTENDED HEIGHT */}
          <div className="lg:w-[420px] border-t lg:border-t-0 lg:border-l border-white/10 bg-black/40">
            <Tabs defaultValue="both" className="h-full flex flex-col" onValueChange={(v) => setActiveChat(v as typeof activeChat)}>
              <TabsList className="w-full rounded-none bg-black/40 border-b border-white/10 p-1">
                <TabsTrigger value="youtube" className="flex-1 text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                  <Youtube className="w-3 h-3 mr-1" />
                  YouTube
                </TabsTrigger>
                <TabsTrigger value="website" className="flex-1 text-xs data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-blue">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  เว็บไซต์
                </TabsTrigger>
                <TabsTrigger value="both" className="flex-1 text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  <Users className="w-3 h-3 mr-1" />
                  ทั้งหมด
                </TabsTrigger>
              </TabsList>

              {/* YouTube Live Chat Embed - Extended Height */}
              <TabsContent value="youtube" className="flex-1 m-0 h-[500px] lg:h-auto">
                <div className="h-full flex flex-col min-h-[450px]">
                  <iframe
                    className="flex-1 w-full min-h-[400px]"
                    src={youtubeChatUrl}
                    title="YouTube Live Chat"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                  <div className="p-2 bg-black/60 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-gray-400 hover:text-white"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      เปิดใน YouTube เพื่อแชท
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Website Chat - Extended Height */}
              <TabsContent value="website" className="flex-1 m-0 h-[500px] lg:h-auto min-h-[450px]">
                <CommentSection comments={comments} onAddComment={handleAddComment} />
              </TabsContent>

              {/* Both Chats - Split View - Extended Height */}
              <TabsContent value="both" className="flex-1 m-0 h-[600px] lg:h-auto overflow-hidden min-h-[500px]">
                <div className="h-full flex flex-col">
                  {/* YouTube Chat - Top Half */}
                  <div className="flex-1 border-b border-white/10 min-h-[250px]">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border-b border-white/10">
                      <Youtube className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-400 font-medium">YouTube Live Chat</span>
                    </div>
                    <iframe
                      className="w-full h-[calc(100%-28px)]"
                      src={youtubeChatUrl}
                      title="YouTube Live Chat"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  
                  {/* Website Chat - Bottom Half */}
                  <div className="flex-1 min-h-[250px]">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-blue/10 border-b border-white/10">
                      <MessageSquare className="w-3 h-3 text-neon-blue" />
                      <span className="text-xs text-neon-blue font-medium">แชทเว็บไซต์</span>
                    </div>
                    <div className="h-[calc(100%-28px)]">
                      <CommentSection comments={comments} onAddComment={handleAddComment} compact />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
