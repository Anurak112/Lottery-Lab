import { useAuth } from "@/_core/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { NumberHeatmap } from "@/components/NumberHeatmap";
import { DigitFrequencyChart, PositionComparisonChart } from "@/components/StatsCharts";
import { TopNumbers } from "@/components/TopNumbers";
import { HistoricalStats } from "@/components/HistoricalStats";
import { LuckyNumberGenerator } from "@/components/LuckyNumberGenerator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import { LogIn, LogOut, Settings, User, Home, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Stats() {
  useAnalytics();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Navigation Bar */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="text-neon-cyan font-bold text-xl cursor-pointer hover:text-neon-cyan/80 transition">
              🎰 LOTTERY LAB
            </span>
          </Link>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-white/10">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-full text-white/60 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              หน้าหลัก
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="rounded-full bg-neon-cyan/20 text-neon-cyan">
            <BarChart3 className="w-4 h-4 mr-2" />
            สถิติ
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-neon-cyan/50">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || user.name}`} />
                    <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan">
                      {user.name?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 border-white/10" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium text-white">{user.name}</p>}
                    {user.email && <p className="text-xs text-white/60">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-white/70 hover:text-white focus:text-white cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild className="text-white/70 hover:text-white focus:text-white cursor-pointer">
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              asChild
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold"
            >
              <a href={getLoginUrl()}>
                <LogIn className="mr-2 h-4 w-4" />
                เข้าสู่ระบบ
              </a>
            </Button>
          )}
        </div>
      </nav>

      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple">
          📊 สถิติหวยย้อนหลัง
        </h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          วิเคราะห์ข้อมูลสถิติหวยย้อนหลัง 10 ปี เพื่อค้นหารูปแบบและแนวโน้ม
        </p>
      </motion.header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        
        {/* Top Numbers - Left Column on Desktop */}
        <div className="lg:col-span-4 lg:row-span-2 space-y-6">
          <TopNumbers />
          <LuckyNumberGenerator />
        </div>

        {/* Charts - Right Column Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DigitFrequencyChart />
            <PositionComparisonChart />
          </div>
        </div>

        {/* Heatmap - Full Width Bottom */}
        <div className="lg:col-span-8">
          <NumberHeatmap />
        </div>
      </div>

      {/* Historical Stats Section */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10">
        <HistoricalStats />
      </div>

      {/* Footer */}
      <footer className="text-center text-white/30 py-8 text-sm">
        <p>Data source: myhora.com | Analysis based on 10-year historical data</p>
      </footer>
    </div>
  );
}
