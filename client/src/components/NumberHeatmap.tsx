import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllNumbers } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

export function NumberHeatmap() {
  const allNumbers = getAllNumbers();
  const maxCount = Math.max(...allNumbers.map(n => n.count));
  const [hoveredNumber, setHoveredNumber] = useState<string | null>(null);

  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-white/5 text-white/30";
    const intensity = count / maxCount;
    if (intensity > 0.8) return "bg-neon-cyan text-black shadow-[0_0_15px_var(--color-neon-cyan)] font-bold z-10";
    if (intensity > 0.6) return "bg-neon-purple text-white shadow-[0_0_10px_var(--color-neon-purple)] font-bold";
    if (intensity > 0.4) return "bg-blue-500/80 text-white";
    if (intensity > 0.2) return "bg-blue-500/40 text-white/80";
    return "bg-blue-500/20 text-white/60";
  };

  return (
    <Card className="glass-card border-none overflow-hidden">
      <CardHeader>
        <CardTitle className="text-neon-green flex justify-between items-center">
          <span>Number Heatmap (00-99)</span>
          {hoveredNumber && (
            <span className="text-sm font-normal text-white/80">
              Number: <span className="text-neon-cyan font-bold text-lg">{hoveredNumber}</span>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-10 gap-2 sm:gap-3">
          {allNumbers.map((item) => (
            <motion.div
              key={item.number}
              whileHover={{ scale: 1.2, zIndex: 20 }}
              onMouseEnter={() => setHoveredNumber(item.number)}
              onMouseLeave={() => setHoveredNumber(null)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-md text-sm sm:text-base transition-colors duration-300 cursor-pointer relative group",
                getIntensityColor(item.count)
              )}
            >
              {item.number}
              {item.count > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-white/5"></div> 0
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/20"></div> Low
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/80"></div> Med
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neon-purple shadow-[0_0_5px_var(--color-neon-purple)]"></div> High
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neon-cyan shadow-[0_0_5px_var(--color-neon-cyan)]"></div> Max
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
