import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareButtonsProps {
  title?: string;
  text?: string;
  url?: string;
  lotteryResult?: {
    firstPrize?: string;
    lastTwo?: string;
    frontThree?: string[];
    lastThree?: string[];
    date?: string;
  };
}

// Social media icons as SVG components
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export function ShareButtons({ 
  title = "ผลสลากกินแบ่งรัฐบาล - Lottery Lab",
  text,
  url,
  lotteryResult 
}: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Generate share text from lottery result
  const generateShareText = () => {
    if (text) return text;
    
    if (lotteryResult) {
      let shareText = `🎰 ผลสลากกินแบ่งรัฐบาล`;
      if (lotteryResult.date) {
        shareText += ` (${lotteryResult.date})`;
      }
      shareText += `\n\n`;
      
      if (lotteryResult.firstPrize) {
        shareText += `🏆 รางวัลที่ 1: ${lotteryResult.firstPrize}\n`;
      }
      if (lotteryResult.lastTwo) {
        shareText += `🔢 เลขท้าย 2 ตัว: ${lotteryResult.lastTwo}\n`;
      }
      if (lotteryResult.frontThree && lotteryResult.frontThree.length > 0) {
        shareText += `📍 เลขหน้า 3 ตัว: ${lotteryResult.frontThree.join(', ')}\n`;
      }
      if (lotteryResult.lastThree && lotteryResult.lastThree.length > 0) {
        shareText += `📍 เลขท้าย 3 ตัว: ${lotteryResult.lastThree.join(', ')}\n`;
      }
      
      shareText += `\n🔗 ตรวจหวยออนไลน์ที่ Lottery Lab`;
      return shareText;
    }
    
    return "ตรวจผลสลากกินแบ่งรัฐบาลออนไลน์ที่ Lottery Lab 🎰";
  };

  const shareText = generateShareText();

  // Share URLs for each platform
  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(lineUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  // Native share API (for mobile)
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">แชร์</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-gray-900 border-white/20" align="end">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 px-2 py-1 mb-2">แชร์ผลหวยไปยัง</p>
          
          {/* Facebook */}
          <button
            onClick={shareFacebook}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-600/20 text-white transition-colors group"
          >
            <span className="text-blue-500 group-hover:text-blue-400">
              <FacebookIcon />
            </span>
            <span className="text-sm">Facebook</span>
          </button>
          
          {/* LINE */}
          <button
            onClick={shareLine}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-600/20 text-white transition-colors group"
          >
            <span className="text-green-500 group-hover:text-green-400">
              <LineIcon />
            </span>
            <span className="text-sm">LINE</span>
          </button>
          
          {/* Twitter/X */}
          <button
            onClick={shareTwitter}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-600/20 text-white transition-colors group"
          >
            <span className="text-gray-300 group-hover:text-white">
              <TwitterIcon />
            </span>
            <span className="text-sm">X (Twitter)</span>
          </button>
          
          {/* Native Share (Mobile) */}
          {hasNativeShare && (
            <>
              <div className="border-t border-white/10 my-2" />
              <button
                onClick={shareNative}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neon-cyan/20 text-white transition-colors group"
              >
                <span className="text-neon-cyan group-hover:text-neon-cyan/80">
                  <Share2 className="w-5 h-5" />
                </span>
                <span className="text-sm">แชร์เพิ่มเติม...</span>
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Inline share buttons (without popover)
export function InlineShareButtons({ 
  lotteryResult,
  url 
}: Pick<ShareButtonsProps, 'lotteryResult' | 'url'>) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const generateShareText = () => {
    if (lotteryResult) {
      let shareText = `🎰 ผลสลากกินแบ่งรัฐบาล`;
      if (lotteryResult.date) {
        shareText += ` (${lotteryResult.date})`;
      }
      if (lotteryResult.firstPrize) {
        shareText += ` | รางวัลที่ 1: ${lotteryResult.firstPrize}`;
      }
      if (lotteryResult.lastTwo) {
        shareText += ` | เลขท้าย 2 ตัว: ${lotteryResult.lastTwo}`;
      }
      shareText += ` 🔗`;
      return shareText;
    }
    return "ตรวจผลสลากกินแบ่งรัฐบาล 🎰";
  };

  const shareText = generateShareText();

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(lineUrl, '_blank', 'width=600,height=400');
  };

  const shareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 mr-1">แชร์:</span>
      
      <button
        onClick={shareFacebook}
        className="p-2 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 transition-colors"
        title="แชร์ไป Facebook"
      >
        <FacebookIcon />
      </button>
      
      <button
        onClick={shareLine}
        className="p-2 rounded-full bg-green-600/20 hover:bg-green-600/40 text-green-400 hover:text-green-300 transition-colors"
        title="แชร์ไป LINE"
      >
        <LineIcon />
      </button>
      
      <button
        onClick={shareTwitter}
        className="p-2 rounded-full bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 hover:text-white transition-colors"
        title="แชร์ไป X (Twitter)"
      >
        <TwitterIcon />
      </button>
    </div>
  );
}
