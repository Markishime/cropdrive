# CropDrive Streamlit Integration Guide

## Overview

This guide explains how to configure your AGS-AI-Assistant Streamlit app to receive and sync language, upload limit, and user configuration updates from the CropDrive Next.js website.

The CropDrive website and your Streamlit app communicate via `postMessage` API (iframe-to-parent communication). This allows the website to:
1. **Sync language changes**: When a user changes language on the website (en/ms/id), the Streamlit app receives and switches to the same language
2. **Enforce upload limits**: Send upload usage data (e.g., 2 uploads used, 2 uploads limit) so the Streamlit UI can disable uploads when limit is reached
3. **Share user context**: Pass userId, email, plan info, and other user data to personalize the Streamlit experience

---

## Message Format

### 1. CONFIG Message (Sent on User Login & Language Changes)

When a user logs in or the app loads, the CropDrive website sends a `CONFIG` message with user information:

```javascript
{
  type: 'CONFIG',
  language: 'en',           // Current language: 'en', 'ms', or 'id'
  userId: 'user_12345',     // Firebase UID
  userEmail: 'user@example.com',
  userName: 'John Farmer',
  plan: 'free',             // User's plan (all users now have 'free' access)
  uploadsUsed: 1,           // Number of uploads already used
  uploadsLimit: 2,          // Maximum uploads allowed (hardcoded to 2 for free tier)
  uploadLimitExceeded: false, // True if uploadsUsed >= uploadsLimit
  uploadsRemaining: 1,      // Number of uploads remaining (uploadsLimit - uploadsUsed)
  canViewHistory: true,     // Always true (users can view old analyses)
  canUploadNew: true        // False if upload limit is reached
}
```

### 2. LANGUAGE_CHANGE Message (Sent when User Changes Language)

When a user switches language on the website, a separate message is sent:

```javascript
{
  type: 'LANGUAGE_CHANGE',
  language: 'ms'  // New language code: 'en', 'ms', or 'id'
}
```

---

## How to Implement in Streamlit

### Step 1: Add JavaScript Event Listener to Receive Messages

Add this JavaScript code to your Streamlit app's custom HTML component or via `st.markdown()`:

```python
import streamlit as st

# Add JavaScript to listen for postMessage events from the parent window
html_code = """
<script>
  // Store current language globally
  window.currentLanguage = 'en'; // Default language
  window.userConfig = {}; // Store user config
  
  // Listen for messages from the parent window (CropDrive website)
  window.addEventListener('message', function(event) {
    // You can optionally validate the origin for security
    // const allowedOrigins = ['https://cropdrive.io', 'http://localhost:3000'];
    // if (!allowedOrigins.includes(event.origin)) return;
    
    // Log all incoming messages for debugging
    console.log('📨 Streamlit received message from parent:', event.data);
    
    // Handle CONFIG message (user login, language change, upload info)
    if (event.data && event.data.type === 'CONFIG') {
      console.log('✅ Received user CONFIG:', event.data);
      
      // Store configuration globally
      window.userConfig = event.data;
      window.currentLanguage = event.data.language;
      
      // Dispatch custom event so Streamlit components can react
      window.dispatchEvent(new CustomEvent('userConfigChanged', {
        detail: event.data
      }));
      
      // Log upload status
      console.log(`📊 Upload Status: ${event.data.uploadsUsed}/${event.data.uploadsLimit} used`);
      if (event.data.uploadLimitExceeded) {
        console.warn('⚠️ Upload limit reached! canUploadNew =', event.data.canUploadNew);
      }
    }
    
    // Handle LANGUAGE_CHANGE message
    if (event.data && event.data.type === 'LANGUAGE_CHANGE') {
      console.log('🌍 Language changed to:', event.data.language);
      window.currentLanguage = event.data.language;
      
      // Dispatch custom event so your app can respond to language change
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: event.data.language }
      }));
    }
  }, false);
  
  // Notify parent that Streamlit app is ready to receive messages
  setTimeout(() => {
    window.parent.postMessage({ 
      type: 'STREAMLIT_READY',
      message: 'Streamlit iframe is ready to receive user config'
    }, '*');
    console.log('✅ Notified parent that Streamlit is ready');
  }, 1000);
</script>
"""

# Add the script to your Streamlit app
st.markdown(html_code, unsafe_allow_html=True)
```

### Step 2: Create Session State Handler for Language & Config

