import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import './ShortcutSetupPage.css';

function ShortcutSetupPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [shortcutContent, setShortcutContent] = useState(null);
  const [installMethod, setInstallMethod] = useState('auto');
  const navigate = useNavigate();
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  useEffect(() => {
    fetchShortcutConfig();
  }, []);
  
  const fetchShortcutConfig = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      
      if (!token) {
        setError('Please sign in to set up iOS shortcuts');
        setLoading(false);
        return;
      }
      
      console.log('[ShortcutSetup] Fetching config with token:', token ? 'present' : 'missing');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/shortcuts/setup`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ShortcutSetup] API error:', response.status, errorData);
        
        if (response.status === 401) {
          setError('Authentication failed. Please try signing out and back in.');
          setLoading(false);
          return;
        }
        
        throw new Error(errorData.error || `Failed to fetch configuration (${response.status})`);
      }
      
      const data = await response.json();
      console.log('[ShortcutSetup] Config received:', data);
      setConfig(data);
      
      // Also fetch the shortcut template
      await fetchShortcutTemplate(data);
    } catch (err) {
      console.error('[ShortcutSetup] Error:', err);
      setError(err.message || 'Failed to load shortcut configuration');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchShortcutTemplate = async (configData) => {
    try {
      // Fetch the shortcut JSON template
      const response = await fetch('/shortcuts/save-to-fridgy.json');
      if (!response.ok) throw new Error('Failed to load shortcut template');
      
      const template = await response.json();
      
      // Update the template with user's specific values
      const customizedShortcut = {
        ...template,
        WFWorkflowImportQuestions: [
          {
            ParameterKey: "ShortcutToken",
            WFParameterType: "Text",
            WFWorkflowImportQuestionText: "Your Fridgy Token (already filled):",
            DefaultValue: configData.token
          },
          {
            ParameterKey: "BackendURL",
            WFParameterType: "Text",
            WFWorkflowImportQuestionText: "API URL (already filled):",
            DefaultValue: configData.apiUrl.replace('/import', '')
          },
          {
            ParameterKey: "FrontendURL",
            WFParameterType: "Text",
            WFWorkflowImportQuestionText: "App URL (already filled):",
            DefaultValue: window.location.origin
          }
        ]
      };
      
      setShortcutContent(customizedShortcut);
    } catch (error) {
      console.error('[ShortcutSetup] Failed to load shortcut template:', error);
    }
  };
  
  const handleInstall = () => {
    if (!isIOS) {
      // Scroll to QR code for other devices
      document.getElementById('qr-section')?.scrollIntoView({
        behavior: 'smooth'
      });
      return;
    }

    // Copy token to clipboard first
    navigator.clipboard.writeText(config.token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // iCloud shortcut link
      const iCloudShortcutURL = process.env.REACT_APP_ICLOUD_SHORTCUT_URL || 'https://www.icloud.com/shortcuts/PLACEHOLDER';

      // Show instructions and open shortcut
      const userConfirmed = window.confirm(
        '📱 Install Trackabite Recipe Saver\n\n' +
        '✅ Token copied to clipboard!\n\n' +
        '1. Tap OK to open the shortcut\n' +
        '2. Tap "Add Shortcut"\n' +
        '3. First share: Paste token (one time only!)\n\n' +
        'Token saves permanently in shortcut!'
      );

      if (userConfirmed) {
        // Open iCloud shortcut link (clean, no parameters)
        window.location.href = iCloudShortcutURL;

        // Mark as installed after confirmation
        setTimeout(() => {
          const installed = window.confirm('Did you successfully add the shortcut?');
          if (installed) {
            localStorage.setItem('shortcut_installed', 'true');
            alert('🎉 Perfect! Share Instagram recipes directly to Trackabite now!');
          }
        }, 3000);
      }
    });
  };
  
  const installViaDataURL = () => {
    if (!shortcutContent) {
      alert('Shortcut not ready yet. Please try again.');
      return;
    }
    
    try {
      // Method 1: Try using a blob URL (more reliable than data URL)
      const blob = new Blob([JSON.stringify(shortcutContent)], {
        type: 'application/x-apple-shortcuts'
      });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download/open
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'Save to Fridgy.shortcut';
      
      // For iOS, this should trigger the "Open in Shortcuts" dialog
      a.click();
      
      // Clean up after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      // Show instructions
      setTimeout(() => {
        alert('If the Shortcuts app opened:\n1. Tap "Add Shortcut"\n2. The token is already filled in\n\nIf nothing happened, try the "Download File" method.');
      }, 500);
    } catch (error) {
      console.error('Failed to install shortcut:', error);
      
      // Fallback to download method
      downloadShortcutFile();
    }
  };
  
  const downloadShortcutFile = () => {
    if (!shortcutContent) {
      alert('Shortcut not ready yet. Please try again.');
      return;
    }
    
    try {
      // Create a blob with the shortcut content
      const blob = new Blob([JSON.stringify(shortcutContent, null, 2)], {
        type: 'application/json'
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Save to Fridgy.shortcut';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show instructions
      setTimeout(() => {
        alert('Shortcut downloaded!\n\n1. Open the Files app\n2. Go to Downloads\n3. Tap "Save to Fridgy.shortcut"\n4. It will open in Shortcuts app\n5. Add the shortcut');
      }, 500);
    } catch (error) {
      console.error('Failed to download shortcut:', error);
      alert('Download failed. Please try again.');
    }
  };
  
  const copyToken = () => {
    navigator.clipboard.writeText(config.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const copyApiUrl = () => {
    navigator.clipboard.writeText(config.apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const sendEmail = async () => {
    const subject = 'Your Fridgy Shortcut Setup';
    const body = `Here's your Fridgy shortcut setup information:

