# AI Assistant Integration Guide

This guide explains how to connect your AI Assistant (Streamlit/Gradio) with the CropDrive website so that analysis results appear in the website's analysis history page and upload limits are properly tracked.

## Overview

The AI Assistant runs in an iframe on the CropDrive website (`/assistant` page). When analysis is complete, the AI Assistant must send a message to the parent window (the website) using the `postMessage` API.

## Message Format

When analysis is complete, the AI Assistant MUST send a message with the following format:

```javascript
window.parent.postMessage({
  type: 'ANALYSIS_COMPLETE',
  title: 'Analysis Report - [Date]',  // Required: Report title
  analysisType: 'soil',  // Required: 'soil' or 'leaf'
  summary: 'Brief summary of the analysis...',  // Required: Summary text
  recommendationsCount: 5,  // Required: Number of recommendations
  fileUrl: 'https://...',  // Optional: URL to the uploaded file
  analysisData: {  // Optional: Full analysis data object
    // Your analysis results here
  }
}, '*');  // Use '*' as target origin, or the website's origin
```

### Required Fields

1. **`type`**: Must be exactly `'ANALYSIS_COMPLETE'`
2. **`title`**: String - The report title (e.g., "Soil Analysis - 2024-01-15")
3. **`analysisType`**: String - Either `'soil'` or `'leaf'`
4. **`summary`**: String - Brief summary of the analysis
5. **`recommendationsCount`**: Number - Number of recommendations generated

### Optional Fields

- **`fileUrl`**: String - URL to the uploaded file (if available)
- **`analysisData`**: Object - Full analysis data (can contain any structure)

## Implementation Examples

### Python (Streamlit)

```python
import streamlit as st
import json

# After analysis is complete
analysis_result = {
    "type": "ANALYSIS_COMPLETE",
    "title": f"Analysis Report - {datetime.now().strftime('%Y-%m-%d')}",
    "analysisType": "soil",  # or "leaf"
    "summary": "Your analysis summary here...",
    "recommendationsCount": 5,
    "fileUrl": uploaded_file_url if uploaded_file_url else None,
    "analysisData": {
        # Your full analysis data
        "ph": 6.5,
        "nitrogen": 2.3,
        # ... other fields
    }
}

# Send message to parent window
st.components.v1.html(f"""
<script>
    window.parent.postMessage({json.dumps(analysis_result)}, '*');
    console.log('Analysis complete message sent:', {json.dumps(analysis_result)});
</script>
""", height=0)
```

### JavaScript (Gradio/React)

```javascript
// After analysis is complete
const analysisResult = {
  type: 'ANALYSIS_COMPLETE',
  title: `Analysis Report - ${new Date().toISOString().split('T')[0]}`,
  analysisType: 'soil', // or 'leaf'
  summary: 'Your analysis summary here...',
  recommendationsCount: 5,
  fileUrl: uploadedFileUrl || null,
  analysisData: {
    // Your full analysis data
    ph: 6.5,
    nitrogen: 2.3,
    // ... other fields
  }
};

// Send message to parent window
if (window.parent && window.parent !== window) {
  window.parent.postMessage(analysisResult, '*');
  console.log('Analysis complete message sent:', analysisResult);
} else {
  console.error('Cannot send message: not in iframe');
}
```

### Python (Gradio with JavaScript)

```python
import gradio as gr

def analyze_report(file):
    # Your analysis logic here
    result = perform_analysis(file)
    
    # After analysis is complete, send message
    js_code = f"""
    <script>
        window.parent.postMessage({{
            type: 'ANALYSIS_COMPLETE',
            title: 'Analysis Report - {datetime.now().strftime("%Y-%m-%d")}',
            analysisType: '{result["type"]}',
            summary: '{result["summary"]}',
            recommendationsCount: {result["recommendations_count"]},
            fileUrl: '{result.get("file_url", "")}',
            analysisData: {json.dumps(result)}
        }}, '*');
    </script>
    """
    
    return gr.HTML(js_code)

# In your Gradio interface
interface = gr.Interface(
    fn=analyze_report,
    inputs=gr.File(),
    outputs=gr.HTML()
)
```

## When to Send the Message

Send the `ANALYSIS_COMPLETE` message **immediately after**:
1. Analysis processing is complete
2. All recommendations are generated
3. Results are ready to display