```python
import streamlit as st
import json

# Initialize session state variables
if 'user_language' not in st.session_state:
    st.session_state.user_language = 'en'

if 'user_config' not in st.session_state:
    st.session_state.user_config = {
        'userId': None,
        'uploadsUsed': 0,
        'uploadsLimit': 2,
        'uploadLimitExceeded': False,
        'canUploadNew': True
    }

# Create a hidden input to listen to parent messages
# This allows Streamlit to update session state when messages arrive
html_listener = """
<script>
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CONFIG') {
        // Store in sessionStorage so we can access it
        sessionStorage.setItem('userConfig', JSON.stringify(event.data));
        sessionStorage.setItem('lastUpdate', Date.now());
    }
    if (event.data && event.data.type === 'LANGUAGE_CHANGE') {
        sessionStorage.setItem('currentLanguage', event.data.language);
        sessionStorage.setItem('lastLangUpdate', Date.now());
    }
});
</script>
"""

st.markdown(html_listener, unsafe_allow_html=True)
```

### Step 3: Create a Function to Access Current Config

```python
def get_user_config():
    """Get the latest user config from parent window"""
    config_json = st.session_state.get('user_config_json', '{}')
    try:
        return json.loads(config_json)
    except:
        return {
            'userId': None,
            'uploadsUsed': 0,
            'uploadsLimit': 2,
            'uploadLimitExceeded': False,
            'canUploadNew': True
        }

def get_current_language():
    """Get the current language from parent window"""
    return st.session_state.get('user_language', 'en')

def get_upload_status():
    """Get upload usage information"""
    config = get_user_config()
    return {
        'used': config.get('uploadsUsed', 0),
        'limit': config.get('uploadsLimit', 2),
        'exceeded': config.get('uploadLimitExceeded', False),
        'remaining': config.get('uploadsRemaining', 2)
    }
```

### Step 4: Language-Dependent Content

```python
import streamlit as st

# Translation dictionary
TRANSLATIONS = {
    'en': {
        'title': 'CropDrive AI Assistant',
        'upload_label': 'Upload Lab Report',
        'upload_limit_reached': '⚠️ You have reached your upload limit (2 reports maximum)',
        'uploads_used': 'Reports analyzed',
        'analyze_button': 'Analyze Report'
    },
    'ms': {
        'title': 'Pembantu AI CropDrive',
        'upload_label': 'Muat Naik Laporan Makmal',
        'upload_limit_reached': '⚠️ Anda telah mencapai had muat naik (maksimum 2 laporan)',
        'uploads_used': 'Laporan dianalisis',
        'analyze_button': 'Analisis Laporan'
    },
    'id': {
        'title': 'Asisten AI CropDrive',
        'upload_label': 'Unggah Laporan Lab',
        'upload_limit_reached': '⚠️ Anda telah mencapai batas unggah (maksimum 2 laporan)',
        'uploads_used': 'Laporan dianalisis',
        'analyze_button': 'Analisis Laporan'
    }
}

def t(key):
    """Translate text based on current language"""
    lang = st.session_state.user_language
    return TRANSLATIONS.get(lang, TRANSLATIONS['en']).get(key, key)

st.set_page_config(page_title=t('title'))
st.title(t('title'))
```

### Step 5: Show Upload Limit Status & Disable Upload When Limit Reached

```python
import streamlit as st

def show_upload_section():
    """Display upload section with limit enforcement"""
    
    # Get current upload status from parent window
    config = st.session_state.user_config
    uploads_used = config.get('uploadsUsed', 0)
    uploads_limit = config.get('uploadsLimit', 2)
    upload_limit_exceeded = config.get('uploadLimitExceeded', False)
    
    # Show upload status progress bar
    st.metric(
        label=t('uploads_used'),
        value=f"{uploads_used}/{uploads_limit}",
        delta=f"{uploads_limit - uploads_used} remaining" if not upload_limit_exceeded else "Limit reached"
    )
    
    # Show progress bar
    progress_value = min(uploads_used / uploads_limit if uploads_limit > 0 else 0, 1.0)
    st.progress(progress_value)
    
    # If limit is reached, show warning and disable upload
    if upload_limit_exceeded:
        st.warning(t('upload_limit_reached'))
        st.info("📄 You can still view your analysis history, but cannot upload new reports.")
        
        # Disable upload button
        st.button(t('upload_label'), disabled=True, help="You have reached your upload limit")
    else:
        # Allow upload
        uploaded_file = st.file_uploader(t('upload_label'), type=['jpg', 'jpeg', 'png', 'pdf'])
        
        if uploaded_file is not None:
            st.success(f"✅ File uploaded: {uploaded_file.name}")
            # Process file here
            if st.button(t('analyze_button')):
                with st.spinner('Analyzing...'):
                    # Your analysis code here
                    pass

# Call this in your main Streamlit app
show_upload_section()
```

