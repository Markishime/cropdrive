# Streamlit ↔️ Website Communication Guide

This guide explains how your AI assistant (running in Streamlit) can communicate with the CropDrive website to send analysis results, status updates, and other messages.

## 📋 Overview

The CropDrive website embeds your Streamlit AI assistant in an iframe. Communication happens through the browser's `postMessage` API, allowing secure cross-origin communication between the Streamlit app and the parent website.

## 🔄 Communication Flow

```
User Action → Website → Streamlit AI Assistant → Analysis → Send Results → Website Updates
```

## 📤 Sending Messages from Streamlit

### Basic Message Structure

```python
import streamlit as st
from streamlit_javascript import st_javascript

def send_message_to_website(message_data):
    """Send a message to the parent website via postMessage"""
    js_code = f"""
    try {{
        window.parent.postMessage({message_data}, '*');
        console.log('📤 Sent message to website:', {message_data});
    }} catch (error) {{
        console.error('❌ Failed to send message:', error);
    }}
    """
    st_javascript(js_code)
```

### Supported Message Types

#### 1. `ANALYSIS_COMPLETE` - Send Analysis Results

**When to send:** After completing an analysis successfully.

**Message structure:**
```python
analysis_data = {
    "type": "ANALYSIS_COMPLETE",
    "userId": user_id,  # From URL params
    "title": "Soil Analysis Report - 2024",
    "analysisType": "soil",  # or "leaf" or "both"
    "summary": "Analysis summary text...",
    "recommendations": 5,  # Number of recommendations
    "recommendationsCount": 5,  # Alternative field
    "fileUrl": "https://example.com/download.pdf",  # Optional
    "analysisData": {  # Detailed analysis data
        "pH": 6.5,
        "nitrogen": 45,
        "phosphorus": 23,
        # ... more analysis data
    }
}

send_message_to_website(analysis_data)
```

**Required fields:**
- `type`: Must be `"ANALYSIS_COMPLETE"`
- `userId`: User ID from URL parameters
- `title`: Report title
- `analysisType`: `"soil"`, `"leaf"`, or `"both"`

#### 2. `SCRIPT_RUN_STATE_CHANGED` - Status Updates

**When to send:** When analysis starts, progresses, or stops.

**Message structure:**
```python
status_data = {
    "type": "SCRIPT_RUN_STATE_CHANGED",
    "scriptRunState": "running",  # or "notRunning"
    "progress": 75,  # Optional: progress percentage
    "message": "Processing soil samples..."  # Optional: status message
}

send_message_to_website(status_data)
```

#### 3. `FEATURE_RESTRICTED` - Feature Limitations

**When to send:** When user tries to use a feature not available in their plan.

**Message structure:**
```python
restriction_data = {
    "type": "FEATURE_RESTRICTED",
    "requiredPlan": "precision",  # Plan required for this feature
    "feature": "comparative_analysis"
}

send_message_to_website(restriction_data)
```

#### 4. `LANGUAGE_CHANGE_REQUEST` - Language Changes

**When to send:** When user changes language in the AI assistant.

**Message structure:**
```python
language_data = {
    "type": "LANGUAGE_CHANGE_REQUEST",
    "language": "ms"  # or "en"
}

send_message_to_website(language_data)
```

#### 5. `REQUEST_CONFIG_UPDATE` - Request Updated Config

**When to send:** When you need updated user configuration.

**Message structure:**
```python
config_request = {
    "type": "REQUEST_CONFIG_UPDATE"
}

send_message_to_website(config_request)
```

## 📥 Receiving Messages from Website

### Getting URL Parameters

The website sends user information via URL parameters:

```python
import streamlit as st

# Get URL parameters
params = st.experimental_get_query_params()

user_id = params.get("userId", [None])[0]
user_email = params.get("userEmail", [None])[0]
user_name = params.get("userName", [None])[0]
plan = params.get("plan", ["none"])[0]
uploads_used = int(params.get("uploadsUsed", ["0"])[0])
uploads_limit = int(params.get("uploadsLimit", ["10"])[0])
features = params.get("features", ["basic"])[0].split(",")
language = params.get("lang", ["en"])[0]

st.write(f"User: {user_name} ({user_email})")
st.write(f"Plan: {plan}")
st.write(f"Uploads: {uploads_used}/{uploads_limit}")
st.write(f"Features: {features}")
```

### Listening for Messages from Website

```python
import streamlit as st
from streamlit_javascript import st_javascript

def setup_message_listener():
    js_code = """
    window.addEventListener('message', function(event) {
        // Handle messages from parent website
        console.log('📨 Received message from website:', event.data);

        if (event.data.type === 'CONFIG') {
            // Website sent updated configuration
            console.log('🔄 Received config update:', event.data);

            // You can store this in session state or trigger updates
            window.streamlitData = event.data;
        } else if (event.data.type === 'LANGUAGE_CHANGE') {
            // Language changed
            console.log('🌐 Language changed to:', event.data.language);
        }
    });
    """
    st_javascript(js_code)

# Call this at the start of your app
setup_message_listener()
```

