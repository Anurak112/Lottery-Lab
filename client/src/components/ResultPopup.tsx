import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface ResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isWin: boolean;
  prizes: string[];
  number: string;
}

const WIN_IMAGES = [
  "/images/win_1.png",
  "/images/win_2.png",
  "/images/win_3.png"
];

const LOSE_IMAGES = [
  "/images/lose_1.png",
  "/images/lose_2.png",
  "/images/lose_3.png"
];

export function ResultPopup({ isOpen, onClose, isWin, prizes, number }: ResultPopupProps) {
  const [imageSrc, setImageSrc] = useState("");
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (isOpen) {
      const images = isWin ? WIN_IMAGES : LOSE_IMAGES;
      const randomImage = images[Math.floor(Math.random() * images.length)];
      setImageSrc(randomImage);
    }
  }, [isOpen, isWin]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Lottery Result</DialogTitle>
        </VisuallyHidden>
        {isWin && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 z-50 text-white/60 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex flex-col items-center text-center p-6 space-y-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full aspect-square relative rounded-xl overflow-hidden shadow-2xl"
            >
              <img 
                src={imageSrc} 
                alt={isWin ? "Winning Celebration" : "Better Luck Next Time"} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-0 right-0 p-4">
                <h2 className={`text-3xl font-bold mb-2 ${isWin ? 'text-neon-green' : 'text-white/80'}`}>
                  {isWin ? "YAY! YOU WON!" : "OH NO..."}
                </h2>
                <p className="text-white/90 font-mono text-xl tracking-widest bg-black/40 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  {number}
                </p>
              </div>
            </motion.div>

            <div className="space-y-4 w-full">
              {isWin ? (
                <div className="space-y-2">
                  <p className="text-white/60 text-sm">You have won:</p>
                  {prizes.map((prize, index) => (
                    <motion.div 
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                      className="bg-neon-green/10 border border-neon-green/20 p-3 rounded-lg"
                    >
                      <p className="text-neon-green font-bold">{prize}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <p className="text-white/60">
                    Don't give up! The next draw might be your lucky day.
                  </p>
                </div>
              )}

              <Button 
                onClick={onClose}
                className={`w-full font-bold h-12 text-lg ${
                  isWin 
                    ? 'bg-neon-green text-black hover:bg-green-400' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isWin ? "CLAIM VICTORY" : "TRY AGAIN"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
