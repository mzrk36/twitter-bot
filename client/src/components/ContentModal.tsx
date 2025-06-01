import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContentModal({ isOpen, onClose }: ContentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [schedule, setSchedule] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const createTweetMutation = useMutation({
    mutationFn: async (tweetData: any) => {
      await apiRequest("POST", "/api/tweets", tweetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tweets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tweets/scheduled"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Tweet Created",
        description: schedule === "now" ? "Tweet posted successfully!" : "Tweet scheduled successfully!",
      });
      handleClose();
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
        description: "Failed to create tweet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/content/generate", { count: 1 });
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setContent(data[0].content);
        toast({
          title: "Content Generated",
          description: "AI has generated new content for you!",
        });
      }
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
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setContent("");
    setSchedule("now");
    setScheduledDate("");
    setScheduledTime("");
    onClose();
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter tweet content.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > 280) {
      toast({
        title: "Error",
        description: "Tweet content must be 280 characters or less.",
        variant: "destructive",
      });
      return;
    }

    let tweetData: any = {
      content: content.trim(),
      status: schedule === "now" ? "draft" : "scheduled",
    };

    if (schedule === "now") {
      tweetData.postNow = true;
    } else if (schedule === "later" && scheduledDate && scheduledTime) {
      tweetData.scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    createTweetMutation.mutate(tweetData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Tweet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tweet Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening? Share some motivation..."
              className="h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${content.length > 260 ? 'text-red-400' : 'text-slate-400'}`}>
                {content.length}/280 characters
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateContentMutation.mutate()}
                disabled={generateContentMutation.isPending}
                className="border-slate-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                {generateContentMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-magic mr-2"></i>
                )}
                Generate with AI
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Schedule</label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="now">Post now</SelectItem>
                  <SelectItem value="later">Schedule for later</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {schedule === "later" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-600">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-400 hover:text-white"
              >
                <i className="fas fa-image mr-2"></i>
                Add Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-400 hover:text-white"
              >
                <i className="fas fa-hashtag mr-2"></i>
                Hashtags
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-600 text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createTweetMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createTweetMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-paper-plane mr-2"></i>
                )}
                {schedule === "now" ? "Post Tweet" : "Schedule Tweet"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
