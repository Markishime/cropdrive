# AI Assistant Debugging Guide - ANALYSIS_COMPLETE Message

## Current Issue

The AI assistant is completing analyses but **NOT successfully sending** the `ANALYSIS_COMPLETE` message. Console shows:
```
⚠️ Sending minimal ANALYSIS_COMPLETE message due to error
```

This indicates the AI assistant is **trying** to send the message but encountering an error.

## Common Causes & Solutions

### 1. Missing User ID in Session State

**Problem**: `st.session_state.get('user_id')` returns `None`

**Solution**: Ensure you're storing the user ID from CONFIG messages:

```python
# Listen for CONFIG messages FIRST
st.markdown("""
<script>
window.addEventListener('message', function(event) {
    const data = event.data;
    if (data.type === 'CONFIG') {
        // Store user ID immediately
        window.userId = data.userId;
        // Also send to Streamlit
        window.parent.postMessage({
            type: 'CONFIG_RECEIVED',
            userId: data.userId
        }, '*');
    }
});
</script>
""", unsafe_allow_html=True)

# In your analysis completion code:
user_id = st.session_state.get('user_id') or getattr(window, 'userId', None)
if not user_id:
    st.error("❌ User ID not found. Cannot save analysis.")
    return
```

### 2. JavaScript Error in postMessage

**Problem**: JavaScript error when calling `window.parent.postMessage()`

**Solution**: Wrap in try-catch and use correct format:

```python
def send_analysis_complete(analysis_results):
    user_id = st.session_state.get('user_id')
    
    if not user_id:
        st.error("❌ User ID not found")
        return
    
    message = {
        'type': 'ANALYSIS_COMPLETE',
        'userId': user_id,
        'title': analysis_results.get('title', f'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}'),
        'analysisType': analysis_results.get('type', 'soil'),
        'summary': analysis_results.get('summary', ''),
        'recommendationsCount': analysis_results.get('recommendations_count', 0),
        'fileUrl': analysis_results.get('file_url'),
        'analysisData': analysis_results.get('data'),
        'timestamp': datetime.now().isoformat(),
    }
    
    # Use try-catch in JavaScript
    html(f"""
    <script>
    try {{
        console.log('📊 Attempting to send ANALYSIS_COMPLETE:', {json.dumps(message)});
        window.parent.postMessage({json.dumps(message)}, '*');
        console.log('✅ ANALYSIS_COMPLETE sent successfully');
    }} catch (error) {{
        console.error('❌ Error sending ANALYSIS_COMPLETE:', error);
        // Fallback: try with minimal data
        try {{
            window.parent.postMessage({{
                type: 'ANALYSIS_COMPLETE',
                userId: '{user_id}',
                title: '{message.get("title", "Analysis Report")}',
                analysisType: '{message.get("analysisType", "soil")}',
                summary: '{message.get("summary", "")}',
                recommendationsCount: {message.get("recommendationsCount", 0)},
                timestamp: '{message.get("timestamp", "")}'
            }}, '*');
            console.log('✅ Minimal ANALYSIS_COMPLETE sent');
        }} catch (fallbackError) {{
            console.error('❌ Fallback also failed:', fallbackError);
        }}
    }}
    </script>
    """, height=0)
```

### 3. Streamlit Component Height Issue

**Problem**: `html()` component with `height=0` might not execute

**Solution**: Use `height=1` or ensure component renders:

```python
html(f"""
<script>
(function() {{
    try {{
        const message = {json.dumps(message)};
        console.log('📊 Sending ANALYSIS_COMPLETE:', message);
        window.parent.postMessage(message, '*');
        console.log('✅ Sent successfully');
    }} catch (error) {{
        console.error('❌ Error:', error);
    }}
}})();
</script>
""", height=1)  # Use height=1 instead of 0
```

### 4. Timing Issue - Sending Before Results Ready

**Problem**: Sending message before analysis results are fully ready

**Solution**: Ensure message is sent AFTER all results are displayed:

```python
# ✅ CORRECT ORDER:
# 1. Run analysis
results = run_analysis(uploaded_file)

# 2. Display results
st.success("Analysis complete!")
st.json(results)
st.write("## Recommendations")
for rec in results.get('recommendations', []):
    st.write(f"- {rec}")

# 3. THEN send ANALYSIS_COMPLETE
send_analysis_complete({
    'title': f'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}',
    'type': 'soil',
    'summary': results.get('summary', ''),
    'recommendations_count': len(results.get('recommendations', [])),
    'data': results
})
```

### 5. JSON Serialization Error

**Problem**: Complex objects in `analysisData` can't be serialized to JSON

