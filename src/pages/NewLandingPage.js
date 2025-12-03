import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import appLogo from '../assets/images/Logo.png';
import fridgeHeroImage from '../assets/product mockup/Share_List_People.png';
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
import './NewLandingPage.css';

const NewLandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const totalTestimonials = 10;
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

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

  const handleGetStarted = () => {
    console.log('[Landing] Navigating to onboarding');
    navigate('/onboarding');
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
              <Link to="/landing2" className="landing-page-v2__design-toggle">
                <span className="landing-page-v2__design-toggle-text">Try New Design</span>
                <svg className="landing-page-v2__design-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
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
                  Know<br />
                  what's fresh,<br />
                  what's not, and<br />
                  <span className="landing-page-v2__hero-title-gradient">what's for dinner</span>
                </h1>

                <p className="landing-page-v2__hero-subtitle">
                  Track what you've got and<br />
                  let AI do the thinking.
                </p>

                <div className="landing-page-v2__cta-button-container">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleGetStarted}
                  >
                    GET STARTED FOR FREE
                  </Button>
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
                  transform: `translateX(calc(-${currentTestimonial} * ((100% + 30px) / 3)))`
                }}
              >
                
                {/* Testimonial 1 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "Didn't think I'd ever get this excited about my fridge, but here we are. Trackabite actually helps me remember what's in there before it goes bad. Love the little reminders - feels like having a smart fridge without the price tag."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Sarah L.</span>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "This app is such a life-saver. My wife and I always buy double of everything - now we just share the grocery list in Trackabite. No more five cartons of milk. Seriously, thank you."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Marcus W.</span>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "Really like how clean and easy the interface is. I started tracking leftovers and it's been surprisingly satisfying. Would love if it connected to grocery stores next - that'd be wild."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Chloe D.</span>
                  </div>
                </div>

                {/* Testimonial 4 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "I'm not exactly a 'food waste warrior,' but this app is turning me into one. It actually feels good to finish stuff before it expires. Plus, the AI recipe ideas are way better than I expected."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Tom R.</span>
                  </div>
                </div>

                {/* Testimonial 5 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "My roommates and I use this every week. It's become our little 'fridge scoreboard.' We compete to see who wastes less food. The shared grocery list feature? 10/10."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Priya K.</span>
                  </div>
                </div>

                {/* Testimonial 6 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "Been using Trackabite for a month. I like how it shows what's expiring soon and gives meal ideas using those ingredients. Feels like my fridge got smarter overnight."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Daniel S.</span>
                  </div>
                </div>

                {/* Testimonial 7 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "This app is GENIUS. I used to throw away so much spinach it was embarrassing. Now I actually use what I buy. The design is cute too - feels friendly, not like a boring spreadsheet."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Jenna M.</span>
                  </div>
                </div>

                {/* Testimonial 8 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "Great app overall. The AI suggestions are spot on - made a random 'leftover rice stir-fry' last night that turned out amazing. Would be cool if there were seasonal recipe ideas too."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Alex C.</span>
                  </div>
                </div>

                {/* Testimonial 9 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "Honestly, Trackabite is my new favorite adulting tool. Keeps my fridge organized, helps me plan meals, and even saves me money. Never thought an app could make me feel proud of my groceries."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Emily T.</span>
                  </div>
                </div>

                {/* Testimonial 10 */}
                <div className="landing-page-v2__testimonial-card">
                  <p className="landing-page-v2__testimonial-text">
                    "Been using it for a few weeks and it's already part of my routine. I just snap a pic of stuff when I unload groceries. Simple, fast, and super helpful. Totally recommend."
                  </p>
                  <div className="landing-page-v2__testimonial-footer">
                    <span className="landing-page-v2__testimonial-name">Kevin L.</span>
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
                {[...Array(maxPosition + 1)].map((_, index) => (
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

      {/* Footer */}
      <footer className="landing-page-v2__footer">
        <div className="landing-page-v2__container">
          <div className="landing-page-v2__footer-content">

            {/* Left Column - Branding */}
            <div className="landing-page-v2__footer-brand">
              <div className="landing-page-v2__footer-logo">
                <img src={appLogo} alt="Trackabite logo" className="landing-page-v2__footer-logo-img" />
                <span className="landing-page-v2__footer-brand-name">Trackabite</span>
              </div>
              <p className="landing-page-v2__footer-description">
                Trackabite helps you track what's in your fridge, reduce food waste, and discover recipes — making meal planning effortless.
              </p>
              <a
                href="https://instagram.com/trackabite"
                target="_blank"
                rel="noopener noreferrer"
                className="landing-page-v2__footer-social"
                aria-label="Follow us on Instagram"
              >
                <svg className="landing-page-v2__footer-instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Right Columns - Navigation */}
            <div className="landing-page-v2__footer-nav">

              {/* Product Column */}
              <div className="landing-page-v2__footer-column">
                <h4 className="landing-page-v2__footer-column-title">Product</h4>
                <ul className="landing-page-v2__footer-links">
                  <li><Link to="/product/features">Features</Link></li>
                  <li><Link to="/product/support">Support</Link></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="landing-page-v2__footer-column">
                <h4 className="landing-page-v2__footer-column-title">Resources</h4>
                <ul className="landing-page-v2__footer-links">
                  <li><Link to="/resources/blog">Blog</Link></li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="landing-page-v2__footer-column">
                <h4 className="landing-page-v2__footer-column-title">Company</h4>
                <ul className="landing-page-v2__footer-links">
                  <li><Link to="/about">About</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Footer Bottom */}
          <div className="landing-page-v2__footer-bottom">
            <p className="landing-page-v2__footer-copyright">
              © {new Date().getFullYear()} Trackabite. All rights reserved.
            </p>
            <div className="landing-page-v2__footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default NewLandingPage;