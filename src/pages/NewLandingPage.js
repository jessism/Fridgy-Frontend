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

    </div>
  );
};

export default NewLandingPage;