Token: ${config.token}
API URL: ${config.apiUrl}

Install the shortcut on your iPhone and use this token to authenticate.`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setEmailSent(true);
  };
  
  const handleRegenerateToken = async () => {
    if (!window.confirm('This will invalidate your current shortcut. You\'ll need to reinstall it with the new token. Continue?')) {
      return;
    }
    
    setRegenerating(true);
    try {
      const token = localStorage.getItem('fridgy_token');
      
      if (!token) {
        setError('Please sign in to regenerate token');
        setRegenerating(false);
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/shortcuts/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to regenerate token');
      }
      
      // Refresh the configuration
      await fetchShortcutConfig();
      alert('Token regenerated successfully! Please reinstall the shortcut with the new token.');
    } catch (err) {
      alert('Failed to regenerate token: ' + err.message);
    } finally {
      setRegenerating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="shortcut-setup-page">
        <div className="setup-loading">
          <div className="spinner"></div>
          <p>Loading setup...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="shortcut-setup-page">
        <div className="setup-error">
          <h2>⚠️ Setup Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => {
              setError(null);
              setLoading(true);
              fetchShortcutConfig();
            }}>
              Try Again
            </button>
            <button onClick={() => navigate('/saved-recipes')}>
              Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="shortcut-setup-page">
      <div className="setup-container">
        <header className="setup-header">
          <button 
            className="back-button"
            onClick={() => navigate('/saved-recipes')}
          >
            ← Back
          </button>
          <h1>📱 Save from Instagram</h1>
        </header>
        
        <div className="setup-content">
          {/* How it works */}
          <section className="how-it-works">
            <h2>How it works</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Install Shortcut</h3>
                  <p>One-time setup on your iPhone</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Share from Instagram</h3>
                  <p>Tap share on any recipe post</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Save to Fridgy</h3>
                  <p>Select "Save to Fridgy" from share menu</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Installation */}
          <section className="installation">
            <h2>Install Your Shortcut</h2>
            
            {isIOS && (
              <div className="install-methods">
                <div className="method-selector">
                  <button 
                    className={`method-btn ${installMethod === 'auto' ? 'active' : ''}`}
                    onClick={() => setInstallMethod('auto')}
                  >
                    ⚡ Quick Install
                  </button>
                  <button 
                    className={`method-btn ${installMethod === 'download' ? 'active' : ''}`}
                    onClick={() => setInstallMethod('download')}
                  >
                    📥 Download File
                  </button>
                </div>
                
                <div className="method-description">
                  {installMethod === 'auto' ? (
                    <p>Opens Shortcuts app directly with your shortcut ready to add</p>
                  ) : (
                    <p>Downloads shortcut file to open manually from Files app</p>
                  )}
                </div>
              </div>
            )}
            
            <button 
              className="install-button primary"
              onClick={handleInstall}
              disabled={!shortcutContent}
            >
              {!isIOS ? '📱 Get for iPhone' : 
               installMethod === 'auto' ? '⚡ Install Now' : '📥 Download Shortcut'}
            </button>
            
            {isIOS && (
              <div className="troubleshooting">
                <details>
                  <summary>Having trouble?</summary>
                  <ul>
                    <li>Make sure you have the Shortcuts app installed</li>
                    <li>Try the alternative method if one doesn't work</li>
                    <li>Your token is: <code>{config.token}</code> (already copied)</li>
                    <li>You may need to allow untrusted shortcuts in Settings → Shortcuts</li>
                  </ul>
                </details>
              </div>
            )}
            
            {/* Manual Setup for Testing */}
            <div className="manual-setup">
              <h3>Manual Setup (For Testing)</h3>
              <p>Use these details to test the API or create your own shortcut:</p>
              
              <div className="config-field">
                <label>API Endpoint:</label>
                <div className="config-value">
                  <code>{config.apiUrl}</code>
                  <button onClick={copyApiUrl} className="copy-btn">
                    {copied ? '✅' : '📋'}
                  </button>
                </div>
              </div>
              
              <div className="config-field">
                <label>Your Token:</label>
                <div className="config-value">
                  <code>{config.token}</code>
                  <button onClick={copyToken} className="copy-btn">
                    {copied ? '✅' : '📋'}
                  </button>
                </div>
              </div>
              
              <div className="config-field">
                <label>Request Format:</label>
                <div className="config-value">
                  <pre>{`POST ${config.apiUrl}
