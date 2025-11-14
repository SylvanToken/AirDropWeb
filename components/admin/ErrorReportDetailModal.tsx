"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Loader2, ExternalLink, User, Calendar, Globe, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorReportTags } from "./ErrorReportTags";
import { ErrorReportComments } from "./ErrorReportComments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ErrorReport {
  id: string;
  errorType: string;
  errorTitle: string;
  errorMessage: string;
  stackTrace?: string | null;
  status: string;
  priority: string;
  pageUrl: string;
  userAgent?: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

interface ErrorReportDetailModalProps {
  report: ErrorReport;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ErrorReportDetailModal({
  report,
  isOpen,
  onClose,
  onUpdate,
}: ErrorReportDetailModalProps) {
  const [status, setStatus] = useState(report.status);
  const [priority, setPriority] = useState(report.priority);
  const [resolution, setResolution] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/error-reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          priority,
          resolution: resolution || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update error report");
      }

      toast({
        title: "Updated Successfully",
        description: "Error report has been updated",
      });

      onUpdate();
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update error report",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/error-reports/${report.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete error report");
      }

      toast({
        title: "Deleted Successfully",
        description: "Error report has been permanently deleted",
      });

      setShowDeleteDialog(false);
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete error report",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Error Report Details
              <Badge className={getPriorityColor(report.priority)}>
                {report.priority}
              </Badge>
            </DialogTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          {report.user && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span className="font-semibold">Reported By</span>
              </div>
              <div className="ml-6">
                <div className="font-medium">{report.user.username}</div>
                <div className="text-sm text-muted-foreground">{report.user.email}</div>
              </div>
            </div>
          )}

          {/* Error Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Error Type</label>
              <div className="mt-1 text-sm">{report.errorType.replace("_", " ")}</div>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <div className="mt-1 font-medium">{report.errorTitle}</div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <div className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                {report.errorMessage}
              </div>
            </div>

            {report.stackTrace && (
              <div>
                <label className="text-sm font-medium">Stack Trace</label>
                <div className="mt-1 text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
                  {report.stackTrace}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Page URL
              </label>
              <a
                href={report.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {report.pageUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {report.userAgent && (
              <div>
                <label className="text-sm font-medium">User Agent</label>
                <div className="mt-1 text-xs text-muted-foreground">{report.userAgent}</div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created At
              </label>
              <div className="mt-1 text-sm">
                {format(new Date(report.createdAt), "PPpp")}
              </div>
            </div>
          </div>

          {/* Tabs for Tags, Comments, and Update */}
          <div className="border-t pt-6">
            <Tabs defaultValue="update" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="update">Update</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="update" className="space-y-4 mt-4">
                <h3 className="font-semibold">Update Status</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Resolution Notes</label>
                  <Textarea
                    placeholder="Add resolution notes..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Report"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="tags" className="mt-4">
                <ErrorReportTags reportId={report.id} onUpdate={onUpdate} />
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <ErrorReportComments reportId={report.id} onUpdate={onUpdate} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the error report
              and all associated data (tags, comments, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
