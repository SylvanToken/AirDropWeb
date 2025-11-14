"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ErrorReportTag {
  id: string;
  tag: string;
  createdAt: Date;
}

interface ErrorReportTagsProps {
  reportId: string;
  onUpdate?: () => void;
}

export function ErrorReportTags({ reportId, onUpdate }: ErrorReportTagsProps) {
  const [tags, setTags] = useState<ErrorReportTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, [reportId]);

  const fetchTags = async () => {
    try {
      const response = await fetch(`/api/error-reports/${reportId}/tags`);
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/error-reports/${reportId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: newTag.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setTags([...tags, data]);
        setNewTag("");
        toast({
          title: "Tag added",
          description: `Tag "${newTag}" has been added successfully`,
        });
        onUpdate?.();
      } else if (response.status === 409) {
        toast({
          title: "Tag already exists",
          description: "This tag is already added to this report",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to add tag",
        description: "An error occurred while adding the tag",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeTag = async (tagId: string, tagName: string) => {
    try {
      const response = await fetch(
        `/api/error-reports/${reportId}/tags?tagId=${tagId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setTags(tags.filter((t) => t.id !== tagId));
        toast({
          title: "Tag removed",
          description: `Tag "${tagName}" has been removed`,
        });
        onUpdate?.();
      }
    } catch (error) {
      toast({
        title: "Failed to remove tag",
        description: "An error occurred while removing the tag",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tags</span>
      </div>

      {/* Existing Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="pl-3 pr-1 py-1 text-sm"
            >
              {tag.tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                onClick={() => removeTag(tag.id, tag.tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add New Tag */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a tag (e.g., bug, ui, performance)"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={addTag}
          disabled={loading || !newTag.trim()}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Suggested Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Suggestions:</span>
        {["bug", "ui", "api", "performance", "security", "mobile"].map((suggestion) => (
          <Badge
            key={suggestion}
            variant="outline"
            className="cursor-pointer text-xs hover:bg-accent"
            onClick={() => setNewTag(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}
