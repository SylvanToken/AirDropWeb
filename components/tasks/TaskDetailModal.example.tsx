/**
 * Example Usage of TaskDetailModal Component
 * 
 * This file demonstrates how to integrate the TaskDetailModal component
 * into your application. Copy this pattern when implementing the modal
 * in the User Tasks Page Layout (Task 8).
 */

"use client";

import { useState } from "react";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskWithCompletion } from "@/types";

export function TaskListExample() {
  const [selectedTask, setSelectedTask] = useState<TaskWithCompletion | null>(null);
  
  // Example tasks data
  const tasks: TaskWithCompletion[] = [
    {
      id: '1',
      campaignId: 'campaign-1',
      title: 'Follow us on Twitter',
      description: 'Follow our official Twitter account to stay updated',
      points: 50,
      taskType: 'TWITTER_FOLLOW',
      taskUrl: 'https://twitter.com/example',
      isActive: true,
      isCompleted: false,
      completedToday: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // ... more tasks
  ];

  return (
    <div className="space-y-4">
      {/* Task List */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-4 border rounded cursor-pointer hover:bg-accent"
            onClick={() => setSelectedTask(task)}
          >
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

/**
 * Integration Notes:
 * 
 * 1. State Management:
 *    - Use useState to track the selected task
 *    - Set to null when modal is closed
 * 
 * 2. Opening the Modal:
 *    - Set selectedTask to the task you want to display
 *    - The modal will automatically open when task is not null
 * 
 * 3. Closing the Modal:
 *    - The modal can be closed by:
 *      a) Clicking the X button (top-right)
 *      b) Clicking the "Close" button in the footer
 *      c) Pressing the Escape key
 *      d) Clicking outside the modal
 *    - All these actions trigger the onClose callback
 * 
 * 4. Accessibility:
 *    - The modal is fully keyboard accessible
 *    - Screen readers will announce the modal content
 *    - Focus is trapped within the modal when open
 *    - Body scroll is prevented when modal is open
 * 
 * 5. Features:
 *    - Displays task status badge (active/completed/missed)
 *    - Shows countdown timer for active time-limited tasks
 *    - Displays task details (title, description, points, type)
 *    - Shows completion information if available
 *    - Displays expiration information for missed tasks
 */
