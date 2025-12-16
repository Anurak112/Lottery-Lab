import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { frequencyStats } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

export function LuckyNumberGenerator() {
  const [luckyNumber, setLuckyNumber] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLuckyNumber = () => {
    setIsGenerating(true);
    setLuckyNumber(null);

    // Simulate calculation delay
    setTimeout(() => {
      // Weighted random algorithm based on historical frequency
      // Numbers that appear less frequently might be "due" (Gambler's Fallacy logic - popular in lottery)
      // OR Numbers that appear frequently are "hot"
      
      // Let's mix both strategies: 
      // 50% chance to pick from top 20 frequent numbers ("Hot")
      // 30% chance to pick from bottom 20 frequent numbers ("Due")
      // 20% chance for completely random ("Wildcard")
      
      const strategy = Math.random();
      let pool: string[] = [];
      
      const sortedStats = [...frequencyStats].sort((a, b) => b.count - a.count);
      const allNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
      const existingNumbers = new Set(frequencyStats.map(s => s.number));
      const neverAppeared = allNumbers.filter(n => !existingNumbers.has(n));
      
      if (strategy < 0.5) {
        // Hot numbers strategy
        pool = sortedStats.slice(0, 20).map(s => s.number);
      } else if (strategy < 0.8) {
        // Due numbers strategy (including never appeared)
        const bottomStats = sortedStats.slice(-20).map(s => s.number);
        pool = [...bottomStats, ...neverAppeared];
      } else {
        // Wildcard strategy
        pool = allNumbers;
      }
      
      const randomPick = pool[Math.floor(Math.random() * pool.length)];
      setLuckyNumber(randomPick);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card className="glass-card border-none overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
      
      <CardHeader>
        <CardTitle className="text-neon-purple flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Lucky Number Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Background glow rings */}
          <div className={`absolute inset-0 rounded-full border-4 border-neon-purple/30 ${isGenerating ? 'animate-ping' : ''}`} />
          <div className={`absolute inset-4 rounded-full border-4 border-neon-blue/30 ${isGenerating ? 'animate-pulse' : ''}`} />
          
          {/* Number Display */}
          <div className="relative z-10 w-32 h-32 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <AnimatePresence mode="wait">
              {luckyNumber ? (
                <motion.span
                  key="result"
                  initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  className="text-5xl font-bold bg-gradient-to-br from-neon-purple to-neon-blue bg-clip-text text-transparent"
                >
                  {luckyNumber}
                </motion.span>
              ) : isGenerating ? (
                <motion.span
                  key="loading"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-4xl font-bold text-white/20"
                >
                  ??
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-4xl font-bold text-white/20"
                >
                  ??
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center space-y-2 max-w-xs">
          <h3 className="text-white font-medium">
            {luckyNumber ? "Your Lucky Number is Here!" : "Ready to find your luck?"}
          </h3>
          <p className="text-xs text-white/50">
            Generated using a hybrid algorithm analyzing 10-year historical frequency patterns.
          </p>
        </div>

        <Button 
          onClick={generateLuckyNumber} 
          disabled={isGenerating}
          className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold h-12 shadow-lg shadow-purple-500/20"
        >
          {isGenerating ? (
            <>Calculating Probabilities...</>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Lucky Number
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
