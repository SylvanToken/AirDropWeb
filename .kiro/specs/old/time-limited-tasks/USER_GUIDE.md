# Time-Limited Tasks User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [For Administrators](#for-administrators)
   - [Creating Time-Limited Tasks](#creating-time-limited-tasks)
   - [Editing Task Duration](#editing-task-duration)
   - [Viewing Duration Change Logs](#viewing-duration-change-logs)
3. [For Users](#for-users)
   - [Understanding Task Organization](#understanding-task-organization)
   - [Countdown Timers](#countdown-timers)
   - [Completing Tasks](#completing-tasks)
   - [Viewing Task Details](#viewing-task-details)
4. [FAQ](#faq)
5. [Troubleshooting](#troubleshooting)

---

## Introduction

The Time-Limited Tasks feature adds urgency and engagement to your task system by allowing administrators to set time constraints on tasks. Users can see countdown timers and must complete tasks before they expire.

### Key Features

✅ **Optional Time Limits** - Add time constraints to any task (1-24 hours)  
⏱️ **Real-Time Countdown** - Live countdown timers show remaining time  
📊 **Organized View** - Tasks automatically organized into Active, Completed, and Missed sections  
🔔 **Expiration Handling** - Expired tasks automatically move to "Missed" category  
📝 **Audit Logging** - All duration changes are tracked for transparency  

---

## For Administrators

### Creating Time-Limited Tasks

#### Step 1: Access the Admin Panel

1. Log in to your admin account
2. Navigate to **Admin Dashboard** → **Tasks**
3. Click the **"Create New Task"** button

#### Step 2: Fill in Basic Task Information

Complete the standard task fields:

- **Title**: Enter a clear, concise task name
- **Description**: Provide detailed instructions
- **Points**: Set the reward points (1-1000)
- **Task Type**: Select from SOCIAL, QUIZ, SURVEY, REFERRAL, or CUSTOM
- **Task URL** (optional): Add external link if needed
- **Active Status**: Toggle to make task immediately available

#### Step 3: Enable Time Limit

To create a time-limited task:

1. **Check the "Enable Time Limit" checkbox**
   
   ![Enable Time Limit Checkbox](screenshots/enable-time-limit.png)

2. **Enter Duration in Hours**
   - Minimum: 1 hour
   - Maximum: 24 hours
   - Examples:
     - `6` = 6 hours
     - `12` = 12 hours
     - `24` = 24 hours (1 day)

3. **Review Calculated Expiration**
   
   The system automatically shows when the task will expire:
   ```
   ℹ️ Task will expire 12 hours after creation
   Expiration time: Nov 13, 2025 at 12:00 AM
   ```

#### Step 4: Create the Task

Click **"Create Task"** to save. The task is now live with a countdown timer!

### Example: Creating a Flash Sale Task

```
Title: Flash Sale - Double Points!
Description: Complete any social media task in the next 6 hours to earn double points
Points: 100
Task Type: CUSTOM
Enable Time Limit: ✓
Duration: 6 hours
```

Result: Users will see a 6-hour countdown timer and must complete within that window.

---

### Editing Task Duration

You can modify time limits on existing tasks at any time.

#### Step 1: Find the Task

1. Go to **Admin Dashboard** → **Tasks**
2. Locate the task you want to edit
3. Click the **"Edit"** button (pencil icon)

#### Step 2: Modify Duration

You have three options:

**Option A: Change Duration**
- Update the duration value (e.g., from 12 to 6 hours)
- New expiration time is automatically calculated
- Click **"Save Changes"**

**Option B: Remove Time Limit**
- Uncheck "Enable Time Limit"
- Duration and expiration are cleared
- Task becomes permanent (no expiration)

**Option C: Add Time Limit to Existing Task**
- Check "Enable Time Limit"
- Enter desired duration
- Expiration is calculated from current time

#### Important Notes

⚠️ **Changing duration affects all users** - If users have already started the task, the new expiration applies immediately

⚠️ **Audit trail is created** - All duration changes are logged with timestamp and admin details

⚠️ **Cannot extend expired tasks** - Once a task expires, it cannot be reactivated for users who missed it

---

### Viewing Duration Change Logs

Track all modifications to task durations for transparency and auditing.

#### Accessing Audit Logs

1. Navigate to **Admin Dashboard** → **Audit** → **Duration Changes**
2. View the complete history of duration modifications

#### Log Information

Each log entry shows:

| Field | Description |
|-------|-------------|
| **Task Title** | Name of the modified task |
| **Admin** | Who made the change |
| **Old Duration** | Previous duration (or "None" if adding time limit) |
| **New Duration** | Updated duration (or "None" if removing time limit) |
| **Old Expiration** | Previous expiration timestamp |
| **New Expiration** | Updated expiration timestamp |
| **Changed At** | When the modification occurred |

#### Filtering Logs

- **By Task**: Click on a task name to see its change history
- **By Date**: Use date range filters
- **By Admin**: Filter by administrator who made changes

![Duration Change Logs](screenshots/duration-audit-logs.png)

---

## For Users

### Understanding Task Organization

Your tasks page is organized into three sections for easy navigation:

#### 🎯 Row 1: Active Tasks (Up to 5)

**What you'll see:**
- Tasks you haven't completed yet
- Tasks that haven't expired
- Maximum of 5 tasks displayed
- Countdown timers on time-limited tasks

**What to do:**
- Focus on completing these tasks first
- Pay attention to countdown timers
- Click "Complete Task" when finished

![Active Tasks Section](screenshots/active-tasks.png)

#### ✅ Row 2: Completed Tasks

**What you'll see:**
- Your 5 most recently completed tasks
- Tasks displayed as cards (top 5)
- Collapsible list for additional completed tasks
- Completion dates and points earned

**What to do:**
- Review your accomplishments
- Click on list items to view full details
- Track your progress over time

![Completed Tasks Section](screenshots/completed-tasks.png)

#### ❌ Row 3: Missed Tasks

**What you'll see:**
- Time-limited tasks that expired before completion
- Your 5 most recently missed tasks
- "Expired" badges on all missed tasks
- Collapsible list for additional missed tasks

**What to do:**
- Learn from missed opportunities
- Prioritize time-limited tasks in the future
- Click on list items to see what you missed

![Missed Tasks Section](screenshots/missed-tasks.png)

---

### Countdown Timers

#### How Countdown Timers Work

Time-limited tasks display a live countdown timer showing remaining time:

```
⏱️ 05:23:47
   HH:MM:SS
```

**Timer Features:**
- ✅ Updates every second in real-time
- ✅ Shows hours, minutes, and seconds
- ✅ Turns red when less than 1 hour remains
- ✅ Displays "Expired" when time runs out
- ✅ Pauses when browser tab is inactive (saves battery)
- ✅ Syncs with server time (prevents manipulation)

#### Timer States

**Normal State (Green):**
```
⏱️ 12:30:00
```
Plenty of time remaining - no rush!

**Warning State (Yellow):**
```
⏱️ 00:45:30
```
Less than 1 hour left - complete soon!

**Critical State (Red):**
```
⏱️ 00:05:00
```
Less than 5 minutes - hurry!

**Expired State:**
```
⏰ Expired
```
Time's up - task moved to "Missed" section

#### Timer Behavior

**When you switch tabs:**
- Timer pauses to save battery
- Resumes when you return
- Automatically checks for expiration

**When you refresh the page:**
- Timer syncs with server
- Shows accurate remaining time
- Handles timezone differences

**When timer reaches zero:**
- Task card updates immediately
- "Complete" button becomes disabled
- Task moves to "Missed Tasks" section
- Toast notification appears

---

### Completing Tasks

#### Standard Tasks (No Time Limit)

1. Click on the task card to view details
2. Follow the task instructions
3. Click **"Complete Task"** button
4. Earn your points!

#### Time-Limited Tasks

1. **Check the countdown timer** - Make sure you have enough time
2. **Complete the task requirements** - Follow instructions carefully
3. **Click "Complete Task"** - Must be done before timer expires
4. **Earn your points** - Points are awarded immediately

#### What Happens If Time Runs Out?

If you don't complete a time-limited task before expiration:

❌ **Task becomes unavailable** - "Complete" button is disabled  
❌ **No points awarded** - Cannot earn points after expiration  
📋 **Moved to "Missed Tasks"** - Appears in Row 3 for your records  
🔔 **Notification shown** - Toast message alerts you of expiration  

**Important:** Once a task expires, it cannot be completed. There are no extensions or second chances.

---

### Viewing Task Details

Click on any task (in cards or lists) to open a detailed popup modal.

#### Task Detail Modal Contents

**Header:**
- Task title
- Status badge (Active/Completed/Missed)
- Countdown timer (if active and time-limited)

**Body:**
- Full description
- Task type
- Points value
- External URL (if applicable)
- Completion date (if completed)
- Expiration date (if missed)

**Footer:**
- Close button
- Complete button (if active and not expired)

![Task Detail Modal](screenshots/task-detail-modal.png)

#### Keyboard Navigation

- **Escape key**: Close modal
- **Tab key**: Navigate between elements
- **Enter key**: Activate buttons
- **Space key**: Toggle checkboxes

---

## FAQ

### General Questions

**Q: Can I complete a task after it expires?**  
A: No, once a time-limited task expires, it cannot be completed. The task moves to your "Missed Tasks" section.

**Q: Do all tasks have time limits?**  
A: No, time limits are optional. Many tasks have no expiration and can be completed anytime.

**Q: How do I know if a task has a time limit?**  
A: Time-limited tasks display a countdown timer (⏱️) in the top-right corner of the task card.

**Q: What happens if I start a task but don't finish before it expires?**  
A: The task will expire and move to "Missed Tasks." You won't receive points, and you cannot complete it later.

**Q: Can administrators extend the time limit on a task I'm working on?**  
A: Yes, administrators can modify task durations. If extended, you'll see the updated countdown timer. If shortened, the task may expire sooner.

### Technical Questions

**Q: What if my internet connection drops while completing a task?**  
A: The countdown timer continues on the server. When you reconnect, the timer will sync and show the correct remaining time.

**Q: Does the timer keep running if I close my browser?**  
A: Yes, the timer runs on the server. When you return, it will show the accurate remaining time.

**Q: Can I manipulate the timer by changing my system clock?**  
A: No, the timer is synchronized with server time and cannot be manipulated by changing local time settings.

**Q: Why did my timer jump when I switched tabs?**  
A: The timer pauses when your tab is inactive to save battery. When you return, it syncs with the server and shows the correct time.

**Q: What timezone is used for expiration times?**  
A: All times are stored in UTC and converted to your local timezone for display.

### Troubleshooting

**Q: The countdown timer isn't updating**  
A: Try refreshing the page. If the issue persists, check your internet connection.

**Q: I completed a task but it shows as "Missed"**  
A: The task likely expired before your completion was submitted. Check the expiration time in the task details.

**Q: I don't see any active tasks**  
A: This means you've completed all available tasks or all time-limited tasks have expired. Check back later for new tasks!

**Q: The "Complete Task" button is disabled**  
A: This happens when:
- The task has expired (check for "Expired" badge)
- You've already completed the task
- The task is no longer active (admin disabled it)

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Timer Shows Incorrect Time

**Symptoms:**
- Countdown shows wrong hours/minutes
- Timer jumps unexpectedly
- Expiration time doesn't match

**Solutions:**
1. Refresh the page to sync with server
2. Check your system time is correct
3. Clear browser cache and cookies
4. Try a different browser

---

#### Issue: Cannot Complete Task

**Symptoms:**
- "Complete Task" button is grayed out
- Click does nothing
- Error message appears

**Solutions:**
1. **Check if task expired** - Look for "Expired" badge
2. **Verify you haven't already completed it** - Check "Completed Tasks" section
3. **Ensure task is still active** - Admin may have disabled it
4. **Check internet connection** - Completion requires server communication
5. **Try refreshing the page** - May resolve temporary issues

---

#### Issue: Task Not Appearing in Correct Section

**Symptoms:**
- Completed task still in "Active"
- Expired task not in "Missed"
- Task missing entirely

**Solutions:**
1. **Refresh the page** - Sections update automatically but refresh ensures sync
2. **Wait a few seconds** - Background processes may be running
3. **Check all sections** - Task may be in unexpected location
4. **Verify task status** - Click task to see details in modal

---

#### Issue: Countdown Timer Not Visible

**Symptoms:**
- No timer on time-limited task
- Timer area is blank
- Only see task card without timer

**Solutions:**
1. **Verify task has time limit** - Not all tasks are time-limited
2. **Check if task expired** - Expired tasks show "Expired" badge instead of timer
3. **Refresh the page** - Timer may not have loaded
4. **Check browser compatibility** - Ensure JavaScript is enabled

---

### Getting Help

If you continue experiencing issues:

1. **Check System Status**: Visit status.your-domain.com
2. **Contact Support**: 
   - Email: support@your-domain.com
   - Live Chat: Available in app (bottom-right corner)
3. **Report a Bug**:
   - Include screenshot
   - Describe what you were doing
   - Note any error messages
   - Specify browser and device

---

## Best Practices

### For Users

✅ **Check timers regularly** - Don't let tasks expire unexpectedly  
✅ **Prioritize time-limited tasks** - Complete these before permanent tasks  
✅ **Read instructions carefully** - Ensure you understand requirements before starting  
✅ **Complete tasks promptly** - Don't wait until the last minute  
✅ **Keep browser tab open** - Ensures timer updates properly  

### For Administrators

✅ **Set reasonable durations** - Give users enough time to complete tasks  
✅ **Test before publishing** - Create test tasks to verify behavior  
✅ **Communicate clearly** - Explain time limits in task descriptions  
✅ **Monitor completion rates** - Adjust durations if too many tasks are missed  
✅ **Use audit logs** - Track changes for accountability  

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Close task detail modal |
| `Tab` | Navigate between interactive elements |
| `Enter` | Activate focused button |
| `Space` | Toggle checkboxes |
| `Ctrl/Cmd + R` | Refresh page (sync timers) |

---

## Accessibility Features

The time-limited tasks feature is designed to be accessible to all users:

♿ **Screen Reader Support**
- All timers have ARIA labels
- Status changes are announced
- Modal dialogs are properly labeled

⌨️ **Keyboard Navigation**
- All features accessible without mouse
- Logical tab order
- Focus indicators visible

🎨 **Visual Accessibility**
- High contrast color schemes
- Color is not the only indicator
- Text alternatives for icons
- Readable font sizes

---

## Updates and Changelog

### Version 1.0.0 (November 2025)
- ✨ Initial release of time-limited tasks
- ⏱️ Real-time countdown timers
- 📊 Organized task view (Active/Completed/Missed)
- 🔍 Task detail modal
- 📝 Duration change audit logging
- ♿ Full accessibility support

---

## Feedback

We'd love to hear your thoughts on the time-limited tasks feature!

**Share Feedback:**
- Email: feedback@your-domain.com
- In-app: Click "Feedback" button
- Community: Join our Discord/Telegram

**Feature Requests:**
- Submit via GitHub Issues
- Vote on existing requests
- Participate in beta testing

---

## Additional Resources

- 📖 [API Documentation](API_DOCUMENTATION.md)
- 🔧 [Technical Design Document](design.md)
- ✅ [Testing Guide](TESTING_GUIDE.md)
- 🎥 [Video Tutorials](https://youtube.com/your-channel)
- 💬 [Community Forum](https://forum.your-domain.com)

---

**Last Updated:** November 12, 2025  
**Version:** 1.0.0  
**Maintained by:** Development Team
