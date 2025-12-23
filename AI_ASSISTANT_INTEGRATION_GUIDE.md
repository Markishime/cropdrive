# AI Assistant Integration Guide

This guide explains how to integrate your AI Assistant (hosted at https://markishime-ags.hf.space/) with the CropDrive application to ensure analysis results are stored in Firestore and upload limits are enforced.

## Overview

The CropDrive application communicates with your AI Assistant via:
1. **PostMessage API** - For bidirectional communication between parent page and iframe
2. **URL Parameters** - For initial configuration
3. **Firestore** - For storing analysis results

## What the Parent Page Sends to Your AI Assistant

### 1. CONFIG Message (PostMessage)

When the iframe loads or user data changes, the parent page sends a `CONFIG` message:

```javascript
{
  type: 'CONFIG',
  language: 'en' | 'ms',
  userId: 'firebase-user-id',
  userEmail: 'user@example.com',
  userName: 'User Display Name',
  plan: 'start' | 'smart' | 'precision' | 'none',
  uploadsUsed: 0,        // Number of analyses already used
  uploadsLimit: 2,        // Maximum analyses allowed (Start plan = 2, Smart = 5, Precision = 10)
  uploadLimitExceeded: false,  // true if user has reached their limit
  uploadsRemaining: 2     // Remaining analyses (0 if limit exceeded, Infinity if unlimited)
}
```

**When CONFIG is sent:**
- When iframe loads
- When user logs in
- After an analysis is saved (to update counts)
- When language changes

### 2. URL Parameters

The iframe URL includes these parameters:
- `lang=en` or `lang=ms` - Current language
- `userId=firebase-user-id` - Current user ID

## What Your AI Assistant Should Do

### Step 1: Listen for CONFIG Messages

```python
import streamlit as st
from streamlit.components.v1 import html

# Listen for postMessage from parent
st.markdown("""
<script>
window.addEventListener('message', function(event) {
    // Verify origin (optional but recommended)
    if (event.origin !== 'https://your-cropdrive-domain.com') {
        return;
    }
    
    const data = event.data;
    
    if (data.type === 'CONFIG') {
        // Store config in session state
        window.parent.postMessage({
            type: 'CONFIG_RECEIVED',
            userId: data.userId
        }, event.origin);
        
        // Store in Streamlit session state
        st.session_state.user_id = data.userId;
        st.session_state.user_email = data.userEmail;
        st.session_state.uploads_used = data.uploadsUsed;
        st.session_state.uploads_limit = data.uploadsLimit;
        st.session_state.upload_limit_exceeded = data.uploadLimitExceeded;
        st.session_state.uploads_remaining = data.uploadsRemaining;
        st.session_state.plan = data.plan;
        
        // Rerun to update UI
        st.rerun();
    }
});
</script>
""", unsafe_allow_html=True)
```

### Step 2: Check Upload Limit Before Starting Analysis

**IMPORTANT:** You must check the upload limit BEFORE allowing the user to start an analysis.

```python
# In your analysis start function
def can_start_analysis():
    if st.session_state.get('upload_limit_exceeded', False):
        return False
    
    uploads_remaining = st.session_state.get('uploads_remaining', 0)
    if uploads_remaining <= 0 and uploads_remaining != float('inf'):
        return False
    
    return True

# Before starting analysis
if not can_start_analysis():
    st.error("❌ You have reached your analysis limit. Please upgrade your plan.")
    st.info("💡 Upgrade your plan to continue analyzing lab reports.")
    st.stop()  # Stop execution
```

### Step 3: Send Analysis Results Back to Parent

After completing an analysis, send the results to the parent page:

```python
import json
from datetime import datetime

def send_analysis_results(analysis_data):
    """
    Send analysis results to parent page via postMessage
    
    Args:
        analysis_data: Dictionary containing analysis results
    """
    results = {
        'type': 'ANALYSIS_COMPLETE',
        'userId': st.session_state.get('user_id'),
        'title': analysis_data.get('title', f'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}'),
        'analysisType': analysis_data.get('type', 'soil'),  # 'soil' or 'leaf'
        'summary': analysis_data.get('summary', ''),
        'recommendationsCount': analysis_data.get('recommendations_count', 0),
        'fileUrl': analysis_data.get('file_url'),  # Optional: URL to uploaded file
        'analysisData': analysis_data.get('data'),  # Full analysis data object
        'timestamp': datetime.now().isoformat(),
    }
    
    # Send to parent window
    html(f"""
    <script>
    window.parent.postMessage({json.dumps(results)}, '*');
    </script>
    """, height=0)
    
    st.success("✅ Analysis completed! Results are being saved...")
```

### Step 4: Expected Analysis Data Format

The parent page expects this format:

```javascript
{
  type: 'ANALYSIS_COMPLETE',
  userId: 'firebase-user-id',  // Must match current user
  title: 'Analysis Report - 2025-01-15',  // Report title
  analysisType: 'soil' | 'leaf',  // Type of analysis
  summary: 'Summary of analysis results...',  // Brief summary
  recommendationsCount: 5,  // Number of recommendations
  fileUrl: 'https://...',  // Optional: URL to uploaded file/image
  analysisData: {  // Optional: Full analysis data
    ph: 6.5,
    nitrogen: 2.3,
    phosphorus: 1.8,
    potassium: 2.1,
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    // ... any other analysis data
  },
  timestamp: '2025-01-15T10:30:00'  // ISO timestamp
}
```

## Upload Limits by Plan

- **Start Plan**: 2 analyses
- **Smart Plan**: 5 analyses  
- **Precision Plan**: 10 analyses
- **Unlimited**: -1 (no limit)

## Complete Example Flow

```python
import streamlit as st
from streamlit.components.v1 import html
import json
from datetime import datetime

# Initialize session state
if 'user_id' not in st.session_state:
    st.session_state.user_id = None
    st.session_state.upload_limit_exceeded = False
    st.session_state.uploads_remaining = 0

# Listen for CONFIG messages
st.markdown("""
<script>
window.addEventListener('message', function(event) {
    const data = event.data;
    if (data.type === 'CONFIG') {
        // Store in session state
        window.streamlitSessionState = {
            userId: data.userId,
            uploadLimitExceeded: data.uploadLimitExceeded,
            uploadsRemaining: data.uploadsRemaining,
            uploadsUsed: data.uploadsUsed,
            uploadsLimit: data.uploadsLimit,
            plan: data.plan
        };
        // Trigger Streamlit rerun
        window.parent.postMessage({type: 'STREAMLIT_RERUN'}, '*');
    }
});
</script>
""", unsafe_allow_html=True)

# Check if config received
if st.session_state.get('user_id'):
    st.info(f"👤 User: {st.session_state.user_id}")
    st.info(f"📊 Used: {st.session_state.get('uploads_used', 0)}/{st.session_state.get('uploads_limit', 0)}")
    
    # Check limit before allowing analysis
    if st.session_state.get('upload_limit_exceeded', False):
        st.error("❌ You have reached your analysis limit!")
        st.info("💡 Please upgrade your plan to continue.")
        st.stop()
    
    # Your analysis UI here
    if st.button("Start Analysis"):
        # Perform analysis
        analysis_results = {
            'title': f'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}',
            'type': 'soil',
            'summary': 'Your analysis summary here...',
            'recommendations_count': 5,
            'data': {
                'ph': 6.5,
                'nitrogen': 2.3,
                # ... other data
            }
        }
        
        # Send results to parent
        send_analysis_results(analysis_results)
else:
    st.info("⏳ Waiting for user configuration...")
```

## Testing Checklist

- [ ] AI Assistant receives CONFIG message with user data
- [ ] AI Assistant blocks analysis when `uploadLimitExceeded` is true
- [ ] AI Assistant blocks analysis when `uploadsRemaining` is 0
- [ ] AI Assistant sends ANALYSIS_COMPLETE message with correct format
- [ ] Analysis results appear in CropDrive Reports/History page
- [ ] Upload count increments after analysis (check dashboard)
- [ ] User cannot start new analysis after reaching limit
- [ ] CONFIG updates after each analysis (shows new counts)

## Troubleshooting

### Analysis results not appearing in history
- Verify `ANALYSIS_COMPLETE` message includes `userId` matching current user
- Check browser console for errors
- Verify message format matches expected structure

### Upload limit not enforced
- Ensure `uploadLimitExceeded` is checked BEFORE starting analysis
- Verify CONFIG message is received and stored in session state
- Check that limit check happens before any analysis processing

### Upload count not updating
- Verify `ANALYSIS_COMPLETE` message is sent correctly
- Check that parent page receives the message (check browser console)
- Verify API endpoint `/api/save-analysis-report` is working

## Security Notes

1. **Always verify userId**: The parent page verifies that `userId` in `ANALYSIS_COMPLETE` matches the authenticated user
2. **Origin verification**: Consider verifying message origin in your AI Assistant
3. **Rate limiting**: The parent page checks limits server-side before saving

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify postMessage communication is working
3. Check Firestore security rules allow writes to `analysis_results` collection
4. Verify user has proper authentication token