**Solution**: Ensure all data is JSON-serializable:

```python
import json
from datetime import datetime

def make_json_serializable(obj):
    """Convert objects to JSON-serializable format"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    elif hasattr(obj, '__dict__'):
        return make_json_serializable(obj.__dict__)
    else:
        return obj

# Before sending:
message['analysisData'] = make_json_serializable(analysis_results.get('data'))
```

## Testing Checklist

After implementing the fix:

1. ✅ **Open browser console** (F12)
2. ✅ **Complete an analysis**
3. ✅ **Look for these logs**:
   - `📊 Attempting to send ANALYSIS_COMPLETE:` (from AI assistant)
   - `✅ ANALYSIS_COMPLETE sent successfully` (from AI assistant)
   - `🎯🎯🎯 ANALYSIS_COMPLETE DETECTED!` (from website)
   - `✅ Report saved successfully:` (from website)
4. ✅ **Check for errors**:
   - Any `❌ Error` messages?
   - Any `⚠️` warnings?
5. ✅ **Verify results**:
   - Check Reports/History page - results should appear
   - Check Upload Usage - should increment
   - Check Dashboard - usage bar should update

## Debugging Steps

1. **Check if user_id is stored**:
   ```python
   st.write("Debug - User ID:", st.session_state.get('user_id'))
   ```

2. **Test postMessage directly**:
   ```python
   html("""
   <script>
   console.log('Testing postMessage...');
   window.parent.postMessage({
       type: 'ANALYSIS_COMPLETE',
       userId: 'TEST_USER_ID',
       title: 'Test Report',
       analysisType: 'soil',
       summary: 'Test summary',
       recommendationsCount: 0,
       timestamp: new Date().toISOString()
   }, '*');
   console.log('Test message sent');
   </script>
   """, height=1)
   ```

3. **Check browser console** for:
   - JavaScript errors
   - Network errors
   - CORS errors
   - Origin mismatch errors

## Expected Message Format

```javascript
{
  type: 'ANALYSIS_COMPLETE',  // MUST be exactly this
  userId: 'MBjsR6QbnUfxlY7LvjpjTGJwJ1G2',  // From CONFIG message
  title: 'Analysis Report - 2025-01-15',
  analysisType: 'soil',  // or 'leaf'
  summary: 'Summary text...',
  recommendationsCount: 5,
  fileUrl: null,  // Optional
  analysisData: {...},  // Optional: must be JSON-serializable
  timestamp: '2025-01-15T10:30:00'  // ISO format
}
```

## Quick Fix Template

Copy this complete function into your AI assistant:

```python
from streamlit.components.v1 import html
import json
from datetime import datetime

def send_analysis_complete(analysis_results):
    """Send ANALYSIS_COMPLETE message to parent website"""
    try:
        # Get user ID
        user_id = st.session_state.get('user_id')
        if not user_id:
            st.error("❌ User ID not found. Cannot save analysis.")
            return False
        
        # Prepare message
        message = {
            'type': 'ANALYSIS_COMPLETE',
            'userId': str(user_id),  # Ensure it's a string
            'title': analysis_results.get('title', f'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}'),
            'analysisType': str(analysis_results.get('type', 'soil')),
            'summary': str(analysis_results.get('summary', '')),
            'recommendationsCount': int(analysis_results.get('recommendations_count', 0)),
            'fileUrl': analysis_results.get('file_url'),
            'analysisData': analysis_results.get('data'),
            'timestamp': datetime.now().isoformat(),
        }
        
        # Send via postMessage
        html(f"""
        <script>
        (function() {{
            try {{
                const message = {json.dumps(message)};
                console.log('📊 Sending ANALYSIS_COMPLETE:', message);
                window.parent.postMessage(message, '*');
                console.log('✅ ANALYSIS_COMPLETE sent successfully');
            }} catch (error) {{
                console.error('❌ Error sending ANALYSIS_COMPLETE:', error);
                alert('Error sending analysis results: ' + error.message);
            }}
        }})();
        </script>
        """, height=1)
        
        return True
    except Exception as e:
        st.error(f"❌ Error preparing ANALYSIS_COMPLETE: {str(e)}")
        return False

# Usage:
# After analysis completes:
send_analysis_complete({
    'title': 'Soil Analysis Report',
    'type': 'soil',
    'summary': 'Your summary here',
    'recommendations_count': 5,
    'data': {...}  # Your analysis data
})
```

---

**The error "Sending minimal ANALYSIS_COMPLETE message due to error" suggests the AI assistant is trying but failing. Use the debugging steps above to identify the exact error.**

