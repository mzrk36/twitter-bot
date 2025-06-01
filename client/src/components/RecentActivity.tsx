import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const activityIcons = {
  tweet_posted: { icon: "fas fa-check", color: "text-green-400 bg-green-400/20" },
  content_generated: { icon: "fas fa-brain", color: "text-blue-400 bg-blue-400/20" },
  tweet_scheduled: { icon: "fas fa-clock", color: "text-yellow-400 bg-yellow-400/20" },
  bot_paused: { icon: "fas fa-pause", color: "text-red-400 bg-red-400/20" },
  bot_resumed: { icon: "fas fa-play", color: "text-green-400 bg-green-400/20" },
  settings_updated: { icon: "fas fa-cog", color: "text-purple-400 bg-purple-400/20" },
  tweet_failed: { icon: "fas fa-exclamation-triangle", color: "text-red-400 bg-red-400/20" },
};

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-4 bg-slate-700 rounded-lg">
              <Skeleton className="w-10 h-10 rounded-lg bg-slate-600" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-600" />
                <Skeleton className="h-3 w-1/2 bg-slate-600" />
                <Skeleton className="h-3 w-1/4 bg-slate-600" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-clock text-4xl text-slate-600 mb-3"></i>
            <p className="text-slate-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => {
              const iconConfig = activityIcons[activity.action as keyof typeof activityIcons] || activityIcons.settings_updated;
              
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconConfig.color}`}>
                    <i className={iconConfig.icon}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{getActivityTitle(activity.action)}</p>
                    <p className="text-slate-400 text-sm mt-1 truncate">
                      {activity.description}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getActivityTitle(action: string): string {
  const titles = {
    tweet_posted: "Tweet Posted",
    content_generated: "Content Generated",
    tweet_scheduled: "Tweet Scheduled",
    bot_paused: "Bot Paused",
    bot_resumed: "Bot Resumed",
    settings_updated: "Settings Updated",
    tweet_failed: "Tweet Failed",
  };
  
  return titles[action as keyof typeof titles] || "Activity";
}
