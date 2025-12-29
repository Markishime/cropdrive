# AI Assistant & Website Integration Summary

## Quick Start

### For AI Assistant Developers

1. **Read**: `AI_ASSISTANT_INTEGRATION_GUIDE.md`
2. **Implement**: Send `ANALYSIS_COMPLETE` message after analysis
3. **Test**: Check browser console for message reception

### For Website Developers

1. **Read**: `WEBSITE_INTEGRATION_GUIDE.md`
2. **Verify**: Message listener is working
3. **Test**: Check Firestore for saved reports

## Integration Flow

```
┌─────────────────┐
│  AI Assistant   │
│    (iframe)     │
└────────┬────────┘
         │
         │ postMessage({ type: 'ANALYSIS_COMPLETE', ... })
         │
         ▼
┌─────────────────┐
│  Website        │
│  (parent)       │
└────────┬────────┘
         │
         │ API Call: /api/save-analysis-report
         │
         ▼
┌─────────────────┐
│  API Endpoint   │
└────────┬────────┘
         │
         │ Save to Firestore
         │ Increment uploadsUsed
         │
         ▼
┌─────────────────┐
│   Firestore     │
│  - analysis_    │
│    results      │
│  - users        │
└────────┬────────┘
         │
         │ Real-time updates
         │
         ▼
┌─────────────────┐
│  UI Updates     │
│  - Reports Page │
│  - Progress Bar │
│  - Dashboard    │
└─────────────────┘
```

## Key Files

### Website Side
- `src/app/assistant/page.tsx` - Message listener and handler
- `src/app/api/save-analysis-report/route.ts` - API endpoint
- `src/app/reports/page.tsx` - Reports display page
- `src/app/dashboard/page.tsx` - Dashboard with stats

### AI Assistant Side
- Your Streamlit/Gradio app - Must send `ANALYSIS_COMPLETE` message

## Message Format (Required)

```javascript
{
  type: 'ANALYSIS_COMPLETE',        // REQUIRED: Must be exactly this
  title: 'Analysis Report - 2024-01-15',  // REQUIRED: String
  analysisType: 'soil',             // REQUIRED: 'soil' or 'leaf'
  summary: 'Brief summary...',      // REQUIRED: String
  recommendationsCount: 5,           // REQUIRED: Number
  fileUrl: 'https://...',           // OPTIONAL: String or null
  analysisData: { ... }             // OPTIONAL: Any object
}
```

## Testing Checklist

### ✅ Message Reception
- [ ] Open `/assistant` page
- [ ] Open browser console
- [ ] Run analysis in AI Assistant
- [ ] See `📨 Message received from iframe` in console
- [ ] See `🎯🎯🎯 ANALYSIS_COMPLETE DETECTED!` in console

### ✅ API Call
- [ ] Check Network tab
- [ ] See POST to `/api/save-analysis-report`
- [ ] Status: 200
- [ ] Response includes `reportId`, `uploadsUsed`, `uploadsLimit`

### ✅ Database Save
- [ ] Check Firestore Console
- [ ] Collection: `analysis_results`
- [ ] New document created
- [ ] Fields: `userId`, `status: 'completed'`, `title`, `type`, etc.

### ✅ UI Updates
- [ ] Reports page shows new report
- [ ] Progress bar updates
- [ ] Upload count increases
- [ ] Dashboard stats update

## Common Issues & Solutions

### Issue: Messages Not Received
**Solution**: 
- Check message format matches exactly
- Ensure `type: 'ANALYSIS_COMPLETE'` (case-sensitive)
- Check browser console for errors

### Issue: Reports Not Saving
**Solution**:
- Check user is authenticated
- Check upload limit not exceeded
- Check API response for errors
- Verify Firestore rules allow writes

### Issue: Progress Bar Not Updating
**Solution**:
- Check `refreshUser()` is called
- Verify `uploadsUsed` is incremented in Firestore
- Check component re-renders after data refresh

## Support

For issues:
1. Check browser console
2. Check Network tab
3. Check Firestore console
4. Review integration guides
5. Contact development team

