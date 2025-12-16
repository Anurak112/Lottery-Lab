import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextDrawDate, setNextDrawDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate next draw date (1st or 16th of the month)
    const calculateNextDraw = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Candidates for next draw
      const candidates = [
        new Date(currentYear, currentMonth, 1, 16, 0, 0), // 1st of this month
        new Date(currentYear, currentMonth, 16, 16, 0, 0), // 16th of this month
        new Date(currentYear, currentMonth + 1, 1, 16, 0, 0), // 1st of next month
      ];

      // Find the first candidate that is in the future
      const next = candidates.find(d => d.getTime() > now.getTime());
      return next || candidates[2];
    };

    const target = calculateNextDraw();
    setNextDrawDate(target);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Refresh target if passed
        const newTarget = calculateNextDraw();
        setNextDrawDate(newTarget);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!nextDrawDate) return null;

  return (
    <Card className="glass-card border-none overflow-hidden relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 pointer-events-none" />
      
      <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white/5 border border-white/10">
            <Clock className="w-6 h-6 text-neon-cyan animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Next Draw Countdown</h3>
            <p className="text-sm text-white/60">
              {nextDrawDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <TimeUnit value={timeLeft.days} label="DAYS" />
          <TimeUnit value={timeLeft.hours} label="HRS" />
          <TimeUnit value={timeLeft.minutes} label="MINS" />
          <TimeUnit value={timeLeft.seconds} label="SECS" />
        </div>
      </CardContent>
    </Card>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-black/40 backdrop-blur-md border border-white/10 rounded-lg w-16 h-16 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-2xl font-bold bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent absolute"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-medium text-white/40 tracking-wider">{label}</span>
    </div>
  );
}
