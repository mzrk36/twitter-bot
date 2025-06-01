import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BotControlsProps {
  settings?: any;
}

export default function BotControls({ settings }: BotControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState(settings);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      await apiRequest("PUT", "/api/bot/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
      toast({
        title: "Settings Updated",
        description: "Bot settings have been saved successfully.",
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
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pauseBotMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/bot/pause");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
      toast({
        title: "Bot Paused",
        description: "The bot has been paused successfully.",
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
        description: "Failed to pause bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resumeBotMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/bot/resume");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
      toast({
        title: "Bot Resumed",
        description: "The bot is now active and running.",
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
        description: "Failed to resume bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/content/generate", { count: 3 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tweets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Content Generated",
        description: "3 new tweets have been generated and saved as drafts.",
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
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Bot Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bot Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Auto-posting</h4>
              <p className="text-sm text-slate-400">Automatically post scheduled content</p>
            </div>
            <Switch
              checked={localSettings?.autoPosting || false}
              onCheckedChange={(checked) => handleSettingChange('autoPosting', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <h4 className="font-medium text-white">AI Content Generation</h4>
              <p className="text-sm text-slate-400">Use OpenAI to generate motivational content</p>
            </div>
            <Switch
              checked={localSettings?.aiGeneration || false}
              onCheckedChange={(checked) => handleSettingChange('aiGeneration', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => generateContentMutation.mutate()}
            disabled={generateContentMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {generateContentMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-magic mr-2"></i>
            )}
            Generate New Content
          </Button>

          {settings?.isActive ? (
            <Button
              onClick={() => pauseBotMutation.mutate()}
              disabled={pauseBotMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {pauseBotMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-pause mr-2"></i>
              )}
              Pause Bot
            </Button>
          ) : (
            <Button
              onClick={() => resumeBotMutation.mutate()}
              disabled={resumeBotMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {resumeBotMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-play mr-2"></i>
              )}
              Resume Bot
            </Button>
          )}
        </div>

        {/* Status Info */}
        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-medium ${settings?.isActive ? 'text-green-400' : 'text-red-400'}`}>
                {settings?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Limit:</span>
              <span className="text-white">{settings?.dailyTweetLimit || 8} tweets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Posting Interval:</span>
              <span className="text-white">{settings?.postingInterval || 3} hours</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
