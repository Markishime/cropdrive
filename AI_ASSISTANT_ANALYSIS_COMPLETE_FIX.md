# 🚨 CRITICAL: AI Assistant Must Send ANALYSIS_COMPLETE Message

## Problem

The AI assistant completes analyses and shows results, but **does NOT send the `ANALYSIS_COMPLETE` message** to the parent website. This means:

- ❌ Analysis results are NOT saved to Firestore
- ❌ Upload count does NOT increment
- ❌ Results do NOT appear in history page
- ❌ Upload usage does NOT update

## Evidence

From browser console logs:
- ✅ Website is receiving messages from AI assistant
- ✅ Messages include: `SCRIPT_RUN_STATE_CHANGED`, `SET_PAGE_TITLE`, `SET_PAGE_FAVICON`
- ❌ **NO `ANALYSIS_COMPLETE` messages are being received**
- ✅ Analysis completes (`scriptRunState: 'notRunning'`)
- ❌ But no `ANALYSIS_COMPLETE` message is sent

## Required Fix

### You MUST send this message IMMEDIATELY after analysis completes:

```python
from streamlit.components.v1 import html
import json
from datetime import datetime

def send_analysis_complete(analysis_results):
    """
    CRITICAL: Call this function IMMEDIATELY after analysis completes
    """
    # Get user ID from session state (set from CONFIG message)
    user_id = st.session_state.get('user_id')
    
    if not user_id:
        st.error("❌ User ID not found. Cannot save analysis.")
        return
    
    # Prepare the message - MUST match this exact format
    message = {
        'type': 'ANALYSIS_COMPLETE',  # MUST be exactly this string
        'userId': user_id,  # From CONFIG message
        'title': analysis_results.get('title', f'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}'),
        'analysisType': analysis_results.get('type', 'soil'),  # 'soil' or 'leaf'
        'summary': analysis_results.get('summary', ''),
        'recommendationsCount': analysis_results.get('recommendations_count', 0),
        'fileUrl': analysis_results.get('file_url'),  # Optional
        'analysisData': analysis_results.get('data'),  # Optional: full analysis data
        'timestamp': datetime.now().isoformat(),
    }
    
    # CRITICAL: Use '*' as target origin to avoid browser errors
    html(f"""
    <script>
    console.log('📊 Sending ANALYSIS_COMPLETE message:', {json.dumps(message)});
    window.parent.postMessage({json.dumps(message)}, '*');
    console.log('✅ ANALYSIS_COMPLETE message sent successfully');
    </script>
    """, height=0)
    
    st.success("✅ Analysis completed! Results are being saved...")
```

## Where to Add This Code

### Add the function call in EVERY place where analysis completes:

1. **After soil analysis completes:**
```python
# After your soil analysis code runs and results are ready
results = {
    'title': 'Soil Analysis Report',
    'type': 'soil',
    'summary': 'Your analysis summary here...',
    'recommendations_count': 5,
    'data': {
        'ph': 6.5,
        'nitrogen': 2.3,
        # ... other analysis data
    }
}

# CRITICAL: Send this message
send_analysis_complete(results)
```

2. **After leaf analysis completes:**
```python
# After your leaf analysis code runs and results are ready
results = {
    'title': 'Leaf Analysis Report',
    'type': 'leaf',
    'summary': 'Your analysis summary here...',
    'recommendations_count': 3,
    'data': {
        # ... analysis data
    }
}

# CRITICAL: Send this message
send_analysis_complete(results)
```

3. **After ANY other analysis type completes**

## Message Format (CRITICAL - Must Match Exactly)

```javascript
{
  type: 'ANALYSIS_COMPLETE',  // MUST be exactly this string
  userId: 'MBjsR6QbnUfxlY7LvjpjTGJwJ1G2',  // From CONFIG message
  title: 'Analysis Report - 2025-01-15',
  analysisType: 'soil',  // or 'leaf'
  summary: 'Summary text...',
  recommendationsCount: 5,
  fileUrl: null,  // Optional: URL to uploaded file
  analysisData: {...},  // Optional: full analysis data object
  timestamp: '2025-01-15T10:30:00'
}
```

## Testing Steps

1. **Add the `send_analysis_complete()` function** to your code
2. **Call it after every analysis completes**
3. **Complete an analysis** in the AI assistant
4. **Open browser console** (F12) and look for:
   - `📊 Sending ANALYSIS_COMPLETE message:` (from AI assistant)
   - `🎯 ANALYSIS_COMPLETE DETECTED! Processing...` (from website)
   - `✅ Report saved successfully:` (from website)
5. **Check the Reports/History page** - results should appear
6. **Check Upload Usage** - should increment

## Current Status

- ✅ Website is ready to receive `ANALYSIS_COMPLETE`
- ✅ Message handler is correctly configured
- ✅ Firestore save logic is working
- ✅ Upload limit enforcement is working
- ❌ **AI Assistant is NOT sending the message**

## Why This Is Critical

Without the `ANALYSIS_COMPLETE` message:
- Users complete analyses but results are lost
- Upload counts don't increment
- Users can't see their analysis history
- Upload limits can't be enforced properly

## Example: Complete Flow

```python
# 1. User uploads file and starts analysis
uploaded_file = st.file_uploader("Upload analysis file")

if uploaded_file and st.button("Start Analysis"):
    # 2. Check upload limit BEFORE starting
    if st.session_state.get('upload_limit_exceeded', False):
        st.error("❌ Upload limit exceeded. Please upgrade.")
        st.stop()
    
    # 3. Run analysis
    with st.spinner("Analyzing..."):
        analysis_results = run_analysis(uploaded_file)
    
    # 4. Display results
    st.success("Analysis complete!")
    st.json(analysis_results)
    
    # 5. CRITICAL: Send ANALYSIS_COMPLETE message
    send_analysis_complete({
        'title': f'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}',
        'type': 'soil',  # or 'leaf'
        'summary': analysis_results.get('summary', ''),
        'recommendations_count': len(analysis_results.get('recommendations', [])),
        'data': analysis_results
    })
```

## Support

If you need help:
1. Check browser console for JavaScript errors
2. Verify `userId` is stored in `st.session_state` from CONFIG message
3. Ensure `send_analysis_complete()` is called AFTER analysis completes
4. Verify message format matches exactly

---

**This is blocking the entire analysis save functionality. Please fix ASAP.**

