# Design Document

## Overview

This document describes the technical design for implementing a time-limited task system with countdown timers, automatic expiration, and organized task display. The system will enhance user engagement through urgency and provide clear visibility of active, completed, and missed tasks.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Panel                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Task Creation Form                                   │  │
│  │  - Time Limited Checkbox                             │  │
│  │  - Duration Input (hours)                            │  │
│  │  - Expiration Calculation                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Task Model                                           │  │
│  │  + duration: Int? (hours)                            │  │
│  │  + expiresAt: DateTime?                              │  │
│  │                                                       │  │
│  │  Completion Model                                     │  │
│  │  + missedAt: DateTime?                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Row 1: Active Tasks (Max 5)                         │  │
│  │  [Task] [Task] [Task] [Task] [Task]                 │  │
│  │   ⏱️     ⏱️     ⏱️                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Row 2: Completed Tasks (5 Recent)                   │  │
│  │  [Task] [Task] [Task] [Task] [Task]                 │  │
│  │  ▼ More completed tasks (list)                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Row 3: Missed Tasks (5 Recent)                      │  │
│  │  [Task] [Task] [Task] [Task] [Task]                 │  │
│  │  ▼ More missed tasks (list)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema Changes

#### Task Model Extension
```prisma
model Task {
  id          String   @id @default(cuid())
  // ... existing fields
  duration    Int?     // Duration in hours (null = no time limit)
  expiresAt   DateTime? // Calculated expiration timestamp
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Completion Model Extension
```prisma
model Completion {
  id          String   @id @default(cuid())
  // ... existing fields
  missedAt    DateTime? // Timestamp when task was missed (expired)
  completedAt DateTime?
}
```

### 2. Admin Task Creation Component

**File**: `components/admin/TaskForm.tsx`

```typescript
interface TaskFormData {
  title: string;
  description: string;
  points: number;
  taskType: TaskType;
  taskUrl?: string;
  isTimeLimited: boolean;  // NEW
  duration?: number;        // NEW (in hours)
}

