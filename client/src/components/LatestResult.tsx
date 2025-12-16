import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checkLottery, LotteryResult } from "@/lib/api";
import { motion } from "framer-motion";
import { Search, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ResultPopup } from "./ResultPopup";
import { ShareButtons } from "./ShareButtons";
import { trpc } from "@/lib/trpc";

export function LatestResult() {
  const { data: result, isLoading } = trpc.lottery.getLatest.useQuery();
  const [checkNumber, setCheckNumber] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [checkResult, setCheckResult] = useState<{ isWin: boolean; prizes: string[] }>({ isWin: false, prizes: [] });

  // useEffect removed: data fetching handled by trpc hook

  const handleCheck = async () => {
    if (checkNumber.length !== 6) {
      toast.error("กรุณากรอกเลข 6 หลัก");
      return;
    }

    setIsChecking(true);
    const result = await checkLottery(checkNumber);
    setCheckResult(result);
    setIsChecking(false);
    setShowPopup(true);
  };

  if (isLoading || !result) return <div className="animate-pulse h-64 bg-white/5 rounded-xl"></div>;

  const firstPrize = result.prizes.find(p => p.id === "prizeFirst")?.number[0];
  const lastTwo = result.runningNumbers.find(p => p.id === "runningNumberBackTwo")?.number[0];
  const lastThree = result.runningNumbers.find(p => p.id === "runningNumberBackThree")?.number.join(", ");
  const frontThree = result.runningNumbers.find(p => p.id === "runningNumberFrontThree")?.number.join(", ");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Latest Result Card */}
      <Card className="glass-card border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy size={120} />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-neon-green flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              ผลสลากกินแบ่งรัฐบาลล่าสุด ({result.date})
            </CardTitle>
            <ShareButtons
              lotteryResult={{
                firstPrize: firstPrize,
                lastTwo: lastTwo,
                frontThree: result.runningNumbers.find(p => p.id === "runningNumberFrontThree")?.number,
                lastThree: result.runningNumbers.find(p => p.id === "runningNumberBackThree")?.number,
                date: result.date,
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <p className="text-white/60 text-sm">รางวัลที่ 1</p>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl sm:text-6xl font-bold text-neon-cyan font-mono tracking-wider"
            >
              {firstPrize}
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-white/60 text-xs">เลขท้าย 2 ตัว</p>
              <p className="text-2xl font-bold text-neon-purple font-mono">{lastTwo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/60 text-xs">เลขหน้า 3 ตัว</p>
              <p className="text-xl font-bold text-white font-mono">{frontThree}</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/60 text-xs">เลขท้าย 3 ตัว</p>
              <p className="text-xl font-bold text-white font-mono">{lastThree}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResultPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        isWin={checkResult.isWin}
        prizes={checkResult.prizes}
        number={checkNumber}
      />

      {/* Check Lottery Card */}
      <Card className="glass-card border-none flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-neon-cyan flex items-center gap-2">
            <Search className="w-5 h-5" />
            ตรวจสลากกินแบ่งรัฐบาล
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="กรอกเลขลอตเตอรี่ 6 หลัก"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="bg-white/5 border-white/10 text-lg text-center tracking-widest font-mono h-12"
            />
            <Button
              onClick={handleCheck}
              disabled={isChecking}
              className="bg-neon-cyan text-black hover:bg-cyan-400 font-bold h-12 px-6"
            >
              {isChecking ? "กำลังตรวจ..." : "ตรวจหวย"}
            </Button>
          </div>
          <p className="text-xs text-white/40 text-center">
            * ตรวจสอบผลสลากกินแบ่งรัฐบาลย้อนหลังได้ทุกงวด ข้อมูลอ้างอิงจากกองสลากฯ
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
