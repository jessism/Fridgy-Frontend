import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import appLogo from '../assets/images/Logo.png';
import phoneLeftImage from '../assets/product mockup/HomepageS_Step1.jpeg';
import phoneRightImage from '../assets/product mockup/Homepage_personalized recipes.jpeg';
import step1Image from '../assets/product mockup/HomepageS_Step1.jpeg';
import step1Video from '../assets/product mockup/Track inventory.mp4';
import step2Image from '../assets/product mockup/Homepage_Step2.jpeg';
import step2Video from '../assets/product mockup/Save recipes.mp4';
import step3Image from '../assets/product mockup/Homepage_Step3.jpeg';
import step3Video from '../assets/product mockup/Personalized recipes.mp4';
import shopTogetherVideo from '../assets/images/Trackie_Shop_Together.mp4';
import mealPlanningVideo from '../assets/product mockup/Meal planning.mp4';
import reminderVideo from '../assets/product mockup/Reminder.mp4';
import googleCalendarIcon from '../assets/icons/Google calendar.png';
import appleCalendarIcon from '../assets/icons/Apple Calendar.png';
import googleCalendarVideo from '../assets/product mockup/Google calendar.mp4';
import './NewLandingPage2.css';

const NewLandingPage2 = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [highlightVisible, setHighlightVisible] = useState(false);
  const [wayItalicized, setWayItalicized] = useState(false);
  const highlightRef = useRef(null);
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

  // Italicize "WAY" after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setWayItalicized(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for "in 3 simple steps" highlight effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHighlightVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (highlightRef.current) {
      observer.observe(highlightRef.current);
    }

    return () => {
      if (highlightRef.current) {
        observer.unobserve(highlightRef.current);
      }
    };
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
          <h1 className="landing-page-v3__bg-text-line landing-page-v3__bg-text-line--second">GOT <span className={`landing-page-v3__way-text ${wayItalicized ? 'landing-page-v3__way-text--italic' : ''}`}>WAY</span> EASIER.</h1>
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
        <span className="landing-page-v3__year">2025</span>

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
            <span
              ref={highlightRef}
              className={`landing-page-v3__steps-title-highlight ${highlightVisible ? 'landing-page-v3__steps-title-highlight--active' : ''}`}
            >Plan smarter, eat better</span><br />
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
                  <h3 className="landing-page-v3__step-heading">Snap & manage <span className="landing-page-v3__mobile-break">your groceries.</span></h3>
                  <p className="landing-page-v3__step-description">
                    Just snap a photo and let Trackabite sort everything for you.<br /><br />Know exactly what you've got, what's running low, and what's about to go rogue in the back of your fridge.
                  </p>
                </div>
                <div className="landing-page-v3__step-image landing-page-v3__step-image--overflow">
                  <div className="landing-page-v3__step-phone-frame landing-page-v3__step-phone-frame--transparent">
                    <div className="landing-page-v3__step-phone-screen">
                      <video
                        src={step1Video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="landing-page-v3__step-phone"
                      />
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
                  <h3 className="landing-page-v3__step-heading">Save your favorite recipes from <em>anywhere.</em></h3>
                  <p className="landing-page-v3__step-description">
                    Pull recipes from any Instagram Reel & Post, upload your own creations, and keep everything tidy so you can quickly find them when you need dinner ideas.
                  </p>
                </div>
                <div className="landing-page-v3__step-image landing-page-v3__step-image--overflow">
                  <div className="landing-page-v3__step-phone-frame landing-page-v3__step-phone-frame--transparent">
                    <div className="landing-page-v3__step-phone-screen">
                      <video
                        src={step2Video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="landing-page-v3__step-phone"
                      />
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
                  <h3 className="landing-page-v3__step-heading">Get personalized meal ideas you'll <em>actually</em> make.</h3>
                  <p className="landing-page-v3__step-description">
                    Trackabite checks what you've got, what you like, even how much energy you're operating with today.<br /><br />
                    Too tired to chop? Feeling adventurous today?<br /><br />
                    You'll get ideas that feel doable - not the perfectly staged Pinterest dishes that require three hours and a ring light.
                  </p>
                </div>
                <div className="landing-page-v3__step-image landing-page-v3__step-image--overflow">
                  <div className="landing-page-v3__step-phone-frame landing-page-v3__step-phone-frame--transparent">
                    <div className="landing-page-v3__step-phone-screen">
                      <video
                        src={step3Video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="landing-page-v3__step-phone"
                      />
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
                  <video
                      src={mealPlanningVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="landing-page-v3__feature-phone-img"
                    />
                </div>
              </div>
            </div>
            <div className="landing-page-v3__feature-text">
              <h2 className="landing-page-v3__feature-heading">
                Meal planning made easy.
              </h2>
              <p className="landing-page-v3__feature-description">
                Plan your whole week in minutes and access it anytime, anywhere — so eating well doesn't feel like a full-time job.
              </p>
              <button className="landing-page-v3__feature-cta" onClick={() => navigate('/register')}>
                GET STARTED FOR FREE
              </button>
            </div>
          </div>
        </div>

        {/* Stay Connected Section */}
        <div className="landing-page-v3__feature-block landing-page-v3__feature-block--grid">
          <h2 className="landing-page-v3__feature-block-title landing-page-v3__feature-block-title--left">
            <span className="landing-page-v3__feature-block-title-small">Always stay</span>
            <span className="landing-page-v3__feature-block-title-large">Connected.</span>
          </h2>

          <div className="landing-page-v3__feature-cards">
            {/* Left Card - Expiry Reminders */}
            <div className="landing-page-v3__feature-card">
              <h3 className="landing-page-v3__feature-card-title">Get expiry reminders</h3>
              <p className="landing-page-v3__feature-card-description">
                Say goodbye to wasted groceries. Trackabite reminds you <em>before</em> things go bad, so you can cook more, save more.
              </p>
              <div className="landing-page-v3__feature-card-phone">
                <div className="landing-page-v3__feature-phone-frame">
                  <div className="landing-page-v3__feature-phone-notch"></div>
                  <div className="landing-page-v3__feature-phone-screen">
                    <video
                      src={reminderVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="landing-page-v3__feature-phone-img"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card - Calendar Integration */}
            <div className="landing-page-v3__feature-card">
              <h3 className="landing-page-v3__feature-card-title">Connect to your <span style={{whiteSpace: 'nowrap'}}>Google or iCalendar</span></h3>
              <p className="landing-page-v3__feature-card-description">
                Keep your week running smoothly. Sync meals to your schedule so dinner becomes simple, predictable, and one less thing to think about.
              </p>
              <div className="landing-page-v3__calendar-icons">
                <img src={googleCalendarIcon} alt="Google Calendar" className="landing-page-v3__calendar-icon" />
                <img src={appleCalendarIcon} alt="Apple Calendar" className="landing-page-v3__calendar-icon" />
              </div>
              <div className="landing-page-v3__feature-card-phone">
                <div className="landing-page-v3__feature-phone-frame">
                  <div className="landing-page-v3__feature-phone-notch"></div>
                  <div className="landing-page-v3__feature-phone-screen">
                    <video
                      src={googleCalendarVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="landing-page-v3__feature-phone-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Smarter Together */}
        <div className="landing-page-v3__feature-block landing-page-v3__feature-block--wide">
          <div className="landing-page-v3__shop-header">
            <div className="landing-page-v3__shop-title-row">
              <h2 className="landing-page-v3__feature-block-title landing-page-v3__feature-block-title--left">
                <span className="landing-page-v3__feature-block-title-small">Shop smarter.</span>
                <span className="landing-page-v3__feature-block-title-large">Together.</span>
              </h2>
              <img src={appLogo} alt="Trackabite mascot" className="landing-page-v3__shop-mascot" />
            </div>
            <div className="landing-page-v3__shop-info">
              <p className="landing-page-v3__feature-block-subtitle">
                Share your shopping list with family in real-time. Everyone stays synced, no duplicate purchases, and grocery trips become a breeze.
              </p>
              <button className="landing-page-v3__shop-cta" onClick={() => navigate('/register')}>
                GET STARTED FOR FREE
              </button>
            </div>
          </div>
          <div className="landing-page-v3__feature-wide-image">
            <video
              src={shopTogetherVideo}
              autoPlay
              loop
              muted
              playsInline
            />
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

      {/* Final CTA Section */}
      <section className="landing-page-v3__final-cta">
        <h2 className="landing-page-v3__final-cta-tagline">
          Start eating better today
        </h2>
        <p className="landing-page-v3__final-cta-description">
          Save time, reduce waste, and make everyday meals easier.<br />
          You're just one tap away.
        </p>
        <button className="landing-page-v3__cta-btn" onClick={handleGetStarted}>
          GET STARTED FOR FREE
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-page-v3__footer">
        <div className="landing-page-v3__footer-container">
          <div className="landing-page-v3__footer-content">

            {/* Left Column - Branding */}
            <div className="landing-page-v3__footer-brand">
              <div className="landing-page-v3__footer-logo">
                <img src={appLogo} alt="Trackabite logo" className="landing-page-v3__footer-logo-img" />
                <span className="landing-page-v3__footer-brand-name">Trackabite</span>
              </div>
              <p className="landing-page-v3__footer-description">
                Trackabite helps you track what's in your fridge, reduce food waste, and discover recipes — making meal planning effortless.
              </p>
              <a
                href="https://instagram.com/trackabite"
                target="_blank"
                rel="noopener noreferrer"
                className="landing-page-v3__footer-social"
                aria-label="Follow us on Instagram"
              >
                <svg className="landing-page-v3__footer-instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Right Columns - Navigation */}
            <div className="landing-page-v3__footer-nav">

              {/* Product Column */}
              <div className="landing-page-v3__footer-column">
                <h4 className="landing-page-v3__footer-column-title">Product</h4>
                <ul className="landing-page-v3__footer-links">
                  <li><Link to="/product/features">Features</Link></li>
                  <li><Link to="/product/support">Support</Link></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="landing-page-v3__footer-column">
                <h4 className="landing-page-v3__footer-column-title">Resources</h4>
                <ul className="landing-page-v3__footer-links">
                  <li><Link to="/resources/blog">Blog</Link></li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="landing-page-v3__footer-column">
                <h4 className="landing-page-v3__footer-column-title">Company</h4>
                <ul className="landing-page-v3__footer-links">
                  <li><Link to="/about">About</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Footer Bottom */}
          <div className="landing-page-v3__footer-bottom">
            <p className="landing-page-v3__footer-copyright">
              © {new Date().getFullYear()} Trackabite. All rights reserved.
            </p>
            <div className="landing-page-v3__footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLandingPage2;
