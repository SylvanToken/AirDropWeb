# Campaign Analytics Guide

## Overview

The Campaign Analytics module provides comprehensive analytics and reporting capabilities for campaigns in the Sylvan Token Airdrop Platform. It enables admins to track campaign performance, analyze user engagement, compare campaigns, and generate automatic performance reports.

## Features

### 1. Participation Rate Calculation
- Tracks how many users participated in a campaign
- Calculates percentage of total users who engaged
- Identifies participating vs. non-participating users

### 2. Completion Rate Analysis
- Measures task completion rates per campaign
- Calculates average completions per user
- Tracks overall campaign completion percentage

### 3. Engagement Metrics
- Engagement score (0-100) based on multiple factors
- Average time to complete tasks
- Daily active users tracking
- Engagement depth analysis

### 4. Task-Level Performance Breakdown
- Individual task completion rates
- Unique users per task
- Average completion time per task
- Approval rates for each task
- Task type performance comparison

### 5. Campaign Comparison
- Side-by-side comparison of multiple campaigns
- Automatic insights generation
- Performance benchmarking
- Best practices identification

### 6. Automatic Performance Reports
- Comprehensive campaign summaries
- Top and low performing tasks
- Actionable recommendations
- Performance trends analysis

### 7. Time-Based Patterns
- Daily participation tracking
- Weekly engagement patterns
- Trend analysis over time

## API Endpoints

### Get Campaign Analytics

```typescript
GET /api/admin/campaigns/[id]/analytics?includeReport=true
```

**Response:**
```json
{
  "analytics": {
    "campaignId": "clx...",
    "campaignTitle": "Spring Campaign",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-03-31T23:59:59.999Z",
    "isActive": true,
    "totalUsers": 1000,
    "participatingUsers": 450,
    "participationRate": 45.0,
    "totalTasks": 10,
    "totalCompletions": 2500,
    "averageCompletionsPerUser": 5.56,
    "completionRate": 55.6,
    "engagementScore": 67.8,
    "averageTimeToComplete": 120,
    "dailyActiveUsers": 85,
    "taskPerformance": [...],
    "dailyParticipation": [...],
    "weeklyParticipation": [...]
  },
  "report": {
    "campaignId": "clx...",
    "campaignTitle": "Spring Campaign",
    "generatedAt": "2025-11-10T12:00:00.000Z",
    "period": {...},
    "summary": {...},
    "topPerformingTasks": [...],
    "lowPerformingTasks": [...],
    "recommendations": [...]
  }
}
```

### Generate Performance Report

```typescript
GET /api/admin/campaigns/[id]/report
```

**Response:**
```json
{
  "campaignId": "clx...",
  "campaignTitle": "Spring Campaign",
  "generatedAt": "2025-11-10T12:00:00.000Z",
  "period": {
    "start": "2025-01-01T00:00:00.000Z",
    "end": "2025-03-31T23:59:59.999Z"
  },
  "summary": {
    "totalParticipants": 450,
    "totalCompletions": 2500,
    "participationRate": 45.0,
    "completionRate": 55.6,
    "engagementScore": 67.8
  },
  "topPerformingTasks": [
    {
      "taskId": "clx...",
      "taskTitle": "Follow on Twitter",
      "taskType": "TWITTER_FOLLOW",
      "points": 10,
      "totalCompletions": 400,
      "uniqueUsers": 400,
      "completionRate": 88.9,
      "averageCompletionTime": 45,
      "approvalRate": 95.5
    }
  ],
  "lowPerformingTasks": [...],
  "recommendations": [
    "Campaign is performing well. Continue monitoring metrics.",
    "Consider promoting Task X which has low completion rate."
  ]
}
```

### Compare Campaigns

```typescript
POST /api/admin/campaigns/compare
Content-Type: application/json

{
  "campaignIds": ["clx1...", "clx2...", "clx3..."]
}
```

**Response:**
```json
{
  "campaigns": [
    {
      "id": "clx1...",
      "title": "Spring Campaign",
      "participationRate": 45.0,
      "completionRate": 55.6,
      "engagementScore": 67.8,
      "totalCompletions": 2500
    },
    {
      "id": "clx2...",
      "title": "Summer Campaign",
      "participationRate": 52.3,
      "completionRate": 61.2,
      "engagementScore": 72.1,
      "totalCompletions": 3100
    }
  ],
  "insights": [
    "Summer Campaign has the highest engagement score (72.1)",
    "Summer Campaign has the highest participation rate (52.3%)",
    "Summer Campaign has the highest completion rate (61.2%)"
  ]
}
```

## Usage Examples

### Calculate Campaign Analytics