## 🛠️ Complete Streamlit Example

```python
import streamlit as st
from streamlit_javascript import st_javascript
import time

# Helper function to send messages to website
def send_message_to_website(message_data):
    js_code = f"""
    try {{
        window.parent.postMessage({message_data}, '*');
        console.log('📤 Sent message to website:', {message_data});
    }} catch (error) {{
        console.error('❌ Failed to send message:', error);
    }}
    """
    st_javascript(js_code)

def main():
    st.title("CropDrive™ Oil Palm AI Advisor")

    # Get URL parameters
    params = st.experimental_get_query_params()
    user_id = params.get("userId", [None])[0]
    user_name = params.get("userName", [None])[0]
    plan = params.get("plan", ["none"])[0]

    if not user_id:
        st.error("No user ID provided. Please access through the website.")
        return

    st.write(f"Welcome, {user_name}!")

    # File upload
    uploaded_file = st.file_uploader("Upload your lab report", type=['pdf', 'jpg', 'png', 'xlsx'])

    if uploaded_file and st.button("Analyze"):
        # Send status update
        send_message_to_website({
            "type": "SCRIPT_RUN_STATE_CHANGED",
            "scriptRunState": "running",
            "message": "Starting analysis..."
        })

        # Simulate analysis
        progress_bar = st.progress(0)
        status_text = st.empty()

        for i in range(100):
            time.sleep(0.1)
            progress_bar.progress(i + 1)
            status_text.text(f"Analyzing... {i+1}%")

            # Send progress updates
            if i % 20 == 0:
                send_message_to_website({
                    "type": "SCRIPT_RUN_STATE_CHANGED",
                    "scriptRunState": "running",
                    "progress": i + 1,
                    "message": f"Analysis {i+1}% complete"
                })

        # Analysis complete
        analysis_result = {
            "type": "ANALYSIS_COMPLETE",
            "userId": user_id,
            "title": f"Soil Analysis Report - {time.strftime('%Y-%m-%d')}",
            "analysisType": "soil",
            "summary": "Your soil analysis shows optimal pH levels with good nutrient content.",
            "recommendations": 3,
            "analysisData": {
                "pH": 6.5,
                "nitrogen": 45,
                "phosphorus": 23,
                "potassium": 180
            }
        }

        # Send analysis results to website
        send_message_to_website(analysis_result)

        # Send completion status
        send_message_to_website({
            "type": "SCRIPT_RUN_STATE_CHANGED",
            "scriptRunState": "notRunning",
            "message": "Analysis completed successfully!"
        })

        st.success("Analysis completed! Results sent to website.")

if __name__ == "__main__":
    main()
```

## 🔒 Security Considerations

1. **Origin Validation**: The website validates message origins for security
2. **User ID Verification**: Always verify the user ID matches the authenticated user
3. **Data Sanitization**: Sanitize all data before sending
4. **Error Handling**: Handle communication failures gracefully

## 🐛 Debugging

### Check Browser Console

The website logs all received messages. Check the browser console for:

```
📨 Message received from iframe: {...}
🎯🎯🎯 ANALYSIS_COMPLETE DETECTED! Processing immediately...
✅ Report saved successfully
```

### Streamlit Console

Your Streamlit app will show:

```
📤 Sent message to website: {...}
📨 Received message from website: {...}
```

## 📝 Message Format Tips

1. **Use JSON-serializable data** - Objects, arrays, strings, numbers, booleans
2. **Include error handling** - Wrap postMessage calls in try-catch
3. **Test thoroughly** - Verify messages are received by checking website logs
4. **Use consistent field names** - Follow the patterns shown above

## 🚀 Advanced Features

### Real-time Progress Updates

Send periodic progress updates during long-running analyses:

```python
def send_progress_update(current_step, total_steps, message):
    progress = int((current_step / total_steps) * 100)
    send_message_to_website({
        "type": "SCRIPT_RUN_STATE_CHANGED",
        "scriptRunState": "running",
        "progress": progress,
        "message": message
    })
```

### Error Reporting

Send error messages to the website:

```python
def send_error_message(error_message):
    send_message_to_website({
        "type": "SCRIPT_RUN_STATE_CHANGED",
        "scriptRunState": "error",
        "message": f"Error: {error_message}"
    })
```

This communication system allows your Streamlit AI assistant to seamlessly integrate with the CropDrive website, providing real-time updates and analysis results to users!
