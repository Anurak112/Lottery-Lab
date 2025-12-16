import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopFrequent } from "@/lib/data";
import { motion } from "framer-motion";

export function TopNumbers() {
  const topNumbers = getTopFrequent(10);

  return (
    <Card className="glass-card border-none h-full">
      <CardHeader>
        <CardTitle className="text-neon-cyan">Top Frequent Numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topNumbers.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-black
                  ${index === 0 ? 'bg-neon-cyan shadow-[0_0_10px_var(--color-neon-cyan)]' : 
                    index === 1 ? 'bg-neon-green shadow-[0_0_10px_var(--color-neon-green)]' : 
                    index === 2 ? 'bg-neon-purple shadow-[0_0_10px_var(--color-neon-purple)]' : 'bg-white/50'}
                `}>
                  {index + 1}
                </div>
                <span className="text-2xl font-mono font-bold text-white">{item.number}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-white/60">Frequency</span>
                <span className="text-lg font-bold text-neon-cyan">{item.count}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
