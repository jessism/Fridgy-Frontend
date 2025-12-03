import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import appLogo from '../assets/images/Logo.png';
import phoneLeftImage from '../assets/product mockup/HomepageS_Step1.jpeg';
import phoneRightImage from '../assets/product mockup/Homepage_personalized recipes.jpeg';
import step1Image from '../assets/product mockup/HomepageS_Step1.jpeg';
import step2Image from '../assets/product mockup/Homepage_Step2.jpeg';
import step3Image from '../assets/product mockup/Homepage_Step3.jpeg';
import './NewLandingPage2.css';

const NewLandingPage2 = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Check authentication and redirect if logged in
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      console.log('[Landing2] User authenticated, redirecting to home...');
      navigate('/home');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleGetStarted = () => {
    console.log('[Landing2] Navigating to onboarding');
    navigate('/onboarding');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="landing-page-v3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="landing-page-v3">
      {/* Header */}
      <header className="landing-page-v3__header">
        <div className="landing-page-v3__logo-section">
          <img src={appLogo} alt="Trackabite logo" className="landing-page-v3__logo" />
          <span className="landing-page-v3__brand-name">Trackabite</span>
        </div>
        <div className="landing-page-v3__header-actions">
          <Link to="/" className="landing-page-v3__design-toggle">
            <span className="landing-page-v3__design-toggle-text">Back to Original</span>
            <svg className="landing-page-v3__design-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link to="/signin" className="landing-page-v3__signin-btn">
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-page-v3__hero">
        {/* Giant Background Text */}
        <div className="landing-page-v3__bg-text">
          <h1 className="landing-page-v3__bg-text-line">SMART RECIPE</h1>
          <h1 className="landing-page-v3__bg-text-line landing-page-v3__bg-text-line--second">MANAGEMENT</h1>
        </div>

        {/* Subtitle and CTA - centered below title */}
        <div className="landing-page-v3__hero-cta">
          <p className="landing-page-v3__hero-subtitle">
            Track your inventory and get AI-powered recipe suggestions
          </p>
          <button className="landing-page-v3__cta-btn" onClick={handleGetStarted}>
            GET STARTED FOR FREE
          </button>
        </div>

        {/* Index Number */}
        <span className="landing-page-v3__index">(01)</span>

        {/* Year */}
        <span className="landing-page-v3__year">2024</span>

        {/* Phones Row - Tagline on left, Phones in center */}
        <div className="landing-page-v3__phones-row">
          {/* Left - Tagline */}
          <div className="landing-page-v3__bottom-left">
            <h2 className="landing-page-v3__tagline">
              <span className="landing-page-v3__tagline-line1">Saving your</span>
              <span className="landing-page-v3__tagline-line2">cooking time</span>
              <span className="landing-page-v3__tagline-line3">by 10x</span>
            </h2>
          </div>

          {/* Phone Mockups */}
          <div className="landing-page-v3__phones">
            <div className="landing-page-v3__phone landing-page-v3__phone--left">
              <div className="landing-page-v3__phone-frame">
                <div className="landing-page-v3__phone-notch"></div>
                <div className="landing-page-v3__phone-screen">
                  <img
                    src={phoneLeftImage}
                    alt="Trackabite - Inventory tracking"
                    className="landing-page-v3__phone-img"
                  />
                </div>
              </div>
            </div>

            <div className="landing-page-v3__phone landing-page-v3__phone--right">
              <div className="landing-page-v3__phone-frame">
                <div className="landing-page-v3__phone-notch"></div>
                <div className="landing-page-v3__phone-screen">
                  <img
                    src={phoneRightImage}
                    alt="Trackabite - AI Recipes"
                    className="landing-page-v3__phone-img"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Feature Callout */}
          <div className="landing-page-v3__bottom-right">
            <div className="landing-page-v3__feature-callout">
              <p className="landing-page-v3__feature-text">
                Reduce food waste and save money with smart expiration tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section - Sticky Scroll */}
      <section className="landing-page-v3__steps-section">
        {/* Section Title */}
        <div className="landing-page-v3__steps-header">
          <h2 className="landing-page-v3__steps-title">
            Plan smarter, eat smarter<br />
            in 3 simple steps
          </h2>
        </div>

        {/* Sticky Slides Container */}
        <div className="landing-page-v3__steps-sticky-container">
          {/* Step 1 - Sticky Slide */}
          <div className="landing-page-v3__step-slide">
            <div className="landing-page-v3__step-slide-content">
              <div className="landing-page-v3__step-image">
                <div className="landing-page-v3__step-phone-frame">
                  <div className="landing-page-v3__step-phone-notch"></div>
                  <div className="landing-page-v3__step-phone-screen">
                    <img src={step1Image} alt="Track your inventory" className="landing-page-v3__step-phone" />
                  </div>
                </div>
              </div>
              <div className="landing-page-v3__step-content">
                <span className="landing-page-v3__step-number">Step 1.</span>
                <h3 className="landing-page-v3__step-heading">Track your inventory</h3>
                <p className="landing-page-v3__step-description">
                  Snap a photo of your groceries and let AI do the rest. Know exactly what's in your fridge and when items expire.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 - Sticky Slide */}
          <div className="landing-page-v3__step-slide landing-page-v3__step-slide--reverse">
            <div className="landing-page-v3__step-slide-content">
              <div className="landing-page-v3__step-content">
                <span className="landing-page-v3__step-number">Step 2.</span>
                <h3 className="landing-page-v3__step-heading">Save recipes from anywhere</h3>
                <p className="landing-page-v3__step-description">
                  Import your favorite recipes directly from Instagram and TikTok. Build your personal recipe collection effortlessly.
                </p>
              </div>
              <div className="landing-page-v3__step-image">
                <div className="landing-page-v3__step-phone-frame">
                  <div className="landing-page-v3__step-phone-notch"></div>
                  <div className="landing-page-v3__step-phone-screen">
                    <img src={step2Image} alt="Save recipes from anywhere" className="landing-page-v3__step-phone" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Sticky Slide */}
          <div className="landing-page-v3__step-slide">
            <div className="landing-page-v3__step-slide-content">
              <div className="landing-page-v3__step-image">
                <div className="landing-page-v3__step-phone-frame">
                  <div className="landing-page-v3__step-phone-notch"></div>
                  <div className="landing-page-v3__step-phone-screen">
                    <img src={step3Image} alt="Get personalized recipes" className="landing-page-v3__step-phone" />
                  </div>
                </div>
              </div>
              <div className="landing-page-v3__step-content">
                <span className="landing-page-v3__step-number">Step 3.</span>
                <h3 className="landing-page-v3__step-heading">Get personalized recipes</h3>
                <p className="landing-page-v3__step-description">
                  Generate custom meal ideas based on what's already in your fridge. Cook smarter, waste less.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewLandingPage2;