// Calculate expiration
const calculateExpiration = (duration: number): Date => {
  const now = new Date();
  return new Date(now.getTime() + duration * 60 * 60 * 1000);
};
```

**UI Elements**:
- Checkbox: "Enable Time Limit"
- Number Input: "Duration (hours)" (1-24 range)
- Helper Text: "Task will expire X hours after creation"

### 3. Countdown Timer Component

**File**: `components/tasks/CountdownTimer.tsx`

```typescript
interface CountdownTimerProps {
  expiresAt: Date;
  onExpire: () => void;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(expiresAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(expiresAt);
      setTimeRemaining(remaining);
      
      if (remaining.isExpired) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (timeRemaining.isExpired) {
    return <div className="text-red-500">⏰ Expired</div>;
  }

  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      <Clock className="w-4 h-4" />
      <span>
        {String(timeRemaining.hours).padStart(2, '0')}:
        {String(timeRemaining.minutes).padStart(2, '0')}:
        {String(timeRemaining.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
```

### 4. Task Organization Logic

**File**: `lib/tasks/organizer.ts`

```typescript
interface OrganizedTasks {
  activeTasks: TaskWithCompletion[];      // Max 5
  completedTasks: TaskWithCompletion[];   // 5 recent
  completedList: TaskWithCompletion[];    // Remaining
  missedTasks: TaskWithCompletion[];      // 5 recent
  missedList: TaskWithCompletion[];       // Remaining
}

export function organizeTasks(
  tasks: TaskWithCompletion[],
  completions: Completion[]
): OrganizedTasks {
  const now = new Date();
  
  // Categorize tasks
  const active = tasks.filter(task => 
    !task.isCompleted && 
    (!task.expiresAt || task.expiresAt > now)
  ).slice(0, 5); // Max 5
  
  const completed = completions
    .filter(c => c.completedAt && !c.missedAt)
    .sort((a, b) => b.completedAt - a.completedAt);
  
  const missed = completions
    .filter(c => c.missedAt)
    .sort((a, b) => b.missedAt - a.missedAt);
  
  return {
    activeTasks: active,
    completedTasks: completed.slice(0, 5),
    completedList: completed.slice(5),
    missedTasks: missed.slice(0, 5),
    missedList: missed.slice(5),
  };
}
```

### 5. Task Card Component Updates

**File**: `components/tasks/TaskCard.tsx`

```typescript
export function TaskCard({ task, onComplete }: TaskCardProps) {
  const isExpired = task.expiresAt && new Date(task.expiresAt) < new Date();
  
  return (
    <Card className={cn(
      "relative",
      isExpired && "opacity-50 cursor-not-allowed"
    )}>
      {/* Countdown Timer */}
      {task.expiresAt && !isExpired && (
        <div className="absolute top-2 right-2">
          <CountdownTimer 
            expiresAt={new Date(task.expiresAt)}
            onExpire={() => handleTaskExpired(task.id)}
          />
        </div>
      )}
      
      {/* Expired Badge */}
      {isExpired && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
          ⏰ Expired
        </div>
      )}
      
      {/* Task Content */}
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{task.description}</p>
        <Button 
          onClick={() => onComplete(task.id)}
          disabled={isExpired}
        >
          {isExpired ? 'Missed' : 'Complete Task'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 6. Task Detail Popup Component

**File**: `components/tasks/TaskDetailModal.tsx`

```typescript
interface TaskDetailModalProps {
  task: TaskWithCompletion;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(task)}>
              {getStatusLabel(task)}
            </Badge>
            {task.expiresAt && (
              <CountdownTimer expiresAt={new Date(task.expiresAt)} />
            )}
          </div>
          
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Points</span>
              <p className="font-semibold">{task.points}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Type</span>
              <p className="font-semibold">{task.taskType}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 7. User Tasks Page Layout

**File**: `app/(user)/tasks/page.tsx`

```typescript
export default function TasksPage() {
  const organized = organizeTasks(tasks, completions);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  return (
    <div className="space-y-8">
      {/* Row 1: Active Tasks (Max 5) */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Active Tasks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {organized.activeTasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} />
          ))}
        </div>
      </section>
      
      {/* Row 2: Completed Tasks */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Completed Tasks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {organized.completedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        
        {/* Collapsible List */}
        {organized.completedList.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger>
              Show {organized.completedList.length} more
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 mt-4">
                {organized.completedList.map(task => (
                  <div 
                    key={task.id}
                    className="p-4 border rounded cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </section>
      
      {/* Row 3: Missed Tasks */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Missed Tasks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {organized.missedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        
        {/* Collapsible List */}
        {organized.missedList.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger>
              Show {organized.missedList.length} more
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 mt-4">
                {organized.missedList.map(task => (
                  <div 
                    key={task.id}
                    className="p-4 border rounded cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </section>
      
      {/* Task Detail Modal */}
      <TaskDetailModal 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
```

## Data Models

### Task Model
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  taskType: TaskType;
  taskUrl?: string;
  isActive: boolean;
  duration?: number;      // NEW: Duration in hours
  expiresAt?: Date;       // NEW: Expiration timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

### TaskWithCompletion
```typescript
interface TaskWithCompletion extends Task {
  isCompleted: boolean;
  completedAt?: Date;
  missedAt?: Date;        // NEW: When task was missed
  timeRemaining?: number; // Calculated client-side
}
```

## API Endpoints

### 1. Create Time-Limited Task
```typescript
POST /api/admin/tasks
{
  title: string;
  description: string;
  points: number;
  taskType: TaskType;
  isTimeLimited: boolean;
  duration?: number; // hours
}

Response: {
  task: Task;
  expiresAt?: Date;
}
```

### 2. Check Task Expiration
```typescript
POST /api/tasks/check-expiration
{
  taskId: string;
}

Response: {
  isExpired: boolean;
  expiresAt?: Date;
}
```

### 3. Get Organized Tasks
```typescript
GET /api/tasks/organized

Response: {
  activeTasks: Task[];
  completedTasks: Task[];
  completedList: Task[];
  missedTasks: Task[];
  missedList: Task[];
}
```

## Error Handling

### Task Expiration Errors
- **Expired Task Completion Attempt**: Return 400 with message "Task has expired"
- **Invalid Duration**: Return 400 with message "Duration must be between 1 and 24 hours"
- **Missing Expiration Data**: Log warning and treat as non-time-limited

### Timer Synchronization
- Use server time for expiration checks
- Client timer is for display only
- Validate expiration on server before allowing completion

## Testing Strategy

### Unit Tests
- Test expiration calculation logic
- Test task organization algorithm
- Test countdown timer component
- Test time remaining calculations

### Integration Tests
- Test task creation with time limits
- Test automatic expiration marking
- Test task completion prevention after expiration
- Test task organization API endpoint

### E2E Tests
- Create time-limited task as admin
- View countdown timer as user
- Wait for expiration and verify status change
- Attempt to complete expired task (should fail)
- Verify missed task appears in correct section

## Performance Considerations

### Timer Updates
- Use `requestAnimationFrame` for smooth updates
- Batch timer updates for multiple tasks
- Pause timers when tab is not visible

### Database Queries
- Index `expiresAt` field for efficient expiration checks
- Use database triggers for automatic expiration marking
- Cache organized tasks for 30 seconds

### Real-Time Updates
- Consider WebSocket for instant expiration notifications
- Fallback to polling every 60 seconds
- Update UI optimistically for better UX

## Security Considerations

### Time Manipulation Prevention
- Always validate expiration on server
- Use server timestamps for all calculations
- Log suspicious completion attempts
- Rate limit task completion API

### Data Validation
- Validate duration range (1-24 hours)
- Sanitize all user inputs
- Verify task ownership before completion
- Check expiration before awarding points

