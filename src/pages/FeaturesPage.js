import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import appLogo from '../assets/images/Logo.png';
import groceriesIcon from '../assets/icons/groceries.png';
import chefIcon from '../assets/icons/Smart chef.png';
import heartCheckIcon from '../assets/icons/Healthy.png';
import step1Image from '../assets/product mockup/HomepageS_Step1.jpeg';
import step2Image from '../assets/product mockup/Homepage_Step2.jpeg';
import step3Image from '../assets/product mockup/Homepage_Step3.jpeg';
import fridgeHeroImage from '../assets/product mockup/Share_List_People.png';
import Button from '../components/Button';
import './FeaturesPage.css';

const FeaturesPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="features-page">
      {/* Header */}
      <header className={`features-page__header ${isScrolled ? 'features-page__header--scrolled' : ''}`}>
        <div className="features-page__container">
          <div className="features-page__header-content">
            <Link to="/" className="features-page__logo-section">
              <img src={appLogo} alt="Trackabite logo" className="features-page__logo" />
              <span className="features-page__brand-name">Trackabite</span>
            </Link>
            <div className="features-page__header-actions">
              <Button variant="secondary" size="medium" href="/signin">
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="features-page__hero">
        <div className="features-page__container">
          <h1 className="features-page__title">What Trackabite Can Do</h1>
          <p className="features-page__subtitle">
            Powerful features to help you manage your kitchen, reduce waste, and eat better
          </p>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="features-page__highlights">
        <div className="features-page__container">
          <div className="features-page__highlights-grid">

            <div className="features-page__highlight-card">
              <div className="features-page__highlight-icon">
                <img src={groceriesIcon} alt="Groceries" className="features-page__highlight-icon-img" />
              </div>
              <h3 className="features-page__highlight-title">Your fridge. In your pocket.</h3>
              <p className="features-page__highlight-description">
                Know what's in your fridge anytime, anywhere. Never wonder "do I have eggs?" at the grocery store again.
              </p>
            </div>

            <div className="features-page__highlight-card">
              <div className="features-page__highlight-icon">
                <img src={chefIcon} alt="Chef" className="features-page__highlight-icon-img" />
              </div>
              <h3 className="features-page__highlight-title">Brain off. Chef on.</h3>
              <p className="features-page__highlight-description">
                Get smart recipe suggestions based on what's in your fridge and your taste preferences.
              </p>
            </div>

            <div className="features-page__highlight-card">
              <div className="features-page__highlight-icon">
                <img src={heartCheckIcon} alt="Save" className="features-page__highlight-icon-img" />
              </div>
              <h3 className="features-page__highlight-title">Waste less. Save more.</h3>
              <p className="features-page__highlight-description">
                Smart expiry tracking and reminders help you use food before it goes bad.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Details Section */}
      <section className="features-page__details">
        <div className="features-page__container">

          {/* Feature 1: AI Scanning */}
          <div className="features-page__feature features-page__feature--reverse">
            <div className="features-page__feature-content">
              <span className="features-page__feature-label">AI-Powered</span>
              <h2 className="features-page__feature-title">Snap & Track</h2>
              <p className="features-page__feature-description">
                Just take a photo of your groceries and let AI do the rest. Our smart recognition
                identifies items, estimates quantities, and even suggests expiration dates.
                No more manual entry.
              </p>
            </div>
            <div className="features-page__feature-image">
              <div className="features-page__phone-frame">
                <div className="features-page__phone-notch"></div>
                <div className="features-page__phone-screen">
                  <img src={step1Image} alt="AI food recognition" className="features-page__phone-screenshot" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Recipe Import */}
          <div className="features-page__feature">
            <div className="features-page__feature-image">
              <div className="features-page__phone-frame">
                <div className="features-page__phone-notch"></div>
                <div className="features-page__phone-screen">
                  <img src={step2Image} alt="Recipe import" className="features-page__phone-screenshot" />
                </div>
              </div>
            </div>
            <div className="features-page__feature-content">
              <span className="features-page__feature-label">Social Integration</span>
              <h2 className="features-page__feature-title">Save Recipes from Anywhere</h2>
              <p className="features-page__feature-description">
                See a delicious recipe on Instagram or TikTok? Import it directly into Trackabite
                with one tap. Build your personal recipe collection effortlessly and never lose
                that viral recipe again.
              </p>
            </div>
          </div>

          {/* Feature 3: Smart Recipes */}
          <div className="features-page__feature features-page__feature--reverse">
            <div className="features-page__feature-content">
              <span className="features-page__feature-label">Personalized</span>
              <h2 className="features-page__feature-title">Smart Recipe Suggestions</h2>
              <p className="features-page__feature-description">
                Get meal ideas tailored to what's actually in your fridge. Our AI considers
                what's expiring soon, your dietary preferences, and your cooking skill level
                to suggest the perfect recipes.
              </p>
            </div>
            <div className="features-page__feature-image">
              <div className="features-page__phone-frame">
                <div className="features-page__phone-notch"></div>
                <div className="features-page__phone-screen">
                  <img src={step3Image} alt="Smart recipe suggestions" className="features-page__phone-screenshot" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Shared Lists */}
          <div className="features-page__feature features-page__feature--full">
            <div className="features-page__feature-content features-page__feature-content--centered">
              <span className="features-page__feature-label">Collaboration</span>
              <h2 className="features-page__feature-title">Shop Smarter Together</h2>
              <p className="features-page__feature-description">
                Share shopping lists with family members in real-time. Everyone stays synced,
                no duplicate purchases, and grocery trips become a breeze. Collaborate effortlessly
                and never forget an item again.
              </p>
            </div>
            <div className="features-page__feature-hero">
              <img src={fridgeHeroImage} alt="Shared shopping lists" className="features-page__feature-hero-img" />
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="features-page__cta">
        <div className="features-page__container">
          <div className="features-page__cta-content">
            <h2 className="features-page__cta-title">Ready to transform your kitchen?</h2>
            <p className="features-page__cta-description">
              Start tracking your fridge, discovering recipes, and reducing waste today.
            </p>
            <Button variant="primary" size="large" onClick={() => navigate('/onboarding')}>
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
