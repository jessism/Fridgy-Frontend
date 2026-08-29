import React from 'react';

const ErrorState = ({ children, onRetry }) => (
  <div className="ad-error">
    {children}
    {onRetry && (
      <>
        {' '}
        <button type="button" className="ad-btn" onClick={onRetry} style={{ marginLeft: 8 }}>
          Retry
        </button>
      </>
    )}
  </div>
);

export default ErrorState;
