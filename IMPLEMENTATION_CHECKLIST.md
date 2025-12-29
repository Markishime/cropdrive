# Website Integration Implementation Checklist

Use this checklist to verify that the website integration is working correctly according to the WEBSITE_INTEGRATION_GUIDE.md.

## ✅ Pre-Implementation Verification

### 1. Message Listener Setup
- [ ] File exists: `src/app/assistant/page.tsx`
- [ ] `useEffect` hook with message listener is present
- [ ] Listener checks for `ANALYSIS_COMPLETE` message type
- [ ] Origin validation allows ANALYSIS_COMPLETE messages from any origin
- [ ] Console logging is enabled for debugging

**Verification Code:**
```typescript
// Should be in src/app/assistant/page.tsx around line 244
useEffect(() => {
  const handleMessage = async (event: MessageEvent) => {
    if (event.data?.type === 'ANALYSIS_COMPLETE') {
      // Process message
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### 2. API Endpoint Setup
- [ ] File exists: `src/app/api/save-analysis-report/route.ts`
- [ ] POST handler is implemented
- [ ] Authentication validation is present
- [ ] Upload limit check is implemented
- [ ] Firestore save logic is present
- [ ] `uploadsUsed` increment logic is present
- [ ] Response includes `reportId`, `uploadsUsed`, `uploadsLimit`

**Verification Code:**
```typescript
// Should return this structure:
{
  success: true,
  reportId: string,
  uploadsUsed: number,
  uploadsLimit: number
}
```

### 3. Reports Page Setup
- [ ] File exists: `src/app/reports/page.tsx`
- [ ] Fetches from `analysis_results` collection
- [ ] Filters by `userId` and `status: 'completed'`
- [ ] Listens for `analysisReportSaved` event
- [ ] Auto-refreshes when event is received

**Verification Code:**
```typescript
// Should have event listener:
window.addEventListener('analysisReportSaved', handleReportSaved);
```

### 4. Progress Bar Updates
- [ ] Dashboard listens for `analysisReportSaved` event
- [ ] Payment method page listens for event
- [ ] `refreshUser()` is called after report save
- [ ] Progress bar component uses `user.uploadsUsed` and `user.uploadsLimit`

## 🧪 Testing Checklist

### Test 1: Message Reception
**Steps:**
1. Open `/assistant` page
2. Open browser DevTools (F12) → Console tab
3. Run analysis in AI Assistant
4. Check console for messages

**Expected Results:**
- [ ] See: `📨 Message received from iframe: {...}`
- [ ] See: `🎯🎯🎯 ANALYSIS_COMPLETE DETECTED!`
- [ ] See: `📊 ANALYSIS_COMPLETE message received:`

**If Failed:**
- Check AI Assistant is sending messages correctly
- Check message format matches guide
- Check origin validation isn't blocking

### Test 2: API Call
**Steps:**
1. Open browser DevTools → Network tab
2. Run analysis in AI Assistant
3. Look for POST request to `/api/save-analysis-report`

**Expected Results:**
- [ ] Request status: 200
- [ ] Response body contains:
  ```json
  {
    "success": true,
    "reportId": "...",
    "uploadsUsed": X,
    "uploadsLimit": Y
  }
  ```

**If Failed:**
- Check authentication token is valid
- Check user hasn't exceeded upload limit
- Check API endpoint is accessible
- Check server logs for errors

### Test 3: Database Save
**Steps:**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `analysis_results` collection
4. Find the newly created document

**Expected Results:**
- [ ] Document exists with correct `userId`
- [ ] `status` field is `"completed"`
- [ ] `title`, `type`, `summary` fields are present
- [ ] `createdAt` and `updatedAt` timestamps are set

**Also Check:**
- [ ] `users` collection document has incremented `uploadsUsed`
- [ ] `uploadsLimit` is set correctly

**If Failed:**
- Check Firestore security rules allow writes
- Check Admin SDK is configured
- Check user document exists

### Test 4: UI Updates
**Steps:**
1. After analysis completes, check `/reports` page
2. Check progress bar/upload count display
3. Check dashboard stats

**Expected Results:**
- [ ] New report appears in `/reports` page
- [ ] Progress bar shows updated upload count
- [ ] Dashboard shows updated stats
- [ ] Upload count increased by 1

**If Failed:**
- Check `analysisReportSaved` event is dispatched
- Check event listeners are set up
- Check `refreshUser()` is called
- Check component re-renders after data update

## 🔍 Debugging Steps

### Issue: Messages Not Received

1. **Check Console:**
   ```javascript
   // In browser console
   window.addEventListener('message', (e) => {
     console.log('All messages:', e.data, e.origin);
   });
   ```

2. **Check AI Assistant:**
   - Verify it's sending `postMessage` correctly
   - Check message format matches guide
   - Verify `type: 'ANALYSIS_COMPLETE'` is present

3. **Check Origin:**
   - ANALYSIS_COMPLETE messages should be accepted from any origin
   - Check console for origin validation errors

### Issue: Reports Not Saving

1. **Check Network Tab:**
   - Look for `/api/save-analysis-report` request
   - Check request payload
   - Check response status and body

2. **Check Authentication:**
   ```javascript
   // In browser console
   import { auth } from '@/lib/firebase';
   console.log('Current user:', auth.currentUser);
   ```

3. **Check Upload Limits:**
   - Verify user hasn't exceeded limit
   - Check `users` collection for `uploadsUsed` and `uploadsLimit`

4. **Check Firestore Rules:**
   - Ensure write permissions are set
   - Check if Admin SDK is needed

### Issue: Progress Bar Not Updating

1. **Check Event Dispatch:**
   ```javascript
   // In browser console
   window.addEventListener('analysisReportSaved', (e) => {
     console.log('Event received:', e.detail);
   });
   ```

2. **Check User Data:**
   ```javascript
   // Check if refreshUser is available
   // Check if user data is updated in Firestore
   ```

3. **Check Component:**
   - Verify progress bar uses `user.uploadsUsed` and `user.uploadsLimit`
   - Check if component re-renders after data update

## 📋 Code Verification Checklist

### Message Handler (`src/app/assistant/page.tsx`)
- [ ] Line ~244: `useEffect` with message listener
- [ ] Line ~261: `isAnalysisComplete` check
- [ ] Line ~318: Origin validation allows ANALYSIS_COMPLETE
- [ ] Line ~352: Handles `ANALYSIS_COMPLETE` message
- [ ] Line ~391: Calls `/api/save-analysis-report`
- [ ] Line ~439: Calls `refreshUser()`
- [ ] Line ~474: Dispatches `analysisReportSaved` event

### API Endpoint (`src/app/api/save-analysis-report/route.ts`)
- [ ] Line ~30: POST handler function
- [ ] Line ~44: Validates required fields
- [ ] Line ~52: Checks authentication
- [ ] Line ~82: Checks upload limits
- [ ] Line ~130: Saves to `analysis_results` collection
- [ ] Line ~141: Increments `uploadsUsed`
- [ ] Line ~157: Returns success response with counts

### Reports Page (`src/app/reports/page.tsx`)
- [ ] Line ~53: `fetchReports` function
- [ ] Line ~59: Queries `analysis_results` collection
- [ ] Line ~248: Listens for `analysisReportSaved` event
- [ ] Line ~269: Refreshes reports after event

### Dashboard (`src/app/dashboard/page.tsx`)
- [ ] Line ~105: Listens for `analysisReportSaved` event
- [ ] Line ~128: Calls `refreshUser()` on event
- [ ] Line ~154: Uses `user.uploadsUsed` and `user.uploadsLimit`

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Firestore indexes are created
- [ ] Firestore security rules are configured
- [ ] Environment variables are set
- [ ] Admin SDK credentials are configured
- [ ] Error handling is in place
- [ ] Logging is configured
- [ ] Monitoring is set up

## 📝 Notes

- Keep browser console open during testing
- Check Network tab for API calls
- Monitor Firestore console for data changes
- Use the debugging commands from the guide
- Refer to WEBSITE_INTEGRATION_GUIDE.md for detailed explanations

## ✅ Completion

Once all items are checked:
- [ ] Integration is verified and working
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Team is notified

---

**Last Updated:** Based on WEBSITE_INTEGRATION_GUIDE.md
**Version:** 1.0