**DO NOT** send the message:
- Before analysis starts
- While analysis is in progress
- If analysis fails (send an error message instead)

## Error Handling

If analysis fails, you can optionally send an error message:

```javascript
window.parent.postMessage({
  type: 'ANALYSIS_ERROR',
  error: 'Error message here',
  details: 'Additional error details'
}, '*');
```

## Testing

To test if your messages are being received:

1. Open the CropDrive website in your browser
2. Navigate to `/assistant` page
3. Open browser DevTools (F12)
4. Go to Console tab
5. Upload a file and run analysis
6. Check the console for:
   - `📨 Message received from iframe:` - Message was received
   - `🎯🎯🎯 ANALYSIS_COMPLETE DETECTED!` - Message was recognized
   - `✅ Report saved successfully:` - Report was saved to database

## Troubleshooting

### Message Not Received

1. **Check if you're in an iframe**: 
   ```javascript
   console.log('Is in iframe:', window.parent !== window);
   ```

2. **Check message format**:
   - Ensure `type` is exactly `'ANALYSIS_COMPLETE'`
   - All required fields are present
   - Data types are correct (string, number, etc.)

3. **Check browser console**:
   - Look for errors in the parent window console
   - Check if origin validation is blocking messages

### Report Not Appearing in History

1. **Check Firestore**:
   - Go to Firebase Console
   - Check `analysis_results` collection
   - Verify document was created with correct `userId` and `status: 'completed'`

2. **Check user authentication**:
   - Ensure user is logged in on the website
   - Verify `userId` in message matches authenticated user

3. **Check upload limits**:
   - Verify user hasn't exceeded their upload limit
   - Check `users` collection for `uploadsUsed` and `uploadsLimit`

### Upload Limit Not Updating

1. **Check API response**:
   - Look for `uploadsUsed` and `uploadsLimit` in API response
   - Verify they're being returned correctly

2. **Check user document**:
   - Verify `uploadsUsed` is being incremented in Firestore
   - Check if `uploadsLimit` is set correctly for user's plan

## Security Notes

1. **Origin Validation**: The website validates message origins for security. Using `'*'` as target origin works but is less secure. For production, use the website's origin:
   ```javascript
   window.parent.postMessage(data, 'https://cropdrive.ai');
   ```

2. **User ID**: The website automatically uses the authenticated user's ID. You don't need to (and shouldn't) send `userId` in the message.

3. **Data Validation**: The website validates all data before saving. Ensure your data types match the expected format.

## Complete Example (Streamlit)

```python
import streamlit as st
import json
from datetime import datetime

def perform_analysis(uploaded_file):
    # Your analysis logic here
    # ...
    
    return {
        "type": "soil",
        "summary": "Soil analysis shows optimal pH levels...",
        "recommendations": [
            "Add nitrogen fertilizer",
            "Increase watering frequency",
            # ... more recommendations
        ],
        "data": {
            "ph": 6.5,
            "nitrogen": 2.3,
            # ... other metrics
        }
    }

# Main Streamlit app
st.title("CropDrive AI Assistant")

uploaded_file = st.file_uploader("Upload your report", type=['pdf', 'jpg', 'png'])

if uploaded_file and st.button("Analyze"):
    with st.spinner("Analyzing..."):
        result = perform_analysis(uploaded_file)
        
        # Display results
        st.success("Analysis complete!")
        st.write("Summary:", result["summary"])
        st.write("Recommendations:", len(result["recommendations"]))
        
        # Send message to parent window
        message = {
            "type": "ANALYSIS_COMPLETE",
            "title": f"Analysis Report - {datetime.now().strftime('%Y-%m-%d')}",
            "analysisType": result["type"],
            "summary": result["summary"],
            "recommendationsCount": len(result["recommendations"]),
            "fileUrl": None,  # Add if you have file URL
            "analysisData": result["data"]
        }
        
        st.components.v1.html(f"""
        <script>
            if (window.parent && window.parent !== window) {{
                window.parent.postMessage({json.dumps(message)}, '*');
                console.log('✅ Analysis complete message sent to parent');
            }} else {{
                console.error('❌ Not in iframe, cannot send message');
            }}
        </script>
        """, height=0)
```

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify message format matches this guide exactly
3. Test with a simple message first
4. Contact the development team with console logs

