import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Eye, MessageSquare, TrendingUp, UserPlus, Activity, Shield, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend 
}: { 
  title: string; 
  value: string | number; 
  description?: string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
        <Icon className="h-4 w-4 text-neon-cyan" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-white/50 mt-1">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: recentUsers, isLoading: usersLoading } = trpc.admin.getRecentUsers.useQuery({ limit: 5 });
  const { data: visitorStats, isLoading: visitorLoading } = trpc.admin.getVisitorStats.useQuery({ days: 7 });
  const { data: apiUsageStats } = trpc.admin.getApiUsageStats.useQuery();
  const { data: rateLimitConfigs } = trpc.admin.getRateLimitConfigs.useQuery();

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-white">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-white/60">You need admin privileges to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate API health metrics
  const totalApiRequests = apiUsageStats?.reduce((sum, s) => sum + s.totalRequests, 0) || 0;
  const totalErrors = apiUsageStats?.reduce((sum, s) => sum + s.errorCount, 0) || 0;
  const totalRateLimitHits = apiUsageStats?.reduce((sum, s) => sum + s.rateLimitHits, 0) || 0;
  const successRate = totalApiRequests > 0 ? ((totalApiRequests - totalErrors) / totalApiRequests * 100).toFixed(1) : '100';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/60 mt-1">Monitor your website analytics and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            description="Registered accounts"
          />
          <StatCard
            title="Today's Visitors"
            value={stats?.todayVisitors || 0}
            icon={Eye}
            description="Unique sessions"
          />
          <StatCard
            title="Page Views Today"
            value={stats?.todayPageViews || 0}
            icon={Activity}
            description="Total page loads"
          />
          <StatCard
            title="Chat Messages"
            value={stats?.todayChats || 0}
            icon={MessageSquare}
            description="Messages today"
          />
        </div>

        {/* API Health & Rate Limit Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="API Requests"
            value={totalApiRequests}
            icon={Zap}
            description="Total API calls"
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={CheckCircle}
            description="API success rate"
          />
          <StatCard
            title="Rate Limit Hits"
            value={totalRateLimitHits}
            icon={Shield}
            description="Blocked requests"
          />
          <StatCard
            title="API Errors"
            value={totalErrors}
            icon={AlertTriangle}
            description="Failed requests"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Visitor Trend Chart */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Visitor Trend</CardTitle>
              <CardDescription className="text-white/50">Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {visitorStats && visitorStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitorStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        tick={{ fill: '#999', fontSize: 12 }}
                      />
                      <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="#00d4ff" 
                        strokeWidth={2}
                        dot={{ fill: '#00d4ff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    No visitor data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Page Views Chart */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Page Views</CardTitle>
              <CardDescription className="text-white/50">Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {visitorStats && visitorStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visitorStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        tick={{ fill: '#999', fontSize: 12 }}
                      />
                      <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="pageViews" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    No page view data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rate Limit Configuration */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-cyan" />
              Rate Limit Configuration
            </CardTitle>
            <CardDescription className="text-white/50">
              API rate limiting settings per endpoint type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rateLimitConfigs && Object.entries(rateLimitConfigs).map(([type, config]) => (
                <div key={type} className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium capitalize mb-2">{type}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Max Requests:</span>
                      <span className="text-neon-cyan">{config.maxRequests}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Window:</span>
                      <span className="text-neon-cyan">{config.windowMs / 1000}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Usage Stats */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              API Usage Statistics
            </CardTitle>
            <CardDescription className="text-white/50">
              Real-time API endpoint monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Endpoint</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Success</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Errors</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Rate Limited</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Avg Response</th>
                  </tr>
                </thead>
                <tbody>
                  {apiUsageStats && apiUsageStats.length > 0 ? (
                    apiUsageStats.map((stat) => (
                      <tr key={stat.endpoint} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white font-mono text-sm">{stat.endpoint}</td>
                        <td className="py-3 px-4 text-white">{stat.totalRequests}</td>
                        <td className="py-3 px-4 text-green-400">{stat.successCount}</td>
                        <td className="py-3 px-4 text-red-400">{stat.errorCount}</td>
                        <td className="py-3 px-4 text-yellow-400">{stat.rateLimitHits}</td>
                        <td className="py-3 px-4 text-white/70">{stat.avgResponseTime.toFixed(0)}ms</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-white/50">
                        No API usage data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users Table */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-neon-cyan" />
              Recent Users
            </CardTitle>
            <CardDescription className="text-white/50">
              Latest registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Joined</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers && recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{user.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-white/70">{user.email || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' 
                              ? 'bg-neon-purple/20 text-neon-purple' 
                              : 'bg-neon-cyan/20 text-neon-cyan'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/50 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-white/50 text-sm">
                          {new Date(user.lastSignedIn).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/50">
                        No users registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