```typescript
import { calculateCampaignAnalytics } from '@/lib/admin/campaign-analytics';

const analytics = await calculateCampaignAnalytics('campaign-id');

console.log(`Participation Rate: ${analytics.participationRate.toFixed(1)}%`);
console.log(`Completion Rate: ${analytics.completionRate.toFixed(1)}%`);
console.log(`Engagement Score: ${analytics.engagementScore}`);
```

### Generate Performance Report

```typescript
import { generatePerformanceReport } from '@/lib/admin/campaign-analytics';

const report = await generatePerformanceReport('campaign-id');

console.log('Top Performing Tasks:');
report.topPerformingTasks.forEach(task => {
  console.log(`- ${task.taskTitle}: ${task.completionRate.toFixed(1)}%`);
});

console.log('\nRecommendations:');
report.recommendations.forEach(rec => {
  console.log(`- ${rec}`);
});
```

### Compare Multiple Campaigns

```typescript
import { compareCampaigns } from '@/lib/admin/campaign-analytics';

const comparison = await compareCampaigns([
  'campaign-1-id',
  'campaign-2-id',
  'campaign-3-id'
]);

console.log('Campaign Comparison:');
comparison.campaigns.forEach(c => {
  console.log(`${c.title}: ${c.engagementScore} engagement score`);
});

console.log('\nInsights:');
comparison.insights.forEach(insight => {
  console.log(`- ${insight}`);
});
```

## Metrics Explained

### Participation Rate
Percentage of total users who completed at least one task in the campaign.

**Formula:** `(Participating Users / Total Users) × 100`

**Good:** > 40%  
**Average:** 20-40%  
**Poor:** < 20%

### Completion Rate
Percentage of tasks completed out of all possible completions.

**Formula:** `(Total Completions / (Total Tasks × Participating Users)) × 100`

**Good:** > 60%  
**Average:** 30-60%  
**Poor:** < 30%

### Engagement Score
Composite score (0-100) based on:
- Participation Rate (30% weight)
- Completion Rate (40% weight)
- Engagement Depth (30% weight)

**Good:** > 70  
**Average:** 40-70  
**Poor:** < 40

### Engagement Depth
How many tasks users complete on average relative to total tasks.

**Formula:** `(Average Completions Per User / Total Tasks) × 100`

### Approval Rate
Percentage of task completions that were approved.

**Formula:** `(Approved Completions / Total Completions) × 100`

**Good:** > 80%  
**Average:** 60-80%  
**Poor:** < 60%

## Recommendations System

The automatic report generation includes intelligent recommendations based on:

1. **Low Participation (< 30%)**
   - Suggests increased promotion
   - Recommends reviewing task difficulty

2. **Low Completion Rate (< 50%)**
   - Indicates tasks may be too difficult
   - Suggests reviewing time requirements

3. **Low Engagement Score (< 40)**
   - Recommends adding more rewarding tasks
   - Suggests improving task variety

4. **Low Approval Rates (< 70%)**
   - Flags verification criteria issues
   - Suggests reviewing task requirements

5. **Performance Gaps (> 50% difference)**
   - Identifies unbalanced task difficulty
   - Recommends reward rebalancing

## Best Practices

### 1. Regular Monitoring
- Check analytics weekly during active campaigns
- Generate reports at campaign milestones (25%, 50%, 75%, 100%)
- Monitor daily active users for engagement trends

### 2. Comparative Analysis
- Compare similar campaigns to identify patterns
- Benchmark new campaigns against historical data
- Use insights to optimize future campaigns

### 3. Task Optimization
- Review low-performing tasks regularly
- Adjust rewards based on completion rates
- Remove or modify tasks with low approval rates

### 4. User Engagement
- Track participation trends over time
- Identify drop-off points in campaigns
- Adjust campaign duration based on engagement patterns

### 5. Report Utilization
- Share reports with stakeholders
- Use recommendations for campaign planning
- Document successful strategies for replication

## Performance Considerations

- Analytics calculations are cached for 5 minutes
- Large campaigns (>10,000 completions) may take 2-3 seconds to calculate
- Use date range filtering for historical analysis
- Consider pagination for task performance data

## Troubleshooting

### Slow Analytics Loading
- Check database indexes on completions table
- Consider implementing caching layer
- Use date range filtering to reduce data volume

### Inaccurate Metrics
- Verify completion data integrity
- Check for duplicate completions
- Ensure proper status filtering (APPROVED/AUTO_APPROVED)

### Missing Data
- Confirm campaign has tasks and completions
- Check date ranges for active campaigns
- Verify user participation data

## Future Enhancements

- Real-time analytics dashboard
- Predictive analytics for campaign success
- A/B testing framework for campaigns
- Export analytics to PDF/Excel
- Scheduled automatic reports via email
- Custom metric definitions
- Advanced segmentation analysis
