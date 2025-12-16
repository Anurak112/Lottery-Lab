import { useAuth } from "@/_core/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LatestResult } from "@/components/LatestResult";
import { CountdownTimer } from "@/components/CountdownTimer";
import { LiveStream } from "@/components/LiveStream";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { LogIn, LogOut, Settings, User, Home as HomeIcon, BarChart3, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

// Quick Stats Card Component
function QuickStatCard({ icon: Icon, label, value, color }: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <Card className="glass-card border-none overflow-hidden">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-white/50">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  useAnalytics();
  const { user, isAuthenticated, logout } = useAuth();

  // Set dynamic page title for SEO
  useEffect(() => {
    document.title = "ตรวจหวย ผลสลากกินแบ่งรัฐบาล | Lottery Lab Thailand";
  }, []);

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation Bar */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-neon-cyan font-bold text-xl">🎰 LOTTERY LAB</span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-white/10">
          <Button variant="ghost" size="sm" className="rounded-full bg-neon-cyan/20 text-neon-cyan">
           <HomeIcon className="w-4 h-4 mr-2" />
            หน้าหลัก
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full text-white/60 hover:text-white" asChild>
            <Link href="/stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              สถิติ
            </Link>
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

      {/* Compact Header with Countdown */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple">
              ตรวจหวย ผลสลากกินแบ่งรัฐบาล
            </h1>
            <p className="text-white/50 text-sm">
              ดูถ่ายทอดสด • แชทสนุก • วิเคราะห์สถิติหวยย้อนหลัง 10 ปี
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <CountdownTimer />
          </motion.div>
        </div>
      </div>

      {/* Latest Result Section with H2 */}
      <section className="max-w-7xl mx-auto">
        <h2 className="sr-only">ผลรางวัลสลากกินแบ่งรัฐบาลล่าสุด</h2>
        <LatestResult />
      </section>

      {/* Quick Stats Row with H2 */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-white/80 mb-3">ผลรางวัลงวดล่าสุด</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStatCard 
            icon={Trophy} 
            label="รางวัลที่ 1 งวดล่าสุด" 
            value="461252" 
            color="bg-gradient-to-br from-yellow-500 to-orange-500"
          />
          <QuickStatCard 
            icon={TrendingUp} 
            label="เลขท้าย 2 ตัว" 
            value="22" 
            color="bg-gradient-to-br from-neon-cyan to-blue-500"
          />
          <QuickStatCard 
            icon={Sparkles} 
            label="เลขหน้า 3 ตัว" 
            value="655, 389" 
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <QuickStatCard 
            icon={Sparkles} 
            label="เลขท้าย 3 ตัว" 
            value="137, 995" 
            color="bg-gradient-to-br from-green-500 to-emerald-500"
          />
        </div>
      </section>

      {/* Main Live Stream Section with H2 */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-white/80 mb-3">ถ่ายทอดสดการออกรางวัล</h2>
        <LiveStream />
      </section>

      {/* CTA to Stats Page */}
      <section className="max-w-7xl mx-auto">
        <Card className="glass-card border-none overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-white mb-1">
                📊 ต้องการดูสถิติเชิงลึก?
              </h2>
              <p className="text-white/50 text-sm">
                วิเคราะห์ข้อมูลหวยย้อนหลัง 10 ปี, Heatmap, กราฟแนวโน้ม และอื่นๆ
              </p>
            </div>
            <Button className="bg-gradient-to-r from-neon-purple to-neon-cyan hover:opacity-90 text-white font-semibold px-6" asChild>
              <Link href="/stats">
                <BarChart3 className="w-4 h-4 mr-2" />
                ดูสถิติทั้งหมด
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="text-center text-white/30 py-4 text-sm max-w-7xl mx-auto">
        <p>ข้อมูลอ้างอิงจาก myhora.com | วิเคราะห์สถิติหวยย้อนหลัง 10 ปี</p>
      </footer>
    </div>
  );
}
