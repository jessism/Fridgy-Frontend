import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import appLogo from '../assets/images/Logo.png';
import phoneLeftImage from '../assets/product mockup/HomepageS_Step1.jpeg';
import phoneRightImage from '../assets/product mockup/Homepage_personalized recipes.jpeg';
import step1Image from '../assets/product mockup/HomepageS_Step1.jpeg';
import step2Image from '../assets/product mockup/Homepage_Step2.jpeg';
import step3Image from '../assets/product mockup/Homepage_Step3.jpeg';
import sharedListImage from '../assets/product mockup/Share_List_People.png';
import googleCalendarIcon from '../assets/icons/Google calendar.png';
import appleCalendarIcon from '../assets/icons/Apple Calendar.png';
import './NewLandingPage2.css';

const NewLandingPage2 = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const totalTestimonials = 10;
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const cardsVisible = 3;
  const maxPosition = totalTestimonials - cardsVisible;

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => Math.min(prev + 1, maxPosition));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => Math.max(prev - 1, 0));
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(Math.min(index, maxPosition));
  };

  // Check authentication and redirect if logged in
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      console.log('[Landing2] User authenticated, redirecting to home...');
      navigate('/home');
    }
  }, [loading, isAuthenticated, navigate]);

  // Handle scroll to change header background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header className={`landing-page-v3__header ${isScrolled ? 'landing-page-v3__header--scrolled' : ''}`}>
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
          <h1 className="landing-page-v3__bg-text-line">YOUR DINNER JUST</h1>
          <h1 className="landing-page-v3__bg-text-line landing-page-v3__bg-text-line--second">GOT WAY EASIER.</h1>
        </div>

        {/* Subtitle and CTA - centered below title */}
        <div className="landing-page-v3__hero-cta">
          <p className="landing-page-v3__hero-subtitle">
            Save recipes, track what you've got, and let AI do the thinking.
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
              <span className="landing-page-v3__tagline-line1">Get dinner ideas</span>
              <span className="landing-page-v3__tagline-line2">in <em>seconds.</em></span>
            </h2>
            <p className="landing-page-v3__tagline-subtitle">
              Track, cook, and shop without the mental overload.
            </p>
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
                Track, cook, and shop without the mental overload.
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
            <div className="landing-page-v3__step-slide-container">
              <div className="landing-page-v3__step-slide-content">
                <div className="landing-page-v3__step-content">
                  <span className="landing-page-v3__step-number">Step 1.</span>
                  <h3 className="landing-page-v3__step-heading">Track your inventory</h3>
                  <p className="landing-page-v3__step-description">
                    Snap a photo of your groceries and let AI do the rest. Know exactly what's in your fridge and when items expire.
                  </p>
                </div>
                <div className="landing-page-v3__step-image landing-page-v3__step-image--overflow">
                  <div className="landing-page-v3__step-phone-frame landing-page-v3__step-phone-frame--transparent">
                    <div className="landing-page-v3__step-phone-screen">
                      <img src={step1Image} alt="Track your inventory" className="landing-page-v3__step-phone" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 - Sticky Slide */}
          <div className="landing-page-v3__step-slide">
            <div className="landing-page-v3__step-slide-container landing-page-v3__step-slide-container--pink">
              <div className="landing-page-v3__step-slide-content">
                <div className="landing-page-v3__step-content">
                  <span className="landing-page-v3__step-number">Step 2.</span>
                  <h3 className="landing-page-v3__step-heading">Save recipes from anywhere</h3>
                  <p className="landing-page-v3__step-description">
                    Import your favorite recipes directly from Instagram and TikTok. Build your personal recipe collection effortlessly.
                  </p>
                </div>
                <div className="landing-page-v3__step-image landing-page-v3__step-image--overflow">
                  <div className="landing-page-v3__step-phone-frame landing-page-v3__step-phone-frame--transparent">
                    <div className="landing-page-v3__step-phone-screen">
                      <img src={step2Image} alt="Save recipes from anywhere" className="landing-page-v3__step-phone" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Sticky Slide */}
          <div className="landing-page-v3__step-slide">
            <div className="landing-page-v3__step-slide-container landing-page-v3__step-slide-container--green">
              <div className="landing-page-v3__step-slide-content">
                <div className="landing-page-v3__step-content">
                  <span className="landing-page-v3__step-number">Step 3.</span>
                  <h3 className="landing-page-v3__step-heading">Get personalized recipes</h3>
                  <p className="landing-page-v3__step-description">
                    Generate custom meal ideas based on what's already in your fridge. Cook smarter, waste less.
                  </p>
                </div>
                <div className="landing-page-v3__step-image landing-page-v3__step-image--overflow">
                  <div className="landing-page-v3__step-phone-frame landing-page-v3__step-phone-frame--transparent">
                    <div className="landing-page-v3__step-phone-screen">
                      <img src={step3Image} alt="Get personalized recipes" className="landing-page-v3__step-phone" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Shared Background */}
      <section className="landing-page-v3__features-section">
        {/* Meal Planning */}
        <div className="landing-page-v3__feature-block">
          <div className="landing-page-v3__feature-block-content">
            <div className="landing-page-v3__feature-phone">
              <div className="landing-page-v3__feature-phone-frame">
                <div className="landing-page-v3__feature-phone-notch"></div>
                <div className="landing-page-v3__feature-phone-screen">
                  <img src={step3Image} alt="Meal planning" className="landing-page-v3__feature-phone-img" />
                </div>
              </div>
            </div>
            <div className="landing-page-v3__feature-text">
              <h2 className="landing-page-v3__feature-heading">
                Meal<br />
                planning<br />
                made easy
              </h2>
              <p className="landing-page-v3__feature-description">
                Plan your whole week in minutes and view it anytime, anywhere.
              </p>
              <button className="landing-page-v3__feature-cta" onClick={() => navigate('/register')}>
                GET STARTED FOR FREE
              </button>
            </div>
          </div>
        </div>

        {/* Stay Connected Section */}
        <div className="landing-page-v3__feature-block landing-page-v3__feature-block--grid">
          <h2 className="landing-page-v3__feature-block-title">Always stay connected.</h2>

          <div className="landing-page-v3__feature-cards">
            {/* Left Card - Expiry Reminders */}
            <div className="landing-page-v3__feature-card">
              <h3 className="landing-page-v3__feature-card-title">Get expiry reminders</h3>
              <p className="landing-page-v3__feature-card-description">
                Never miss expiration dates again. Get timely notifications about items nearing their expiry.
              </p>
              <div className="landing-page-v3__feature-card-phone">
                <div className="landing-page-v3__feature-phone-frame">
                  <div className="landing-page-v3__feature-phone-notch"></div>
                  <div className="landing-page-v3__feature-phone-screen">
                    <img src={step1Image} alt="Expiry reminders" className="landing-page-v3__feature-phone-img" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card - Calendar Integration */}
            <div className="landing-page-v3__feature-card">
              <h3 className="landing-page-v3__feature-card-title">Connect to your Google or iCalendar</h3>
              <p className="landing-page-v3__feature-card-description">
                Sync your meal plans directly to your calendar. Never forget what's for dinner.
              </p>
              <div className="landing-page-v3__calendar-icons">
                <img src={googleCalendarIcon} alt="Google Calendar" className="landing-page-v3__calendar-icon" />
                <img src={appleCalendarIcon} alt="Apple Calendar" className="landing-page-v3__calendar-icon" />
              </div>
              <div className="landing-page-v3__feature-card-phone">
                <div className="landing-page-v3__feature-phone-frame">
                  <div className="landing-page-v3__feature-phone-notch"></div>
                  <div className="landing-page-v3__feature-phone-screen">
                    <img src={step3Image} alt="Calendar integration" className="landing-page-v3__feature-phone-img" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Smarter Together */}
        <div className="landing-page-v3__feature-block landing-page-v3__feature-block--wide">
          <h2 className="landing-page-v3__feature-block-title">Shop smarter together.</h2>
          <p className="landing-page-v3__feature-block-subtitle">
            Share your shopping list with family in real-time. Everyone stays synced, no duplicate purchases, and grocery trips become a breeze.
          </p>
          <div className="landing-page-v3__feature-wide-image">
            <img src={sharedListImage} alt="Shop smarter together" />
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="landing-page-v3__testimonial">
        <div className="landing-page-v3__testimonial-content">

          {/* Testimonial Header */}
          <div className="landing-page-v3__testimonial-header">
            <h2 className="landing-page-v3__testimonial-headline">
              What <span className="landing-page-v3__testimonial-highlight">Our Users</span> Say
            </h2>
            <p className="landing-page-v3__testimonial-description">
              Hear from families who transformed their kitchen experience
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="landing-page-v3__testimonial-carousel">
            <div
              className="landing-page-v3__testimonial-track"
              style={{
                transform: `translateX(calc(-${currentTestimonial} * ((100% + 30px) / 3)))`
              }}
            >

              {/* Testimonial 1 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "Didn't think I'd ever get this excited about my fridge, but here we are. Trackabite actually helps me remember what's in there before it goes bad. Love the little reminders - feels like having a smart fridge without the price tag."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Sarah L.</span>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "This app is such a life-saver. My wife and I always buy double of everything - now we just share the grocery list in Trackabite. No more five cartons of milk. Seriously, thank you."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Marcus W.</span>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "Really like how clean and easy the interface is. I started tracking leftovers and it's been surprisingly satisfying. Would love if it connected to grocery stores next - that'd be wild."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Chloe D.</span>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "I'm not exactly a 'food waste warrior,' but this app is turning me into one. It actually feels good to finish stuff before it expires. Plus, the AI recipe ideas are way better than I expected."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Tom R.</span>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "My roommates and I use this every week. It's become our little 'fridge scoreboard.' We compete to see who wastes less food. The shared grocery list feature? 10/10."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Priya K.</span>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "Been using Trackabite for a month. I like how it shows what's expiring soon and gives meal ideas using those ingredients. Feels like my fridge got smarter overnight."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Daniel S.</span>
                </div>
              </div>

              {/* Testimonial 7 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "This app is GENIUS. I used to throw away so much spinach it was embarrassing. Now I actually use what I buy. The design is cute too - feels friendly, not like a boring spreadsheet."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Jenna M.</span>
                </div>
              </div>

              {/* Testimonial 8 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "Great app overall. The AI suggestions are spot on - made a random 'leftover rice stir-fry' last night that turned out amazing. Would be cool if there were seasonal recipe ideas too."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Alex C.</span>
                </div>
              </div>

              {/* Testimonial 9 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "Honestly, Trackabite is my new favorite adulting tool. Keeps my fridge organized, helps me plan meals, and even saves me money. Never thought an app could make me feel proud of my groceries."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Emily T.</span>
                </div>
              </div>

              {/* Testimonial 10 */}
              <div className="landing-page-v3__testimonial-card">
                <p className="landing-page-v3__testimonial-text">
                  "Been using it for a few weeks and it's already part of my routine. I just snap a pic of stuff when I unload groceries. Simple, fast, and super helpful. Totally recommend."
                </p>
                <div className="landing-page-v3__testimonial-footer">
                  <span className="landing-page-v3__testimonial-name">Kevin L.</span>
                </div>
              </div>

            </div>

            {/* Navigation Arrows */}
            <button
              className="landing-page-v3__testimonial-nav landing-page-v3__testimonial-nav--prev"
              onClick={prevTestimonial}
            >
              &#8249;
            </button>
            <button
              className="landing-page-v3__testimonial-nav landing-page-v3__testimonial-nav--next"
              onClick={nextTestimonial}
            >
              &#8250;
            </button>

            {/* Dots Indicator */}
            <div className="landing-page-v3__testimonial-dots">
              {[...Array(maxPosition + 1)].map((_, index) => (
                <span
                  key={index}
                  className={`landing-page-v3__testimonial-dot ${
                    index === currentTestimonial ? 'landing-page-v3__testimonial-dot--active' : ''
                  }`}
                  onClick={() => goToTestimonial(index)}
                ></span>
              ))}
            </div>
          </div>

        </div>
        </div>
      </section>
    </div>
  );
};

export default NewLandingPage2;
