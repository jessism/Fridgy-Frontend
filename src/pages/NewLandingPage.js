import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import appLogo from '../assets/images/Logo.png';
import fridgeHeroImage from '../assets/images/fridge.jpg';
import foodImage1 from '../assets/images/Landingpage_food_1.jpg';
import foodImage2 from '../assets/images/Landingpage_food_2.jpg';
import foodImage3 from '../assets/images/Landingpage_food_3.jpg';
import phoneLeftImage from '../assets/product mockup/HomepageS_Step1.jpeg';
import phoneRightImage from '../assets/product mockup/Homepage_personalized recipes.jpeg';
import appleLogo from '../assets/icons/Apple_logo_white.svg.png';
import step1Image from '../assets/product mockup/HomepageS_Step1.jpeg';
import step2Image from '../assets/product mockup/Homepage_Step2.jpeg';
import step3Image from '../assets/product mockup/Homepage_Step3.jpeg';
import groceriesIcon from '../assets/icons/groceries.png';
import chefIcon from '../assets/icons/Smart chef.png';
import heartCheckIcon from '../assets/icons/Healthy.png';
import Button from '../components/Button';
import IOSInstallModal from '../components/IOSInstallModal';
import './NewLandingPage.css';

const NewLandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const totalTestimonials = 4;
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { isInstallable, isInstalled, platform, installApp } = usePWAInstall();

  // Check authentication and redirect if logged in
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      console.log('[Landing] User authenticated, redirecting to home...');
      navigate('/home');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % totalTestimonials);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  const handleGetStarted = async () => {
    // If already installed, go directly to onboarding
    if (isInstalled) {
      console.log('[PWA] App already installed, navigating to onboarding');
      navigate('/onboarding');
      return;
    }

    // iOS: Show instruction modal
    if (platform === 'ios') {
      console.log('[PWA] iOS detected, showing install instructions');
      setShowIOSModal(true);
      // Still navigate to onboarding after showing modal
      setTimeout(() => {
        navigate('/onboarding');
      }, 500);
      return;
    }

    // Android/Desktop: Try to show install prompt
    if (isInstallable) {
      console.log('[PWA] Showing install prompt');
      const result = await installApp();

      if (result.success) {
        console.log('[PWA] Install successful, navigating to onboarding');
        // Wait a moment for install to complete, then navigate
        setTimeout(() => {
          navigate('/onboarding');
        }, 1000);
      } else {
        console.log('[PWA] Install cancelled or failed, navigating to onboarding anyway');
        // User cancelled or error occurred, still allow them to continue
        navigate('/onboarding');
      }
    } else {
      // No install prompt available, just navigate
      console.log('[PWA] No install prompt available, navigating to onboarding');
      navigate('/onboarding');
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="landing-page-v2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="landing-page-v2">
      {/* Header */}
      <header className={`landing-page-v2__header ${isScrolled ? 'landing-page-v2__header--scrolled' : ''}`}>
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__header-content">
            <div className="landing-page-v2__logo-section">
              <img src={appLogo} alt="App logo" className="landing-page-v2__logo" />
              <span className="landing-page-v2__brand-name">Trackabite</span>
            </div>
            <div className="landing-page-v2__header-actions">
              <Button variant="secondary" size="medium" href="/signin">
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-page-v2__hero">
        <div className="landing-page-v2__hero-background">

          <div className="landing-page-v2__container">
            <div className="landing-page-v2__hero-content">
              {/* Left Column - Text Content */}
              <div className="landing-page-v2__hero-main">

                <h1 className="landing-page-v2__hero-title">
                  Food tracking that <span className="landing-page-v2__hero-title-gradient">remembers</span> for you.
                </h1>

                <p className="landing-page-v2__hero-subtitle">
                  Download Trackabite for effortless food tracking and a seamless inventory management experience.
                </p>

                <div className="landing-page-v2__cta-button-container">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleGetStarted}
                  >
                    GET STARTED FOR FREE
                  </Button>
                  <button
                    className="landing-page-v2__continue-link"
                    onClick={() => navigate('/onboarding')}
                  >
                    Continue in browser
                  </button>
                </div>

              </div>

              {/* Right Column - Phone Mockups */}
              <div className="landing-page-v2__hero-phones">
                <div className="landing-page-v2__phone-container">
                  {/* Left Phone with Frame */}
                  <div className="landing-page-v2__phone-mockup landing-page-v2__phone-mockup--left">
                    <div className="landing-page-v2__phone-frame">
                      <div className="landing-page-v2__phone-notch"></div>
                      <div className="landing-page-v2__phone-screen">
                        <img
                          src={phoneLeftImage}
                          alt="Trackabite - Add to Fridge"
                          className="landing-page-v2__phone-screenshot"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Phone with Frame */}
                  <div className="landing-page-v2__phone-mockup landing-page-v2__phone-mockup--right">
                    <div className="landing-page-v2__phone-frame">
                      <div className="landing-page-v2__phone-notch"></div>
                      <div className="landing-page-v2__phone-screen">
                        <img
                          src={phoneRightImage}
                          alt="Trackabite - Personalized Recipes"
                          className="landing-page-v2__phone-screenshot"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="landing-page-v2__solution-section">
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__solution-content">
            
            {/* Section Headline */}
            <h2 className="landing-page-v2__solution-headline">
              Your groceries, organized and ready.
            </h2>

            {/* Three Highlights */}
            <div className="landing-page-v2__highlights-grid">
              
              {/* Highlight 1 */}
              <div className="landing-page-v2__highlight-card landing-page-v2__highlight-card--track">
                <div className="landing-page-v2__highlight-icon">
                  <img src={groceriesIcon} alt="Groceries" className="landing-page-v2__highlight-icon-img" />
                </div>
                <h3 className="landing-page-v2__highlight-title">Your fridge.<br />In your pocket.</h3>
                <p className="landing-page-v2__highlight-description">
                  Know what's in your fridge. Anytime, anywhere.
                </p>
              </div>

              {/* Highlight 2 */}
              <div className="landing-page-v2__highlight-card landing-page-v2__highlight-card--know">
                <div className="landing-page-v2__highlight-icon">
                  <img src={chefIcon} alt="Chef" className="landing-page-v2__highlight-icon-img" />
                </div>
                <h3 className="landing-page-v2__highlight-title">Brain off. Chef on.</h3>
                <p className="landing-page-v2__highlight-description">
                  Get smart recipes based on what's on hand and your preferences.
                </p>
              </div>

              {/* Highlight 3 */}
              <div className="landing-page-v2__highlight-card landing-page-v2__highlight-card--reduce">
                <div className="landing-page-v2__highlight-icon">
                  <img src={heartCheckIcon} alt="Save" className="landing-page-v2__highlight-icon-img" />
                </div>
                <h3 className="landing-page-v2__highlight-title">Waste less. Save more.</h3>
                <p className="landing-page-v2__highlight-description">
                  Keep track of every bite, so nothing gets forgotten.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps Section */}
      <section className="landing-page-v2__steps-section">
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__steps-content">

            {/* Section Title */}
            <h2 className="landing-page-v2__steps-title">
              Plan smarter, eat smarter<br />
              in 3 simple steps
            </h2>

            {/* Steps Grid */}
            <div className="landing-page-v2__steps-grid">

              {/* Step 1 */}
              <div className="landing-page-v2__step landing-page-v2__step--1">
                <div className="landing-page-v2__step-image">
                  <div className="landing-page-v2__step-phone-frame">
                    <div className="landing-page-v2__step-phone-notch"></div>
                    <div className="landing-page-v2__step-phone-screen">
                      <img src={step1Image} alt="Track your inventory" className="landing-page-v2__step-phone" />
                    </div>
                  </div>
                </div>
                <div className="landing-page-v2__step-content">
                  <span className="landing-page-v2__step-number">Step 1.</span>
                  <h3 className="landing-page-v2__step-heading">Track your inventory</h3>
                  <p className="landing-page-v2__step-description">
                    Snap a photo of your groceries and let AI do the rest. Know exactly what's in your fridge and when items expire.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="landing-page-v2__step landing-page-v2__step--2">
                <div className="landing-page-v2__step-content">
                  <span className="landing-page-v2__step-number">Step 2.</span>
                  <h3 className="landing-page-v2__step-heading">Save recipes from anywhere</h3>
                  <p className="landing-page-v2__step-description">
                    Import your favorite recipes directly from Instagram and TikTok. Build your personal recipe collection effortlessly.
                  </p>
                </div>
                <div className="landing-page-v2__step-image">
                  <div className="landing-page-v2__step-phone-frame">
                    <div className="landing-page-v2__step-phone-notch"></div>
                    <div className="landing-page-v2__step-phone-screen">
                      <img src={step2Image} alt="Save recipes from anywhere" className="landing-page-v2__step-phone" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="landing-page-v2__step landing-page-v2__step--3">
                <div className="landing-page-v2__step-image">
                  <div className="landing-page-v2__step-phone-frame">
                    <div className="landing-page-v2__step-phone-notch"></div>
                    <div className="landing-page-v2__step-phone-screen">
                      <img src={step3Image} alt="Get personalized recipes" className="landing-page-v2__step-phone" />
                    </div>
                  </div>
                </div>
                <div className="landing-page-v2__step-content">
                  <span className="landing-page-v2__step-number">Step 3.</span>
                  <h3 className="landing-page-v2__step-heading">Get personalized recipes</h3>
                  <p className="landing-page-v2__step-description">
                    Generate custom meal ideas based on what's already in your fridge. Cook smarter, waste less.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Feature 2 Section */}
      <section className="landing-page-v2__feature-2">
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__feature-2-content">

            {/* Feature 2 - Centered Headline */}
            <div className="landing-page-v2__feature-2-header">
              <h2 className="landing-page-v2__feature-2-headline">
                No more wonder "What's for dinner"
              </h2>
              <p className="landing-page-v2__feature-2-description">
                Get personalized recipe suggestions based on what's already in your fridge. Smart meal planning that saves time and reduces waste.
              </p>
            </div>

            {/* Feature 2 - Two Big Images */}
            <div className="landing-page-v2__feature-2-images">
              <div className="landing-page-v2__feature-2-image-left">
                <img
                  src={foodImage1}
                  alt="Recipe suggestions based on fridge contents"
                  className="landing-page-v2__feature-2-img"
                />
              </div>
              <div className="landing-page-v2__feature-2-image-right">
                <img
                  src={foodImage2}
                  alt="Smart meal planning and organization"
                  className="landing-page-v2__feature-2-img"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature 3 Section */}
      <section className="landing-page-v2__feature-3">
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__feature-3-content">

            {/* Feature 3 - Top Content: Two Column Layout */}
            <div className="landing-page-v2__feature-3-top">

              {/* Feature 3 - Left Column: Content */}
              <div className="landing-page-v2__feature-3-info">
                <p className="landing-page-v2__feature-3-description">
                  Never miss expiration dates again. Get timely notifications about items nearing their expiry so you can use them before they go bad.
                </p>
              </div>

              {/* Feature 3 - Right Column: Headline */}
              <div className="landing-page-v2__feature-3-headline">
                <h2>Smart expiry reminders</h2>
              </div>

            </div>

            {/* Feature 3 - Bottom: Hero Image */}
            <div className="landing-page-v2__feature-3-image">
              <img
                src={foodImage3}
                alt="Smart expiry tracking and notifications"
                className="landing-page-v2__feature-3-hero-img"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Feature 1 Section */}
      <section className="landing-page-v2__feature-1">
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__feature-1-content">

            {/* Feature 1 - Top Content: Two Column Layout */}
            <div className="landing-page-v2__feature-1-top">

              {/* Feature 1 - Left Column: Headline */}
              <div className="landing-page-v2__feature-1-headline">
                <h2>Shop smarter together.</h2>
              </div>

              {/* Feature 1 - Right Column: Content */}
              <div className="landing-page-v2__feature-1-info">
                <p className="landing-page-v2__feature-1-description">
                  Share your shopping list with family in real-time. Everyone stays synced, no duplicate purchases, and grocery trips become a breeze. Collaborate effortlessly and never forget an item again.
                </p>
                <Button variant="secondary" size="medium" href="/signup">
                  Get Started
                </Button>
              </div>

            </div>

            {/* Feature 1 - Bottom: Hero Image */}
            <div className="landing-page-v2__feature-1-image">
              <img
                src={fridgeHeroImage}
                alt="Smart fridge with organized food items"
                className="landing-page-v2__feature-1-hero-img"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="landing-page-v2__testimonial">
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__testimonial-content">
            
            {/* Testimonial Header */}
            <div className="landing-page-v2__testimonial-header">
              <h2 className="landing-page-v2__testimonial-headline">
                What <span className="landing-page-v2__testimonial-highlight">Our Users</span> Say
              </h2>
              <p className="landing-page-v2__testimonial-description">
                Hear from families who transformed their kitchen experience
              </p>
            </div>

            {/* Testimonial Carousel */}
            <div className="landing-page-v2__testimonial-carousel">
              <div 
                className="landing-page-v2__testimonial-track"
                style={{
                  transform: `translateX(-${currentTestimonial * (100 / 3)}%)`
                }}
              >
                
                {/* Testimonial 1 */}
                <div className="landing-page-v2__testimonial-card">
                  <div className="landing-page-v2__testimonial-stars">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="landing-page-v2__testimonial-text">
                    "Trackabite has completely changed how we manage our kitchen. No more forgotten leftovers or expired food. We've saved so much money and reduced waste significantly!"
                  </p>
                  <div className="landing-page-v2__testimonial-author">
                    <img src="https://i.pravatar.cc/60?img=1" alt="Sarah Chen" className="landing-page-v2__testimonial-avatar" />
                    <div className="landing-page-v2__testimonial-info">
                      <h4 className="landing-page-v2__testimonial-name">Sarah Chen</h4>
                      <p className="landing-page-v2__testimonial-role">Busy Mom of 3</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="landing-page-v2__testimonial-card">
                  <div className="landing-page-v2__testimonial-stars">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="landing-page-v2__testimonial-text">
                    "The smart notifications are incredible! I actually used up all my vegetables before they went bad for the first time ever. My grocery bill has dropped 30%."
                  </p>
                  <div className="landing-page-v2__testimonial-author">
                    <img src="https://i.pravatar.cc/60?img=2" alt="Mike Rodriguez" className="landing-page-v2__testimonial-avatar" />
                    <div className="landing-page-v2__testimonial-info">
                      <h4 className="landing-page-v2__testimonial-name">Mike Rodriguez</h4>
                      <p className="landing-page-v2__testimonial-role">College Student</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div className="landing-page-v2__testimonial-card">
                  <div className="landing-page-v2__testimonial-stars">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="landing-page-v2__testimonial-text">
                    "As someone who meal preps religiously, this app is a game-changer. I can track everything I've prepared and never worry about food safety again."
                  </p>
                  <div className="landing-page-v2__testimonial-author">
                    <img src="https://i.pravatar.cc/60?img=3" alt="Emily Watson" className="landing-page-v2__testimonial-avatar" />
                    <div className="landing-page-v2__testimonial-info">
                      <h4 className="landing-page-v2__testimonial-name">Emily Watson</h4>
                      <p className="landing-page-v2__testimonial-role">Fitness Enthusiast</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 4 */}
                <div className="landing-page-v2__testimonial-card">
                  <div className="landing-page-v2__testimonial-stars">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="landing-page-v2__testimonial-text">
                    "My husband and I were constantly arguing about what food we had. Now we both can check the app and meal planning is so much easier!"
                  </p>
                  <div className="landing-page-v2__testimonial-author">
                    <img src="https://i.pravatar.cc/60?img=4" alt="Jennifer Kim" className="landing-page-v2__testimonial-avatar" />
                    <div className="landing-page-v2__testimonial-info">
                      <h4 className="landing-page-v2__testimonial-name">Jennifer Kim</h4>
                      <p className="landing-page-v2__testimonial-role">Working Professional</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Navigation Arrows */}
              <button 
                className="landing-page-v2__testimonial-nav landing-page-v2__testimonial-nav--prev"
                onClick={prevTestimonial}
              >
                &#8249;
              </button>
              <button 
                className="landing-page-v2__testimonial-nav landing-page-v2__testimonial-nav--next"
                onClick={nextTestimonial}
              >
                &#8250;
              </button>

              {/* Dots Indicator */}
              <div className="landing-page-v2__testimonial-dots">
                {[...Array(totalTestimonials)].map((_, index) => (
                  <span 
                    key={index}
                    className={`landing-page-v2__testimonial-dot ${
                      index === currentTestimonial ? 'landing-page-v2__testimonial-dot--active' : ''
                    }`}
                    onClick={() => goToTestimonial(index)}
                  ></span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* iOS Install Modal */}
      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </div>
  );
};

export default NewLandingPage;