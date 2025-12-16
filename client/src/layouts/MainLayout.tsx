import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { 
  LogIn, 
  LogOut, 
  Settings, 
  User, 
  Home, 
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  showNavTabs?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function MainLayout({ 
  children, 
  showNavTabs = true,
  maxWidth = '7xl' 
}: MainLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'หน้าหลัก', icon: Home },
    { href: '/stats', label: 'สถิติ', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-lg">
        <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", maxWidthClasses[maxWidth])}>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-neon-cyan font-bold text-xl">🎰 LOTTERY LAB</span>
            </Link>

            {/* Desktop Navigation */}
            {showNavTabs && (
              <nav className="hidden md:flex items-center gap-1 bg-black/40 rounded-full p-1 border border-white/10">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "rounded-full transition-all",
                        isActive(item.href) 
                          ? "bg-neon-cyan/20 text-neon-cyan" 
                          : "text-white/60 hover:text-white"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* User Menu */}
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
                      <span>โปรไฟล์</span>
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
                      <span>ออกจากระบบ</span>
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
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && showNavTabs && (
          <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-lg">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start",
                      isActive(item.href) 
                        ? "bg-neon-cyan/20 text-neon-cyan" 
                        : "text-white/60 hover:text-white"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={cn("mx-auto px-4 sm:px-6 lg:px-8 py-6", maxWidthClasses[maxWidth])}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background/50">
        <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 py-6", maxWidthClasses[maxWidth])}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/30 text-sm">
                © 2024 Lottery Lab Thailand. ข้อมูลอ้างอิงจาก myhora.com
              </p>
            </div>
            <div className="flex items-center gap-4 text-white/30 text-sm">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">
                ข้อกำหนดการใช้งาน
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
