import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCookbooks from '../hooks/useCookbooks';
import './JoinCookbook.css';

const JoinCookbook = () => {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const { joinCookbook } = useCookbooks();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cookbookInfo, setCookbookInfo] = useState(null);
  const [limitExceeded, setLimitExceeded] = useState(false);

  useEffect(() => {
    const handleJoinCookbook = async () => {
      if (!shareCode) {
        setError('Invalid share code');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const result = await joinCookbook(shareCode);

        if (result.success) {
          setSuccess(true);
          setCookbookInfo(result.cookbook);

          // Redirect to cookbook after a brief success message
          setTimeout(() => {
            navigate(`/cookbook/${result.cookbook.id}`);
          }, 2000);
        }
      } catch (err) {
        if (err.limitExceeded) {
          setLimitExceeded(true);
          setError(`You've reached your limit of ${err.limit} joined cookbooks. Upgrade to premium for unlimited shared cookbooks.`);
        } else {
          setError(err.message || 'Failed to join cookbook. Please check the share code and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    handleJoinCookbook();
  }, [shareCode, joinCookbook, navigate]);

  const handleRetry = () => {
    setError('');
    setLoading(true);
    window.location.reload();
  };

  const handleGoToCookbooks = () => {
    navigate('/meals/recipes');
  };

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <div className="join-cookbook">
      <div className="join-cookbook__container">
        <div className="join-cookbook__content">
          {loading && (
            <>
              <div className="join-cookbook__icon">📚</div>
              <h1 className="join-cookbook__title">Joining Cookbook...</h1>
              <p className="join-cookbook__message">
                Please wait while we add you to the shared cookbook.
              </p>
              <div className="join-cookbook__loading">
                <div className="join-cookbook__spinner"></div>
              </div>
            </>
          )}

          {success && (
            <>
              <div className="join-cookbook__icon">✅</div>
              <h1 className="join-cookbook__title">Successfully Joined!</h1>
              <p className="join-cookbook__message">
                You've been added to "{cookbookInfo?.name}" cookbook.
              </p>
              <p className="join-cookbook__redirect">
                Redirecting you to the cookbook...
              </p>
              <button
                className="join-cookbook__button"
                onClick={() => navigate(`/cookbook/${cookbookInfo?.id}`)}
              >
                Go to Cookbook
              </button>
            </>
          )}

          {error && (
            <>
              <div className="join-cookbook__icon">{limitExceeded ? '🔒' : '❌'}</div>
              <h1 className="join-cookbook__title">
                {limitExceeded ? 'Limit Reached' : 'Unable to Join Cookbook'}
              </h1>
              <p className="join-cookbook__message">
                {error}
              </p>
              <div className="join-cookbook__actions">
                {limitExceeded ? (
                  <>
                    <button
                      className="join-cookbook__button join-cookbook__button--primary"
                      onClick={handleUpgrade}
                    >
                      Upgrade to Premium
                    </button>
                    <button
                      className="join-cookbook__button join-cookbook__button--secondary"
                      onClick={handleGoToCookbooks}
                    >
                      Go to My Cookbooks
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="join-cookbook__button join-cookbook__button--primary"
                      onClick={handleRetry}
                    >
                      Try Again
                    </button>
                    <button
                      className="join-cookbook__button join-cookbook__button--secondary"
                      onClick={handleGoToCookbooks}
                    >
                      Go to My Cookbooks
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="join-cookbook__help">
          <h3>Having trouble?</h3>
          <ul>
            <li>Make sure you have a Trackabite account and are signed in</li>
            <li>Check that the share code is correct</li>
            <li>Ask the cookbook owner to reshare if the code has expired</li>
            <li>Free accounts can join 1 shared cookbook</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinCookbook;