### Step 6: Dynamic Language Switching in Streamlit

```python
import streamlit as st

# Add language selector that syncs with parent window
col1, col2, col3 = st.columns(3)

with col1:
    if st.button('English'):
        st.session_state.user_language = 'en'
        st.rerun()

with col2:
    if st.button('Bahasa Melayu'):
        st.session_state.user_language = 'ms'
        st.rerun()

with col3:
    if st.button('Bahasa Indonesia'):
        st.session_state.user_language = 'id'
        st.rerun()

# Note: The language is automatically synced from the parent when user changes it on the website
# This manual selector is just for testing or when the app is viewed standalone
```

---

## Summary of Implementation Steps

1. **Add JavaScript Event Listener** - Listen for `postMessage` events from the parent window
2. **Store Configuration** - Keep `userConfig`, `currentLanguage`, and upload status in session state
3. **Display Upload Status** - Show how many uploads are remaining and disable UI when limit is reached
4. **Implement Language Switching** - Use the `language` value from CONFIG to show content in the correct language
5. **Respond to Changes** - When parent sends `LANGUAGE_CHANGE` or updated `CONFIG`, update your app accordingly

---

## Testing

### Test Config Message
Open browser console and run:
```javascript
// Simulate CropDrive sending CONFIG message
window.postMessage({
  type: 'CONFIG',
  language: 'ms',
  userId: 'test-user-123',
  userName: 'Test Farmer',
  uploadsUsed: 1,
  uploadsLimit: 2,
  uploadLimitExceeded: false,
  canUploadNew: true
}, '*');
```

### Test Language Change
```javascript
// Simulate language change
window.postMessage({
  type: 'LANGUAGE_CHANGE',
  language: 'id'
}, '*');
```

---

## Message Flow Diagram

```
CropDrive Website (Next.js)          Streamlit App (iframe)
    |                                      |
    | 1. User Logs In                     |
    | → sends CONFIG message ─────────→  | 
    |                                      | Updates session state
    |                                      | Shows user info & upload limit
    |                                      |
    | 2. User Changes Language           |
    | → sends LANGUAGE_CHANGE ───────→   |
    |                                      | Updates language
    |                                      | Re-renders content
    |                                      |
    | 3. User Uploads & Hits Limit       |
    | → sends updated CONFIG ─────────→  |
    |                                      | uploadLimitExceeded = true
    |                                      | Disables upload button
    |                                      |
```

---

## FAQ

**Q: The Streamlit app doesn't receive messages. What's wrong?**
A: Check browser console (F12 → Console tab). You should see "📨 Streamlit received message from parent" logs. If nothing appears, ensure:
- Streamlit app is embedded as an iframe in CropDrive
- The JavaScript code is added before the main content
- There are no console errors blocking the event listener

**Q: How do I know if the upload limit is enforced?**
A: When `uploadLimitExceeded` is `true` and `canUploadNew` is `false`, disable your upload buttons/file input. Show a warning message to the user.

**Q: What if I need to send data back to CropDrive?**
A: Use `window.parent.postMessage(data, '*')` to send messages back to the parent window. Example:
```javascript
window.parent.postMessage({
  type: 'ANALYSIS_COMPLETE',
  reportId: '12345',
  analysisType: 'soil'
}, '*');
```

**Q: Does this work for multiple language switches?**
A: Yes! Every time the user changes language on the CropDrive website, a `LANGUAGE_CHANGE` message is sent. Your Streamlit app should listen for these and update accordingly.

---

## Implementation Checklist

- [ ] Add JavaScript event listener to receive `postMessage` events
- [ ] Store `userConfig` in session state
- [ ] Display current language from config
- [ ] Show upload usage (X/2 reports)
- [ ] Disable upload when `uploadLimitExceeded` is true
- [ ] Translate UI text based on `language` field
- [ ] Test with manual `postMessage` in browser console
- [ ] Test with actual CropDrive website language switching
- [ ] Test with 2 uploads to verify limit enforcement
- [ ] Deploy to production

---

## Support

If you encounter issues:
1. Check browser console (F12) for messages and errors
2. Verify iframe src is correct: `https://markishime-ags.hf.space/`
3. Ensure postMessage is using `'*'` as targetOrigin (for Hugging Face Spaces)
4. Check that Streamlit app is in development/production mode (not preview)

---

**Last Updated**: 2024
**Version**: 1.0
**Maintained by**: CropDrive Team
