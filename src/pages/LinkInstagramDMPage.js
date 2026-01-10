import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './LinkInstagramDMPage.css';

function LinkInstagramDMPage() {
  const [status, setStatus] = useState('checking'); // checking, login_required, ready, linking, success, error
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const igsid = searchParams.get('igsid');
  const token = searchParams.get('token');

  useEffect(() => {
    // Check if we have required params
    if (!igsid || !token) {
      setStatus('error');
      setError('Missing linking parameters. Please try again from Instagram.');
      return;
    }

    // Check if user is logged in
    const authToken = localStorage.getItem('fridgy_token');
    if (!authToken) {
      setStatus('login_required');
      return;
    }

    setStatus('ready');
  }, [igsid, token]);

  const handleLogin = () => {
    // Save the current URL to redirect back after login
    const returnUrl = `/link-instagram-dm?igsid=${igsid}&token=${token}`;
    sessionStorage.setItem('redirectAfterSignin', returnUrl);
    navigate('/signin');
  };

  const handleSignUp = () => {
    // Save the current URL to redirect back after signup
    const returnUrl = `/link-instagram-dm?igsid=${igsid}&token=${token}`;
    sessionStorage.setItem('redirectAfterSignup', returnUrl);
    navigate('/signup');
  };

  const handleLink = async () => {
    setStatus('linking');
    setError(null);

    try {
      const authToken = localStorage.getItem('fridgy_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${apiUrl}/instagram-dm/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ igsid, token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link account');
      }

      setStatus('success');

      // Redirect back to Instagram after 3 seconds
      setTimeout(() => {
        // Try to open Instagram app
        window.location.href = 'https://instagram.com/direct/inbox/';
      }, 3000);

    } catch (err) {
      console.error('[LinkInstagramDM] Error:', err);
      setStatus('error');
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  // Instagram icon SVG
  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="link-instagram-dm-page__loading">
            <div className="link-instagram-dm-page__spinner"></div>
            <p>Loading...</p>
          </div>
        );

      case 'login_required':
        return (
          <div className="link-instagram-dm-page__content">
            <div className="link-instagram-dm-page__icon">
              <InstagramIcon />
            </div>
            <h1>Connect Instagram</h1>
            <p>Sign in to your Trackabite account to connect Instagram and start saving recipes!</p>

            <div className="link-instagram-dm-page__actions">
              <button
                className="link-instagram-dm-page__button link-instagram-dm-page__button--primary"
                onClick={handleLogin}
              >
                Sign In
              </button>
              <button
                className="link-instagram-dm-page__button link-instagram-dm-page__button--secondary"
                onClick={handleSignUp}
              >
                Create Account
              </button>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="link-instagram-dm-page__content">
            <div className="link-instagram-dm-page__icon link-instagram-dm-page__icon--instagram">
              <InstagramIcon />
            </div>
            <h1>Connect Instagram</h1>
            <p>Connect your Instagram to save recipes directly to your Trackabite account via DM.</p>

            <div className="link-instagram-dm-page__info">
              <div className="link-instagram-dm-page__info-item">
                <span className="link-instagram-dm-page__check">✓</span>
                <span>Share any Instagram recipe to Trackabite via DM</span>
              </div>
              <div className="link-instagram-dm-page__info-item">
                <span className="link-instagram-dm-page__check">✓</span>
                <span>Recipe saved automatically to your account</span>
              </div>
              <div className="link-instagram-dm-page__info-item">
                <span className="link-instagram-dm-page__check">✓</span>
                <span>Never leave Instagram to save recipes</span>
              </div>
            </div>

            <button
              className="link-instagram-dm-page__button link-instagram-dm-page__button--primary"
              onClick={handleLink}
            >
              Connect Instagram
            </button>
          </div>
        );

      case 'linking':
        return (
          <div className="link-instagram-dm-page__content">
            <div className="link-instagram-dm-page__loading">
              <div className="link-instagram-dm-page__spinner"></div>
              <p>Connecting your account...</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="link-instagram-dm-page__content">
            <div className="link-instagram-dm-page__icon link-instagram-dm-page__icon--success">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h1>Connected!</h1>
            <p>Your Instagram is now connected to Trackabite. Just share any Instagram recipe post to us via DM to save it!</p>
            <p className="link-instagram-dm-page__redirect">Redirecting back to Instagram...</p>
          </div>
        );

      case 'error':
        return (
          <div className="link-instagram-dm-page__content">
            <div className="link-instagram-dm-page__icon link-instagram-dm-page__icon--error">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h1>Oops!</h1>
            <p>{error || 'Something went wrong. Please try again from Instagram.'}</p>
            <button
              className="link-instagram-dm-page__button link-instagram-dm-page__button--secondary"
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
    <div className="link-instagram-dm-page">
      <div className="link-instagram-dm-page__container">
        {renderContent()}
      </div>
    </div>
  );
}

export default LinkInstagramDMPage;
