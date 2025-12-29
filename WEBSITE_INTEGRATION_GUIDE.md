# Website Integration Guide - For Developers

This guide explains how the CropDrive website receives and processes messages from the AI Assistant.

## How It Works

1. **AI Assistant sends message** → `window.parent.postMessage({ type: 'ANALYSIS_COMPLETE', ... }, '*')`
2. **Website receives message** → Listens via `window.addEventListener('message', ...)`
3. **Website saves to database** → Calls `/api/save-analysis-report` API
4. **Website updates UI** → Refreshes user data and displays in history

## Message Flow

```
AI Assistant (iframe)
    ↓ postMessage
Website (parent window)
    ↓ API call
/api/save-analysis-report
    ↓ Save to Firestore
Firestore (analysis_results collection)
    ↓ Real-time listener
Reports Page (updates automatically)
```

## Key Components

### 1. Message Listener (`src/app/assistant/page.tsx`)

The assistant page listens for messages from the iframe:

```typescript
useEffect(() => {
  const handleMessage = async (event: MessageEvent) => {
    // Check if message is ANALYSIS_COMPLETE
    if (event.data?.type === 'ANALYSIS_COMPLETE') {
      // Process the message
      // Save to database
      // Update UI
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### 2. API Endpoint (`src/app/api/save-analysis-report/route.ts`)

Saves the analysis report to Firestore and increments upload count:

- Validates user authentication
- Checks upload limits
- Saves to `analysis_results` collection
- Increments `uploadsUsed` in `users` collection
- Returns updated upload counts

### 3. Reports Page (`src/app/reports/page.tsx`)

Displays all completed analysis reports:

- Fetches from `analysis_results` collection
- Filters by `userId` and `status: 'completed'`
- Listens for `analysisReportSaved` custom event
- Auto-refreshes when new reports are saved

### 4. Progress Bar Updates

The progress bar updates automatically when:
- User data is refreshed after analysis
- `analysisReportSaved` event is dispatched
- Real-time Firestore listeners detect changes

## Testing the Integration

### 1. Test Message Reception

Open browser console on `/assistant` page and look for:
```
📨 Message received from iframe: {...}
🎯🎯🎯 ANALYSIS_COMPLETE DETECTED!
```

### 2. Test API Call

Check Network tab for:
- Request to `/api/save-analysis-report`
- Status: 200
- Response: `{ success: true, reportId: "...", uploadsUsed: X, uploadsLimit: Y }`

### 3. Test Database Save

Check Firestore Console:
- Collection: `analysis_results`
- Document should have:
  - `userId`: Current user's ID
  - `status`: "completed"
  - `title`, `type`, `summary`, etc.

### 4. Test UI Updates

- Check `/reports` page - new report should appear
- Check progress bar - should update with new upload count
- Check dashboard - stats should update

## Troubleshooting

### Messages Not Received

1. **Check iframe origin**: Ensure AI Assistant URL is correct
2. **Check browser console**: Look for origin validation errors
3. **Check message format**: Must have `type: 'ANALYSIS_COMPLETE'`

### Reports Not Saving

1. **Check API response**: Look for errors in Network tab
2. **Check authentication**: User must be logged in
3. **Check upload limits**: User might have exceeded limit
4. **Check Firestore rules**: Ensure write permissions

### Progress Bar Not Updating

1. **Check user data refresh**: `refreshUser()` should be called
2. **Check event dispatch**: `analysisReportSaved` event should fire
3. **Check Firestore**: Verify `uploadsUsed` is incremented
4. **Check component state**: Progress bar should re-render

## Debugging Commands

### In Browser Console

```javascript
// Check if messages are being received
window.addEventListener('message', (e) => {
  console.log('Message received:', e.data);
});

// Manually trigger user refresh
// (if refreshUser is available in scope)
refreshUser();

// Check Firestore data
// (if db is available in scope)
import { collection, query, where, getDocs } from 'firebase/firestore';
const q = query(collection(db, 'analysis_results'), where('userId', '==', 'USER_ID'));
const docs = await getDocs(q);
console.log('Reports:', docs.docs.map(d => d.data()));
```

## Common Issues

### Issue: Message blocked by origin validation

**Solution**: ANALYSIS_COMPLETE messages are now accepted from any origin. If still blocked, check:
- Message format is correct
- `type` field is exactly `'ANALYSIS_COMPLETE'`

### Issue: Upload limit not incrementing

**Solution**: 
1. Check API response includes `uploadsUsed` and `uploadsLimit`
2. Verify Firestore `users` collection is updated
3. Ensure `refreshUser()` is called after save

### Issue: Reports not appearing in history

**Solution**:
1. Check Firestore document has `status: 'completed'`
2. Verify `userId` matches current user
3. Check reports page query filters
4. Ensure Firestore indexes are created

## Firestore Structure

### `analysis_results` Collection

```typescript
{
  userId: string,           // Required: Current user's ID
  title: string,            // Required: Report title
  type: 'soil' | 'leaf',   // Required: Analysis type
  summary: string,          // Required: Summary text
  recommendations: number, // Required: Number of recommendations
  status: 'completed',      // Required: Always 'completed'
  date: string,            // ISO date string
  fileUrl: string | null,  // Optional: File URL
  analysisData: object | null, // Optional: Full analysis data
  createdAt: Timestamp,    // Firestore timestamp
  updatedAt: Timestamp    // Firestore timestamp
}
```

### `users` Collection

```typescript
{
  uploadsUsed: number,     // Current upload count
  uploadsLimit: number,    // Upload limit (-1 for unlimited)
  plan: string,           // User's plan: 'start', 'smart', 'precision', 'none'
  // ... other user fields
}
```

## Security Notes

1. **Origin Validation**: ANALYSIS_COMPLETE messages are accepted from any origin for reliability
2. **User Authentication**: All API calls require valid Firebase auth token
3. **User ID Validation**: API verifies userId matches authenticated user
4. **Upload Limits**: Checked server-side before saving reports

## Support

For issues:
1. Check browser console for errors
2. Check Network tab for API errors
3. Check Firestore console for data
4. Review this guide for common solutions

