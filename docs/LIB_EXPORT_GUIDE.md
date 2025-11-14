# Data Export System Guide

## Overview

The data export system provides advanced export capabilities for admin users, supporting multiple formats (CSV, Excel, JSON) with field selection and filtering.

## Features

### Export Formats

1. **CSV (Comma-Separated Values)**
   - Lightweight and universal format
   - Compatible with Excel, Google Sheets, and most data tools
   - Best for simple data analysis and imports

2. **Excel (XLSX)**
   - Native Microsoft Excel format
   - Preserves formatting and data types
   - Supports auto-sized columns
   - Best for detailed analysis and reporting

3. **JSON (JavaScript Object Notation)**
   - Structured data format
   - Ideal for API integrations and data processing
   - Preserves nested objects and arrays
   - Best for developers and automated systems

### Field Selection

- Select specific fields to export
- "Select All" / "Deselect All" quick actions
- Visual indication of selected fields
- Prevents unnecessary data exposure

### Filter Integration

- Exports respect active UI filters
- Filter count displayed in export dialog
- Ensures exported data matches what's visible

### Large Dataset Handling

The system is designed to handle large exports:

1. **Synchronous Exports** (Default)
   - Immediate download for most datasets
   - Direct file download in browser

2. **Asynchronous Exports** (Future Enhancement)
   - For very large datasets (>10,000 records)
   - Background processing
   - Email notification with download link
   - Currently disabled, ready for implementation

## Usage

### From User Management Page

1. Navigate to Admin → Users
2. Apply any desired filters (role, search, etc.)
3. Click the "Export" button
4. Select export format (CSV, Excel, or JSON)
5. Choose fields to include
6. Click "Export" to download

### Programmatic Usage

```typescript
import { exportData } from '@/lib/admin/export'

const result = await exportData({
  format: 'excel',
  model: 'users',
  filters: [
    {
      field: 'role',
      operator: 'equals',
      value: 'USER',
    },
  ],
  fields: ['username', 'email', 'totalPoints'],
})

// result.data contains the file buffer
// result.filename contains the generated filename
// result.mimeType contains the MIME type
```

## API Endpoint

### POST /api/admin/export

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "format": "csv" | "excel" | "json",
  "model": "users" | "tasks" | "completions" | "campaigns",
  "filters": [
    {
      "field": "role",
      "operator": "equals",
      "value": "USER"
    }
  ],
  "fields": ["username", "email", "totalPoints"]
}
```

**Response:**
- Success: File download with appropriate Content-Type and Content-Disposition headers
- Async: JSON response with `{ async: true, message: "..." }`
- Error: JSON response with error details

## Data Models

### Users Export

Available fields:
- id, username, email, role, status
- totalPoints, walletAddress, walletVerified
- twitterUsername, twitterVerified
- telegramUsername, telegramVerified
- createdAt, lastActive

### Tasks Export

Available fields:
- id, title, description, taskType
- points, taskUrl, isActive
- campaign (nested object)
- createdAt, updatedAt

### Completions Export

Available fields:
- id, status, pointsAwarded, completedAt
- user (nested object with id, email, username, walletAddress)
- task (nested object with id, title, taskType, points)

### Campaigns Export

Available fields:
- id, title, description, startDate, endDate
- isActive, createdAt, updatedAt
- _count.tasks (number of tasks)

## Security

### Access Control

- Only users with ADMIN role can export data
- All exports are logged in audit trail
- Failed exports are also logged

### Audit Logging

Every export operation creates an audit log entry:
```typescript
{
  action: 'export_completed',
  adminId: 'user-id',
  adminEmail: 'admin@example.com',
  affectedModel: 'users',
  afterData: {
    format: 'excel',
    model: 'users',
    filename: 'users_export_2025-01-10.xlsx',
    filterCount: 2,
    fieldCount: 5,
  },
}
```

### Data Protection

- Sensitive fields can be excluded from exports
- Field selection prevents accidental data exposure
- Filters ensure only authorized data is exported

## Performance Considerations

### CSV Export
- Fast generation
- Low memory usage
- Suitable for any dataset size

### Excel Export
- Moderate generation time
- Higher memory usage
- Auto-sized columns add processing time
- Recommended for datasets < 50,000 rows

### JSON Export
- Fast generation
- Preserves data structure
- Can be large for nested objects
- Best for programmatic consumption

## Error Handling

The system handles various error scenarios:

1. **Authentication Errors**
   - Returns 401 Unauthorized
   - Redirects to login

2. **Authorization Errors**
   - Returns 403 Forbidden
   - Requires ADMIN role

3. **Validation Errors**
   - Returns 400 Bad Request
   - Invalid format or model

4. **Export Errors**
   - Returns 500 Internal Server Error
   - Logs error in audit trail
   - Displays user-friendly error message

## Future Enhancements

### Async Export Implementation

When implementing async exports:

1. **Job Queue Setup**
   ```typescript
   // Use Bull or BullMQ with Redis
   import Queue from 'bull'
   
   const exportQueue = new Queue('exports', {
     redis: process.env.REDIS_URL,
   })
   ```

2. **Worker Process**
   ```typescript
   exportQueue.process(async (job) => {
     const result = await exportData(job.data)
     const url = await uploadToS3(result.data)
     await sendEmail(job.data.adminEmail, url)
   })
   ```

3. **Email Notification**
   - Send email with download link
   - Set expiration (24-48 hours)
   - Track download attempts

### Scheduled Exports

- Allow admins to schedule recurring exports
- Daily/weekly/monthly reports
- Automatic email delivery
- Configurable field selection and filters

### Export Templates

- Save export configurations as templates
- Quick access to common export formats
- Share templates across admin team

## Troubleshooting

### Export Button Not Working

1. Check browser console for errors
2. Verify admin authentication
3. Check network tab for API errors
4. Ensure popup blockers aren't interfering

### Large File Downloads Failing

1. Check browser download settings
2. Verify sufficient disk space
3. Try smaller field selection
4. Use filters to reduce dataset size

### Excel Files Not Opening

1. Verify file extension is .xlsx
2. Check Excel version compatibility
3. Try opening in Google Sheets
4. Re-download the file

### Missing Data in Export

1. Verify field selection includes desired fields
2. Check active filters
3. Ensure data exists in database
4. Review audit logs for export details

## Best Practices

1. **Use Filters**
   - Export only necessary data
   - Reduces file size and processing time
   - Improves data relevance

2. **Select Specific Fields**
   - Don't export all fields by default
   - Reduces data exposure risk
   - Faster processing

3. **Choose Appropriate Format**
   - CSV for simple data and imports
   - Excel for analysis and reporting
   - JSON for programmatic use

4. **Regular Exports**
   - Schedule regular backups
   - Monitor data trends
   - Maintain historical records

5. **Audit Review**
   - Regularly review export logs
   - Monitor for unusual activity
   - Ensure compliance with data policies

## Support

For issues or questions:
1. Check this guide first
2. Review audit logs for error details
3. Check browser console for client-side errors
4. Contact system administrator

## Related Documentation

- [Filtering System Guide](./FILTERING_GUIDE.md)
- [Audit Logging Guide](./AUDIT_GUIDE.md)
- [Bulk Operations Guide](./BULK_OPERATIONS_GUIDE.md)
