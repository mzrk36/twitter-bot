import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow, format } from "date-fns";

export default function ScheduledTweets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scheduledTweets, isLoading } = useQuery({
    queryKey: ["/api/tweets/scheduled"],
    retry: false,
  });

  const deleteTweetMutation = useMutation({
    mutationFn: async (tweetId: number) => {
      await apiRequest("DELETE", `/api/tweets/${tweetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tweets/scheduled"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Tweet Deleted",
        description: "The scheduled tweet has been deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete tweet. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Scheduled Tweets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-slate-600 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-5 w-24 bg-slate-600" />
                <Skeleton className="h-4 w-4 bg-slate-600" />
              </div>
              <Skeleton className="h-12 w-full bg-slate-600 mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-32 bg-slate-600" />
                <div className="flex space-x-2">
                  <Skeleton className="h-4 w-4 bg-slate-600" />
                  <Skeleton className="h-4 w-4 bg-slate-600" />
                </div>
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
          <CardTitle className="text-white">Upcoming Tweets</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
            Manage All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!scheduledTweets || scheduledTweets.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-calendar-alt text-4xl text-slate-600 mb-3"></i>
            <p className="text-slate-400">No scheduled tweets</p>
            <p className="text-slate-500 text-sm mt-1">Create and schedule your first tweet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledTweets.map((tweet: any) => (
              <div key={tweet.id} className="p-4 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getScheduleStatusColor(tweet.scheduledFor)}`}>
                    {getScheduleLabel(tweet.scheduledFor)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400 h-6 w-6 p-0"
                    onClick={() => deleteTweetMutation.mutate(tweet.id)}
                    disabled={deleteTweetMutation.isPending}
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </Button>
                </div>
                
                <p className="text-white text-sm mb-2 line-clamp-3">
                  {tweet.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{format(new Date(tweet.scheduledFor), 'MMM d, h:mm a')}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-blue-400 h-6 w-6 p-0"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-green-400 h-6 w-6 p-0"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </Button>
                  </div>
                </div>
                
                {tweet.isAiGenerated && (
                  <div className="mt-2 flex items-center text-xs text-purple-400">
                    <i className="fas fa-brain mr-1"></i>
                    AI Generated
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getScheduleLabel(scheduledFor: string): string {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const diffInHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return "Very Soon";
  } else if (diffInHours < 24) {
    return `In ${Math.round(diffInHours)}h`;
  } else if (diffInHours < 48) {
    return "Tomorrow";
  } else {
    return `In ${Math.round(diffInHours / 24)} days`;
  }
}

function getScheduleStatusColor(scheduledFor: string): string {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const diffInHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return "text-red-400 bg-red-400/20";
  } else if (diffInHours < 6) {
    return "text-yellow-400 bg-yellow-400/20";
  } else {
    return "text-blue-400 bg-blue-400/20";
  }
}
