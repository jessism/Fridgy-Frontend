# Debug Console Guide for Notification Settings

## Overview
The notification settings page includes a hidden debug console that collects diagnostic information to help troubleshoot notification issues. This console is hidden by default but can be enabled by developers when needed.

## How to Enable Debug Mode

### Method 1: URL Parameter
Add `?debug=true` to the notification settings URL.

**Example:**
```
http://localhost:3000/notification-settings?debug=true
https://yoursite.com/notification-settings?debug=true
```

**Use Case:** Perfect for remote debugging. When a user reports issues, send them this link to see their debug logs.

### Method 2: localStorage Flag
Set a flag in localStorage using the browser console.

**To Enable:**
```javascript
localStorage.setItem('fridgy_debug_mode', 'true')
```

**To Disable:**
```javascript
localStorage.removeItem('fridgy_debug_mode')
```

**Use Case:** Persistent debug mode for developers that survives page refreshes.

## Debug Console Features

When debug mode is enabled, you'll see:

1. **Debug Console Section** - Shows:
   - Device information (platform, browser, PWA status)
   - Notification permission status
   - Service worker status
   - Subscription status
   - Recent activity logs with timestamps

2. **Debug Token Status Button** - Only visible when:
   - User is not subscribed to notifications
   - Debug mode is active
   - Shows authentication token status

3. **Test Buttons**:
   - **Test VAPID Fetch** - Tests connection to push notification server
   - **Clear Logs** - Clears the debug log history

## Accessing Debug Logs Without UI

Debug logs are always collected in the background, even when the console is hidden. You can access them programmatically:

### View All Logs
```javascript
// Get all debug logs from localStorage
const logs = JSON.parse(localStorage.getItem('notification_debug_logs'))
console.table(logs)
```

### View Specific Log Details
```javascript
// Get the most recent log
const logs = JSON.parse(localStorage.getItem('notification_debug_logs'))
if (logs && logs.length > 0) {
  console.log('Latest log:', logs[0])
}
```

### Clear All Logs
```javascript
localStorage.removeItem('notification_debug_logs')
```

## Debug Log Structure

Each log entry contains:
```javascript
{
  timestamp: "2025-01-14T12:00:00.000Z",
  message: "Notification permission granted",
  type: "success", // 'success', 'error', 'warning', 'info'
  details: {
    // Additional context data
  }
}
```

## Common Debugging Scenarios

### 1. User Can't Enable Notifications
1. Send them the debug URL: `yoursite.com/notification-settings?debug=true`
2. Ask them to click "Enable Notifications"
3. Have them screenshot the debug console
4. Check for permission errors or service worker issues

### 2. Notifications Not Appearing
1. Enable debug mode
2. Check the "Recent Activity" section for errors
3. Click "Test VAPID Fetch" to verify server connection
4. Verify service worker status shows "active"

### 3. Authentication Issues
1. Enable debug mode
2. Click "Debug Token Status" button (if visible)
3. Check if tokens are present in localStorage
4. Look for token validation errors in logs

## Important Notes

- **Privacy**: Never share debug logs publicly as they may contain sensitive information
- **Performance**: Debug logs are limited to the last 20 entries to prevent memory issues
- **Persistence**: Logs persist in localStorage until manually cleared
- **Background Collection**: Logs are always collected, even when UI is hidden

## Quick Commands Reference

```javascript
// Enable debug mode
localStorage.setItem('fridgy_debug_mode', 'true')

// View all logs
JSON.parse(localStorage.getItem('notification_debug_logs'))

// Check notification permission
Notification.permission

// Check service worker
navigator.serviceWorker.ready

// Manual test notification
new Notification('Test', {body: 'Debug test'})
```

## Troubleshooting the Debug Console Itself

If debug mode isn't working:

1. **Check Browser Console** for JavaScript errors
2. **Verify localStorage is Available**:
   ```javascript
   typeof(Storage) !== "undefined"
   ```
3. **Check URL Format**: Ensure `?debug=true` is properly formatted
4. **Clear Cache**: Sometimes a hard refresh helps (Ctrl+Shift+R or Cmd+Shift+R)

## Support

For issues with the debug console or notification system, check:
- Browser console for errors
- Network tab for failed requests
- Service worker registration status
- Browser notification permissions settings