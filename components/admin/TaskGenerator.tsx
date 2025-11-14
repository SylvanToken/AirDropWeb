"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface TaskGeneratorProps {
  campaignId: string;
  onTasksGenerated?: () => void;
}

export function TaskGenerator({ campaignId, onTasksGenerated }: TaskGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskType, setTaskType] = useState("random");
  const [count, setCount] = useState(10);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/tasks/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: taskType,
          count: taskType === "random" ? count : undefined,
          campaignId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate tasks");
      }

      toast({
        title: "Tasks Generated Successfully",
        description: `${data.stats.total} tasks have been created and are pending approval`,
      });

      setStats(data.stats);
      onTasksGenerated?.();
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Random Task Generator
        </CardTitle>
        <CardDescription>
          Generate tasks automatically from Sylvan Token configuration. All generated tasks will be inactive and require admin approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger id="taskType">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random Mix</SelectItem>
                <SelectItem value="social">Social Media Tasks</SelectItem>
                <SelectItem value="profile">Profile Completion Tasks</SelectItem>
                <SelectItem value="environmental">Environmental Organization Tasks</SelectItem>
                <SelectItem value="listing">Token Listing Tasks</SelectItem>
                <SelectItem value="all">All Task Types</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {taskType === "random" && (
            <div className="space-y-2">
              <Label htmlFor="count">Number of Tasks</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h4 className="font-medium text-sm">Task Type Information:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {taskType === "random" && (
              <li>• Generates a random mix of tasks from all categories</li>
            )}
            {taskType === "social" && (
              <>
                <li>• Twitter: Follow, Like, Retweet</li>
                <li>• Telegram: Join channel</li>
                <li>• GitHub: Star repository</li>
              </>
            )}
            {taskType === "profile" && (
              <>
                <li>• Complete profile information</li>
                <li>• Verify wallet address</li>
                <li>• Verify social media accounts</li>
              </>
            )}
            {taskType === "environmental" && (
              <>
                <li>• Visit environmental organization websites</li>
                <li>• Follow environmental organizations on Twitter</li>
                <li>• Note: No retweet tasks for these organizations</li>
              </>
            )}
            {taskType === "listing" && (
              <>
                <li>• Visit CoinScope listing</li>
                <li>• Visit CoinBoom listing</li>
              </>
            )}
            {taskType === "all" && (
              <li>• Generates all available task types</li>
            )}
          </ul>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Tasks...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Tasks
            </>
          )}
        </Button>

        {stats && (
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <h4 className="font-medium">Generation Complete</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Total Tasks:</span>
                <span className="ml-2 font-medium">{stats.total}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium capitalize">{stats.type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium text-orange-600">Inactive (Pending Approval)</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>ℹ️ All generated tasks are created in English</p>
          <p>ℹ️ Translations will be automatically added for all supported languages</p>
          <p>ℹ️ Tasks are inactive by default and require admin approval to become visible to users</p>
        </div>
      </CardContent>
    </Card>
  );
}
