# Critical Fix Required: ANALYSIS_COMPLETE Message Not Reaching Parent Window

## Problem
The AI assistant is successfully sending the `ANALYSIS_COMPLETE` message (confirmed by console logs), but the parent window (`https://www.cropdrive.ai`) is **NOT receiving it**. Only `SCRIPT_RUN_STATE_CHANGED` messages are being received.

## Root Cause
The `ANALYSIS_COMPLETE` message is being sent but not reaching the parent window. This is likely due to:
1. **Incorrect target origin**: The message might be sent with a specific origin that doesn't match
2. **Timing issue**: The message might be sent before the parent's listener is ready
3. **Message format**: The message structure might not match what the parent expects

## Required Fix in AI Assistant

### Current Behavior (from console logs):
```
📊 Sending ANALYSIS_COMPLETE message: {
  type: "ANALYSIS_COMPLETE",
  userId: "MBjsR6QbnUfxlY7LvjpjTGJwJ1G2",
  title: "Analysis Report - 2025-12-23",
  analysisType: "both",
  summary: "...",
  ...
}
✅ ANALYSIS_COMPLETE message sent successfully
```

### Required Fix:

**1. Ensure message is sent to `window.parent`:**
```python
# In your Python/Gradio code, when analysis completes:
import json

def send_analysis_complete(results):
    """Send ANALYSIS_COMPLETE message to parent window"""
    message = {
        "type": "ANALYSIS_COMPLETE",
        "userId": session_state.get("userId"),  # From CONFIG message
        "title": f"Analysis Report - {datetime.now().strftime('%Y-%m-%d')}",
        "analysisType": results.get("analysisType", "both"),  # "soil", "leaf", or "both"
        "summary": results.get("summary", ""),
        "recommendationsCount": results.get("recommendationsCount", 0),
        "fileUrl": results.get("fileUrl", None),
        "analysisData": results.get("analysisData", None),
        "timestamp": datetime.now().isoformat()
    }
    
    # CRITICAL: Use '*' as target origin to ensure message reaches parent
    js_code = f"""
    <script>
        console.log('📊 Sending ANALYSIS_COMPLETE message:', {json.dumps(message)});
        try {{
            // Send to parent window with '*' origin (most reliable)
            window.parent.postMessage({json.dumps(message)}, '*');
            console.log('✅ ANALYSIS_COMPLETE message sent successfully');
        }} catch (error) {{
            console.error('❌ Error sending ANALYSIS_COMPLETE:', error);
            // Fallback: Try with specific origin
            try {{
                window.parent.postMessage({json.dumps(message)}, 'https://www.cropdrive.ai');
                console.log('✅ ANALYSIS_COMPLETE sent with specific origin');
            }} catch (e2) {{
                console.error('❌ Failed with specific origin too:', e2);
            }}
        }}
    </script>
    """
    return js_code
```

**2. Send message IMMEDIATELY after analysis completes:**
```python
# When analysis finishes:
if analysis_complete:
    # Send ANALYSIS_COMPLETE immediately
    gr.HTML(send_analysis_complete(analysis_results))
    
    # Also store in sessionStorage as backup
    backup_js = f"""
    <script>
        try {{
            sessionStorage.setItem('analysis_results', {json.dumps(message)});
            console.log('✅ Stored analysis results in sessionStorage');
        }} catch (e) {{
            console.error('❌ Error storing in sessionStorage:', e);
        }}
    </script>
    """
```

**3. Verify userId is available:**
```python
# Make sure userId is stored when CONFIG message is received:
def handle_config_message(config_data):
    """Handle CONFIG message from parent"""
    session_state["userId"] = config_data.get("userId")
    session_state["userEmail"] = config_data.get("userEmail")
    session_state["userName"] = config_data.get("userName")
    # ... store other config data
```

## Testing Checklist

After implementing the fix:

1. ✅ Check browser console for: `📊 Sending ANALYSIS_COMPLETE message:`
2. ✅ Check browser console for: `✅ ANALYSIS_COMPLETE message sent successfully`
3. ✅ Check parent window console for: `🎯🎯🎯 ANALYSIS_COMPLETE DETECTED!`
4. ✅ Check parent window console for: `📊 ANALYSIS_COMPLETE message received:`
5. ✅ Verify analysis appears in history page
6. ✅ Verify upload usage updates (e.g., 0/2 → 1/2)

## Debugging Steps

If the message still doesn't reach the parent:

1. **Check browser console** for any postMessage errors
2. **Verify origin**: Check if `window.parent` exists and is accessible
3. **Test with '*' origin**: Use `window.parent.postMessage(data, '*')` first
4. **Add delay**: Wait 100-200ms after analysis completes before sending
5. **Check message format**: Ensure message is a plain object, not nested

## Expected Message Format

The parent window expects this exact format:
```javascript
{
  type: "ANALYSIS_COMPLETE",
  userId: "string",           // Required: From CONFIG message
  title: "string",            // Required
  analysisType: "soil" | "leaf" | "both",  // Required
  summary: "string",          // Optional but recommended
  recommendationsCount: number,  // Optional
  fileUrl: "string" | null,   // Optional
  analysisData: object | null,  // Optional
  timestamp: "ISO string"      // Optional
}
```

## Critical Notes

- **ALWAYS use `'*'` as target origin** for `postMessage` - this ensures the message reaches the parent regardless of origin
- **Send message IMMEDIATELY** after analysis completes - don't delay
- **Include userId** from the CONFIG message - this is critical for saving the report
- **Store in sessionStorage** as backup - the website can read this if postMessage fails

