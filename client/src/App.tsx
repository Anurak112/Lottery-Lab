import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SkeletonStatsGrid, SkeletonVideoPlayer } from "@/shared/components/Skeleton";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const Stats = lazy(() => import("@/pages/Stats"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <SkeletonStatsGrid />
        <SkeletonVideoPlayer />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/stats"} component={Stats} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

import { SEO } from "@/components/SEO";

// ... existing code ...

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      // switchable
      >
        <TooltipProvider>
          <SEO />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
