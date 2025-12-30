import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './LinkMessengerPage.css';

function LinkMessengerPage() {
  const [status, setStatus] = useState('checking'); // checking, login_required, ready, linking, success, error
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const psid = searchParams.get('psid');
  const token = searchParams.get('token');

  useEffect(() => {
    // Check if we have required params
    if (!psid || !token) {
      setStatus('error');
      setError('Missing linking parameters. Please try again from Messenger.');
      return;
    }

    // Check if user is logged in
    const authToken = localStorage.getItem('fridgy_token');
    if (!authToken) {
      setStatus('login_required');
      return;
    }

    setStatus('ready');
  }, [psid, token]);

  const handleLogin = () => {
    // Save the current URL to redirect back after login
    const returnUrl = `/link-messenger?psid=${psid}&token=${token}`;
    sessionStorage.setItem('redirectAfterSignin', returnUrl);
    navigate('/signin');
  };

  const handleSignUp = () => {
    // Save the current URL to redirect back after signup
    const returnUrl = `/link-messenger?psid=${psid}&token=${token}`;
    sessionStorage.setItem('redirectAfterSignup', returnUrl);
    navigate('/signup');
  };

  const handleLink = async () => {
    setStatus('linking');
    setError(null);

    try {
      const authToken = localStorage.getItem('fridgy_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${apiUrl}/messenger/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ psid, token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link account');
      }

      setStatus('success');

      // Redirect back to Messenger after 3 seconds
      setTimeout(() => {
        // Try to open Messenger app
        window.location.href = 'https://m.me/';
      }, 3000);

    } catch (err) {
      console.error('[LinkMessenger] Error:', err);
      setStatus('error');
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="link-messenger-page__loading">
            <div className="link-messenger-page__spinner"></div>
            <p>Loading...</p>
          </div>
        );

      case 'login_required':
        return (
          <div className="link-messenger-page__content">
            <div className="link-messenger-page__icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.63.63 1.04 1.21.82l1.98-.8c.17-.07.37-.09.55-.05 1 .27 2.08.41 3.2.41 5.64 0 10.2-4.13 10.2-9.2S17.64 2 12 2zm5.8 7.05L15.1 13.2c-.25.39-.79.53-1.19.27L11.5 11.8c-.22-.15-.51-.15-.73 0l-2.99 2.27c-.39.29-.89-.15-.61-.52l2.7-4.15c.25-.39.79-.53 1.19-.27l2.41 1.67c.22.15.51.15.73 0l2.99-2.27c.39-.29.89.15.61.52z"/>
              </svg>
            </div>
            <h1>Connect Messenger</h1>
            <p>Sign in to your Trackabite account to connect Messenger and start saving recipes!</p>

            <div className="link-messenger-page__actions">
              <button
                className="link-messenger-page__button link-messenger-page__button--primary"
                onClick={handleLogin}
              >
                Sign In
              </button>
              <button
                className="link-messenger-page__button link-messenger-page__button--secondary"
                onClick={handleSignUp}
              >
                Create Account
              </button>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="link-messenger-page__content">
            <div className="link-messenger-page__icon link-messenger-page__icon--messenger">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.63.63 1.04 1.21.82l1.98-.8c.17-.07.37-.09.55-.05 1 .27 2.08.41 3.2.41 5.64 0 10.2-4.13 10.2-9.2S17.64 2 12 2zm5.8 7.05L15.1 13.2c-.25.39-.79.53-1.19.27L11.5 11.8c-.22-.15-.51-.15-.73 0l-2.99 2.27c-.39.29-.89-.15-.61-.52l2.7-4.15c.25-.39.79-.53 1.19-.27l2.41 1.67c.22.15.51.15.73 0l2.99-2.27c.39-.29.89.15.61.52z"/>
              </svg>
            </div>
            <h1>Connect Messenger</h1>
            <p>Connect your Messenger to save Facebook recipes directly to your Trackabite account.</p>

            <div className="link-messenger-page__info">
              <div className="link-messenger-page__info-item">
                <span className="link-messenger-page__check">✓</span>
                <span>Share any Facebook recipe to Trackabite bot</span>
              </div>
              <div className="link-messenger-page__info-item">
                <span className="link-messenger-page__check">✓</span>
                <span>Recipe saved automatically to your account</span>
              </div>
              <div className="link-messenger-page__info-item">
                <span className="link-messenger-page__check">✓</span>
                <span>Never leave Facebook to save recipes</span>
              </div>
            </div>

            <button
              className="link-messenger-page__button link-messenger-page__button--primary"
              onClick={handleLink}
            >
              Connect Messenger
            </button>
          </div>
        );

      case 'linking':
        return (
          <div className="link-messenger-page__content">
            <div className="link-messenger-page__loading">
              <div className="link-messenger-page__spinner"></div>
              <p>Connecting your account...</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="link-messenger-page__content">
            <div className="link-messenger-page__icon link-messenger-page__icon--success">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h1>Connected!</h1>
            <p>Your Messenger is now connected to Trackabite. Just share any Facebook recipe post to the Trackabite bot to save it!</p>
            <p className="link-messenger-page__redirect">Redirecting back to Messenger...</p>
          </div>
        );

      case 'error':
        return (
          <div className="link-messenger-page__content">
            <div className="link-messenger-page__icon link-messenger-page__icon--error">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h1>Oops!</h1>
            <p>{error || 'Something went wrong. Please try again from Messenger.'}</p>
            <button
              className="link-messenger-page__button link-messenger-page__button--secondary"
              onClick={() => navigate('/home')}
            >
              Go to Home
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="link-messenger-page">
      <div className="link-messenger-page__container">
        {renderContent()}
      </div>
    </div>
  );
}

export default LinkMessengerPage;
