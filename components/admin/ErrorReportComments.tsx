"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Lock, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ErrorReportComment {
  id: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ErrorReportCommentsProps {
  reportId: string;
  onUpdate?: () => void;
}

export function ErrorReportComments({ reportId, onUpdate }: ErrorReportCommentsProps) {
  const [comments, setComments] = useState<ErrorReportComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/error-reports/${reportId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/error-reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          comment: newComment.trim(),
          isInternal 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data]);
        setNewComment("");
        setIsInternal(false);
        toast({
          title: "Comment added",
          description: "Your comment has been added successfully",
        });
        onUpdate?.();
      }
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: "An error occurred while adding the comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addComment();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Comments</span>
        <Badge variant="secondary" className="ml-auto">
          {comments.length}
        </Badge>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to comment on this error report</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg border ${
                comment.isInternal
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                  : "bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Admin</span>
                  {comment.isInternal && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Internal
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="space-y-3 border-t pt-4">
        <Textarea
          placeholder="Add a comment... (Ctrl+Enter to submit)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          rows={3}
          className="resize-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="internal-comment"
              checked={isInternal}
              onCheckedChange={setIsInternal}
              disabled={loading}
            />
            <Label htmlFor="internal-comment" className="text-sm cursor-pointer">
              <div className="flex items-center gap-1">
                {isInternal ? (
                  <>
                    <Lock className="h-3 w-3" />
                    Internal note
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3" />
                    Public comment
                  </>
                )}
              </div>
            </Label>
          </div>

          <Button
            onClick={addComment}
            disabled={loading || !newComment.trim()}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Comment
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Internal notes are only visible to admins. Public comments may be shared with the user.
        </p>
      </div>
    </div>
  );
}
