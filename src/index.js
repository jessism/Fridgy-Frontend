import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react';

// Initialize PostHog only in production
if (process.env.NODE_ENV === 'production') {
  posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
    autocapture: true, // Enable automatic event tracking
    capture_pageview: true, // Track page views
    capture_pageleave: true, // Track when users leave pages
    person_profiles: 'identified_only', // Only create profiles for identified users
    session_recording: {
      maskAllInputs: true, // Privacy: mask all input fields
      maskTextSelector: '*' // Privacy: mask all text content
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register service worker for PWA functionality and push notifications
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      console.log('New app version available!');
    },
    onSuccess: (registration) => {
      console.log('App is ready for offline use!');
    }
  });
} else {
  // Disable service worker in development
  serviceWorkerRegistration.unregister();
}
