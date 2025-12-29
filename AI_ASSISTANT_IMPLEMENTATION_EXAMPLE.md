# AI Assistant Implementation Example

This is a complete, ready-to-use example showing exactly how to implement the integration in your AI Assistant (Streamlit/Gradio).

## Complete Streamlit Example

```python
import streamlit as st
import json
from datetime import datetime

# Your analysis function
def perform_analysis(uploaded_file):
    # Your analysis logic here
    # ...
    
    return {
        "type": "soil",  # or "leaf"
        "summary": "Soil analysis shows optimal pH levels with moderate nitrogen content. Recommendations include adding nitrogen fertilizer and increasing watering frequency.",
        "recommendations": [
            "Add nitrogen fertilizer (recommended: 2.5 kg per hectare)",
            "Increase watering frequency to maintain optimal moisture",
            "Monitor pH levels monthly",
            "Consider adding organic matter to improve soil structure",
            "Test soil again in 3 months to track improvements"
        ],
        "data": {
            "ph": 6.5,
            "nitrogen": 2.3,
            "phosphorus": 1.8,
            "potassium": 2.1,
        }
    }

# Main Streamlit app
st.title("CropDrive AI Assistant")

uploaded_file = st.file_uploader("Upload your lab report", type=['pdf', 'jpg', 'png', 'xlsx', 'xls'])

if uploaded_file and st.button("Analyze Report"):
    with st.spinner("Analyzing your report... This may take 5-8 minutes."):
        # Perform analysis
        result = perform_analysis(uploaded_file)
        
        # Display results to user
        st.success("✅ Analysis complete!")
        st.write("**Summary:**", result["summary"])
        st.write(f"**Recommendations:** {len(result['recommendations'])} recommendations generated")
        
        # CRITICAL: Send message to parent window (CropDrive website)
        message = {
            "type": "ANALYSIS_COMPLETE",  # MUST be exactly this
            "title": f"Analysis Report - {datetime.now().strftime('%Y-%m-%d')}",
            "analysisType": result["type"],  # 'soil' or 'leaf'
            "summary": result["summary"],
            "recommendationsCount": len(result["recommendations"]),
            "fileUrl": None,  # Add if you have file URL
            "analysisData": result["data"]  # Full analysis data
        }
        
        # Send message using HTML component
        st.components.v1.html(f"""
        <script>
            // Check if we're in an iframe
            if (window.parent && window.parent !== window) {{
                // Send message to parent window
                window.parent.postMessage({json.dumps(message)}, '*');
                console.log('✅ ANALYSIS_COMPLETE message sent to CropDrive website:', {json.dumps(message)});
            }} else {{
                console.error('❌ Not in iframe - cannot send message to parent');
                console.log('Message that would be sent:', {json.dumps(message)});
            }}
        </script>
        """, height=0)
        
        st.info("💡 Analysis results have been saved to your CropDrive account. Check your Analysis History page to view all reports.")
```

## Complete Gradio Example

```python
import gradio as gr
import json
from datetime import datetime

def analyze_report(file):
    # Your analysis logic here
    result = perform_analysis(file)
    
    # Prepare message
    message = {
        "type": "ANALYSIS_COMPLETE",
        "title": f"Analysis Report - {datetime.now().strftime('%Y-%m-%d')}",
        "analysisType": result["type"],
        "summary": result["summary"],
        "recommendationsCount": len(result["recommendations"]),
        "fileUrl": None,
        "analysisData": result["data"]
    }
    
    # Create HTML with JavaScript to send message
    html_content = f"""
    <div id="analysis-result">
        <h3>Analysis Complete!</h3>
        <p>{result['summary']}</p>
        <p><strong>Recommendations:</strong> {len(result['recommendations'])}</p>
    </div>
    <script>
        // Send message to parent window
        if (window.parent && window.parent !== window) {{
            window.parent.postMessage({json.dumps(message)}, '*');
            console.log('✅ ANALYSIS_COMPLETE sent:', {json.dumps(message)});
        }} else {{
            console.error('❌ Not in iframe');
        }}
    </script>
    """
    
    return html_content

# Create Gradio interface
interface = gr.Interface(
    fn=analyze_report,
    inputs=gr.File(label="Upload Lab Report"),
    outputs=gr.HTML(label="Analysis Results"),
    title="CropDrive AI Assistant"
)

interface.launch()
```

## JavaScript Example (for React/vanilla JS)

```javascript
// After analysis is complete
function sendAnalysisComplete(result) {
  const message = {
    type: 'ANALYSIS_COMPLETE',  // MUST be exactly this
    title: `Analysis Report - ${new Date().toISOString().split('T')[0]}`,
    analysisType: result.type,  // 'soil' or 'leaf'
    summary: result.summary,
    recommendationsCount: result.recommendations.length,
    fileUrl: result.fileUrl || null,
    analysisData: result.data
  };

  // Check if we're in an iframe
  if (window.parent && window.parent !== window) {
    // Send message to parent window
    window.parent.postMessage(message, '*');
    console.log('✅ ANALYSIS_COMPLETE message sent:', message);
  } else {
    console.error('❌ Not in iframe - cannot send message to parent');
    console.log('Message that would be sent:', message);
  }
}

// Call this function after analysis completes
sendAnalysisComplete({
  type: 'soil',
  summary: 'Your analysis summary here...',
  recommendations: ['Rec 1', 'Rec 2', 'Rec 3'],
  fileUrl: null,
  data: { ph: 6.5, nitrogen: 2.3 }
});
```

## Testing Your Implementation

### 1. Test in Browser Console

Open the CropDrive website `/assistant` page, open browser console, and run:

```javascript
// Simulate a message from AI Assistant
window.testAIIntegration.simulateAnalysisComplete({
  title: 'Test Analysis',
  analysisType: 'soil',
  summary: 'Test summary',
  recommendationsCount: 3
});
```

### 2. Check Message Format

Visit: `https://cropdrive.ai/api/test-ai-message` (GET) to see the expected format.

Or test your message format:
```bash
curl -X POST https://cropdrive.ai/api/test-ai-message \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ANALYSIS_COMPLETE",
    "title": "Test Report",
    "analysisType": "soil",
    "summary": "Test summary",
    "recommendationsCount": 5
  }'
```

### 3. Verify in Browser Console

When you send a message, you should see in the browser console:
- `📨 Message received from iframe:`
- `🎯🎯🎯 ANALYSIS_COMPLETE DETECTED!`
- `✅ Report saved successfully:`

## Common Mistakes to Avoid

1. **Wrong message type**: Must be exactly `'ANALYSIS_COMPLETE'` (case-sensitive)
2. **Missing required fields**: All 5 required fields must be present
3. **Wrong analysisType**: Must be exactly `'soil'` or `'leaf'` (lowercase)
4. **Not checking iframe**: Always check `window.parent !== window` before sending
5. **Wrong target origin**: Use `'*'` as target origin for maximum compatibility

## Debugging Tips

1. **Check browser console** on the CropDrive website for message logs
2. **Verify message format** matches exactly what's shown in the guide
3. **Test with the test utility**: Use `window.testAIIntegration.simulateAnalysisComplete()`
4. **Check Network tab**: Look for POST to `/api/save-analysis-report`
5. **Check Firestore**: Verify document was created in `analysis_results` collection

## Support

If messages aren't being received:
1. Check browser console for errors
2. Verify message format matches this example exactly
3. Ensure you're checking `window.parent !== window` before sending
4. Try the test utility to verify the website is listening

