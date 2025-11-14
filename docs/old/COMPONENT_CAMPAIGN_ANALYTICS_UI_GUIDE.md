# Campaign Analytics UI Guide

## Overview

The Campaign Analytics UI provides comprehensive visualization and analysis of campaign performance, including participation rates, completion metrics, engagement scores, and task-level breakdowns.

## Components

### 1. CampaignAnalytics Component

**Location:** `components/admin/CampaignAnalytics.tsx`

**Purpose:** Displays detailed analytics for a single campaign

**Features:**
- Key metrics cards (participation rate, completion rate, engagement score, avg completions)
- Additional metrics (daily active users, avg completion time, total tasks)
- Daily participation pattern chart (line chart)
- Weekly participation pattern chart (bar chart)
- Task performance breakdown table
- Export report functionality

**Usage:**
```tsx
import { CampaignAnalytics } from '@/components/admin/CampaignAnalytics'

<CampaignAnalytics campaignId="campaign-id" />
```

**API Endpoints:**
- `GET /api/admin/campaigns/[id]/analytics` - Fetch analytics data
- `GET /api/admin/campaigns/[id]/report` - Export performance report

### 2. CampaignComparison Component

**Location:** `components/admin/CampaignComparison.tsx`

**Purpose:** Compare multiple campaigns side-by-side

**Features:**
- Campaign selection interface
- Key insights generation
- Comparison charts (participation, completion, engagement, total completions)
- Detailed comparison table

**Usage:**
```tsx
import { CampaignComparison } from '@/components/admin/CampaignComparison'

<CampaignComparison 
  campaigns={allCampaigns} 
  currentCampaignId="campaign-id" 
/>
```

**API Endpoints:**
- `POST /api/admin/campaigns/compare` - Compare multiple campaigns

## Integration

The analytics UI is integrated into the campaign detail page with a tabbed interface:

1. **Details Tab** - Campaign information and task list
2. **Analytics Tab** - Campaign analytics dashboard
3. **Comparison Tab** - Campaign comparison tool

## Metrics Explained

### Participation Rate
Percentage of total users who have completed at least one task in the campaign.

**Formula:** `(Participating Users / Total Users) × 100`

### Completion Rate
Percentage of tasks completed out of all possible completions.

**Formula:** `(Total Completions / (Total Tasks × Participating Users)) × 100`

### Engagement Score
Composite score (0-100) based on:
- Participation Rate (30% weight)
- Completion Rate (40% weight)
- Engagement Depth (30% weight)

**Color Coding:**
- Green (≥70): High engagement
- Yellow (40-69): Medium engagement
- Red (<40): Low engagement

### Task Performance Metrics

For each task:
- **Completions:** Total number of completions
- **Unique Users:** Number of distinct users who completed the task
- **Completion Rate:** Percentage of participating users who completed this task
- **Approval Rate:** Percentage of completions that were approved
- **Avg. Time:** Average time taken to complete the task

## Charts

### Daily Participation Pattern
Line chart showing daily participants and completions over time.

### Weekly Participation Pattern
Bar chart showing weekly participants and average engagement.

### Comparison Charts
Bar charts comparing selected campaigns across key metrics.

## Export Functionality

The "Export Report" button generates a JSON report containing:
- Campaign summary
- Performance metrics
- Top and low performing tasks
- Automated recommendations

## Performance Considerations

- Analytics are calculated on-demand (not cached)
- Large campaigns may take a few seconds to calculate
- Consider implementing caching for frequently accessed campaigns
- Date range filtering can be added for better performance

## Future Enhancements

Potential improvements:
1. Date range selector for time-based filtering
2. Real-time analytics updates
3. PDF export with charts
4. Email scheduled reports
5. Custom metric definitions
6. Drill-down into specific tasks
7. User cohort analysis
8. Predictive analytics

## Troubleshooting

### Analytics not loading
- Check that the campaign exists
- Verify admin permissions
- Check browser console for API errors

### Charts not displaying
- Ensure recharts library is installed
- Check that data is in correct format
- Verify chart component props

### Comparison not working
- Ensure at least 2 campaigns are selected
- Check that campaigns have data
- Verify API endpoint is accessible

## Related Files

- `lib/admin/campaign-analytics.ts` - Analytics calculation logic
- `app/api/admin/campaigns/[id]/analytics/route.ts` - Analytics API
- `app/api/admin/campaigns/compare/route.ts` - Comparison API
- `app/api/admin/campaigns/[id]/report/route.ts` - Report generation API
- `components/admin/AnalyticsChart.tsx` - Chart component
