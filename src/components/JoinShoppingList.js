import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShoppingLists from '../hooks/useShoppingLists';
import './JoinShoppingList.css';

const JoinShoppingList = () => {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const { joinList } = useShoppingLists();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [listInfo, setListInfo] = useState(null);

  useEffect(() => {
    const handleJoinList = async () => {
      if (!shareCode) {
        setError('Invalid share code');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const result = await joinList(shareCode);

        if (result.success) {
          setSuccess(true);
          setListInfo(result.list);

          // Redirect to shopping list after a brief success message
          setTimeout(() => {
            navigate('/inventory/shopping-list');
          }, 2000);
        }
      } catch (err) {
        setError(err.message || 'Failed to join shopping list. Please check the share code and try again.');
      } finally {
        setLoading(false);
      }
    };

    handleJoinList();
  }, [shareCode, joinList, navigate]);

  const handleRetry = () => {
    setError('');
    setLoading(true);
    // Re-trigger the effect by navigating to the same route
    window.location.reload();
  };

  const handleGoToLists = () => {
    navigate('/inventory/shopping-list');
  };

  return (
    <div className="join-shopping-list">
      <div className="join-shopping-list__container">
        <div className="join-shopping-list__content">
          {loading && (
            <>
              <div className="join-shopping-list__icon">🔗</div>
              <h1 className="join-shopping-list__title">Joining Shopping List...</h1>
              <p className="join-shopping-list__message">
                Please wait while we add you to the shared list.
              </p>
              <div className="join-shopping-list__loading">
                <div className="join-shopping-list__spinner"></div>
              </div>
            </>
          )}

          {success && (
            <>
              <div className="join-shopping-list__icon">✅</div>
              <h1 className="join-shopping-list__title">Successfully Joined!</h1>
              <p className="join-shopping-list__message">
                You've been added to "{listInfo?.name}" shopping list.
              </p>
              <p className="join-shopping-list__redirect">
                Redirecting you to your shopping lists...
              </p>
              <button
                className="join-shopping-list__button"
                onClick={handleGoToLists}
              >
                Go to Shopping Lists
              </button>
            </>
          )}

          {error && (
            <>
              <div className="join-shopping-list__icon">❌</div>
              <h1 className="join-shopping-list__title">Unable to Join List</h1>
              <p className="join-shopping-list__message">
                {error}
              </p>
              <div className="join-shopping-list__actions">
                <button
                  className="join-shopping-list__button join-shopping-list__button--primary"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
                <button
                  className="join-shopping-list__button join-shopping-list__button--secondary"
                  onClick={handleGoToLists}
                >
                  Go to My Lists
                </button>
              </div>
            </>
          )}
        </div>

        <div className="join-shopping-list__help">
          <h3>Having trouble?</h3>
          <ul>
            <li>Make sure you have a Trackabite account and are signed in</li>
            <li>Check that the share code is correct</li>
            <li>Ask the list owner to reshare the list if the code has expired</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinShoppingList;