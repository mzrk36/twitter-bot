import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import BotControls from "@/components/BotControls";
import RecentActivity from "@/components/RecentActivity";
import ScheduledTweets from "@/components/ScheduledTweets";
import ContentModal from "@/components/ContentModal";
import Charts from "@/components/Charts";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: botSettings } = useQuery({
    queryKey: ["/api/bot/settings"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fab fa-twitter text-white text-2xl"></i>
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="fas fa-bars text-xl"></i>
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <p className="text-sm text-slate-400">Monitor your bot's performance and manage content</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">
                  {botSettings?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Button
                onClick={() => setContentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Tweet
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Tweets"
              value={stats?.totalTweets || 0}
              change="+12% from last month"
              icon="fab fa-twitter"
              color="blue"
              loading={statsLoading}
            />
            <StatsCard
              title="Engagement Rate"
              value={`${((stats?.engagementRate || 0) / 100).toFixed(1)}%`}
              change="+0.8% from last week"
              icon="fas fa-heart"
              color="green"
              loading={statsLoading}
            />
            <StatsCard
              title="Scheduled"
              value={stats?.scheduledTweets || 0}
              change="Next in 2 hours"
              icon="fas fa-clock"
              color="yellow"
              loading={statsLoading}
            />
            <StatsCard
              title="Followers Gained"
              value={stats?.followersGained || 0}
              change="+15% this month"
              icon="fas fa-users"
              color="purple"
              loading={statsLoading}
            />
          </div>

          {/* Charts and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Charts />
            <BotControls settings={botSettings} />
          </div>

          {/* Activity and Scheduled Tweets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />
            <ScheduledTweets />
          </div>
        </main>
      </div>

      {/* Content Modal */}
      <ContentModal 
        isOpen={contentModalOpen} 
        onClose={() => setContentModalOpen(false)} 
      />
    </div>
  );
}