Content-Type: application/json

{
  "url": "https://instagram.com/p/...",
  "token": "${config.token}",
  "caption": "optional caption text"
}`}</pre>
                </div>
              </div>
            </div>
            
            {!isIOS && (
              <div id="qr-section" className="qr-section">
                <p>Scan with your iPhone to save this page:</p>
                <div className="qr-container">
                  <QRCodeCanvas 
                    value={window.location.href}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                
                <div className="alternatives">
                  <button 
                    className="email-button"
                    onClick={sendEmail}
                  >
                    📧 Email Setup Info
                  </button>
                </div>
              </div>
            )}
          </section>
          
          {/* Usage Stats */}
          {config.usage && (
            <section className="usage-stats">
              <h2>Your Usage</h2>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-value">{config.usage.totalSaved || 0}</span>
                  <span className="stat-label">Recipes Saved</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {config.usage.dailyUsed || 0}/{config.usage.dailyLimit || 5}
                  </span>
                  <span className="stat-label">Today's Usage</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {config.usage.lastUsed 
                      ? new Date(config.usage.lastUsed).toLocaleDateString()
                      : 'Never'}
                  </span>
                  <span className="stat-label">Last Used</span>
                </div>
              </div>
            </section>
          )}
          
          {/* Test Link */}
          <section className="test-section">
            <h2>Test It Out</h2>
            <p>Try importing this example recipe (works with mock data):</p>
            <div className="test-example">
              <code>https://www.instagram.com/p/ABC123</code>
              <p className="test-note">
                Use a tool like Postman or curl to test:
              </p>
              <pre>{`curl -X POST ${config.apiUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://instagram.com/p/ABC123",
    "token": "${config.token}"
  }'`}</pre>
            </div>
          </section>
          
          {/* Advanced Settings */}
          <details className="advanced-settings">
            <summary>Advanced Settings</summary>
            <div className="settings-content">
              <div className="token-section">
                <p>Keep your token secret. Anyone with this token can save recipes to your account.</p>
              </div>
              
              <button 
                className="regenerate-button"
                onClick={handleRegenerateToken}
                disabled={regenerating}
              >
                {regenerating ? 'Regenerating...' : '🔄 Regenerate Token'}
              </button>
              
              <p className="warning-text">
                ⚠️ Regenerating your token will require you to reinstall your shortcut
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default ShortcutSetupPage;