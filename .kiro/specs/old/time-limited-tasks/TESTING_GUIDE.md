# Manual Testing Guide for Time-Limited Tasks

This guide provides step-by-step instructions for manually testing the time-limited tasks feature.

## Prerequisites

- Application running locally (development server)
- Admin account credentials
- User account credentials
- Browser with developer tools

## Test Scenarios

### 1. Create Time-Limited Task as Admin

**Steps**:
1. Log in as admin
2. Navigate to Admin Dashboard → Tasks
3. Click "Create New Task" button
4. Fill in task details and check "Enable Time Limit"
5. Enter duration: 2 (hours)
6. Click "Create Task"

**Expected**: Task created with duration and expiration time

### 2. Verify Countdown Timer Displays Correctly

**Steps**:
1. Log in as user
2. Navigate to Tasks page
3. Observe countdown timer on time-limited task
4. Wait 10-15 seconds

**Expected**: Timer shows HH:MM:SS format and updates every second

### 3. Wait for Expiration and Verify Status Change

**Steps**:
1. Create task with 1-minute duration
2. Wait for timer to reach 00:00:00
3. Observe changes

**Expected**: Timer shows "Expired", task moves to "Missed Tasks" section

### 4. Attempt to Complete Expired Task

**Steps**:
1. Try to complete expired task
2. Observe result

**Expected**: Button disabled, error message shown, no points awarded

### 5. Verify Task Organization

**Steps**:
1. Create multiple tasks (regular, time-limited, expired)
2. Complete some tasks
3. Observe three sections

**Expected**: 
- Row 1: Active tasks (max 5)
- Row 2: Completed tasks (5 recent + list)
- Row 3: Missed tasks (5 recent + list)

### 6. Test Responsive Layout

**Steps**:
1. View page on desktop, tablet, mobile sizes
2. Check grid layouts

**Expected**: Proper column counts for each screen size

### 7. Test Collapsible Lists and Modal

**Steps**:
1. Create 10+ completed and missed tasks
2. Click "Show more" buttons
3. Click task in list to open modal
4. Test modal close methods

**Expected**: Lists expand, modal opens/closes correctly

## Test Results

Record results for each test:
- Test #: ___
- Status: PASS / FAIL
- Notes: ___

## Completion Checklist

- [ ] All test scenarios completed
- [ ] All expected results verified
- [ ] Issues documented
- [ ] Screenshots captured

**Tester**: ___________________
**Date**: ___________________
**Status**: [ ] Passed  [ ] Failed
