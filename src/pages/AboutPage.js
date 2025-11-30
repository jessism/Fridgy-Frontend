import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import appLogo from '../assets/images/Logo.png';
import Button from '../components/Button';
import './AboutPage.css';

const AboutPage = () => {
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
    <div className="about-page">
      {/* Header */}
      <header className={`about-page__header ${isScrolled ? 'about-page__header--scrolled' : ''}`}>
        <div className="about-page__container">
          <div className="about-page__header-content">
            <Link to="/" className="about-page__logo-section">
              <img src={appLogo} alt="Trackabite logo" className="about-page__logo" />
              <span className="about-page__brand-name">Trackabite</span>
            </Link>
            <div className="about-page__header-actions">
              <Button variant="secondary" size="medium" href="/signin">
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="about-page__hero">
        <div className="about-page__container">
          <h1 className="about-page__title">About Trackabite</h1>
          <p className="about-page__subtitle">
            Building a smarter way to manage your kitchen
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-page__mission">
        <div className="about-page__container">
          <div className="about-page__mission-content">
            <h2 className="about-page__section-title">Our Mission</h2>
            <p className="about-page__mission-text">
              We're on a mission to reduce food waste and make meal planning effortless.
              Trackabite helps you keep track of what's in your fridge, reminds you before
              food expires, and suggests delicious recipes based on what you already have.
            </p>
            <p className="about-page__mission-text">
              Every year, millions of tons of food go to waste — often because we forget
              what's in our fridges or don't know what to cook. We believe technology can
              help change that. With AI-powered food recognition and smart expiry tracking,
              we're making it easier than ever to use what you buy and waste less.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-page__values">
        <div className="about-page__container">
          <h2 className="about-page__section-title">What We Believe</h2>
          <div className="about-page__values-grid">
            <div className="about-page__value-card">
              <div className="about-page__value-icon">🌱</div>
              <h3 className="about-page__value-title">Sustainability First</h3>
              <p className="about-page__value-description">
                Reducing food waste is one of the simplest ways to help the planet.
                We're here to make it easy.
              </p>
            </div>
            <div className="about-page__value-card">
              <div className="about-page__value-icon">✨</div>
              <h3 className="about-page__value-title">Simplicity Matters</h3>
              <p className="about-page__value-description">
                Managing your kitchen shouldn't be complicated. We design for ease
                and clarity in everything we build.
              </p>
            </div>
            <div className="about-page__value-card">
              <div className="about-page__value-icon">🤖</div>
              <h3 className="about-page__value-title">Smart Technology</h3>
              <p className="about-page__value-description">
                AI should work for you. Our smart features save you time and
                mental energy every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-page__cta">
        <div className="about-page__container">
          <div className="about-page__cta-content">
            <h2 className="about-page__cta-title">Ready to get started?</h2>
            <p className="about-page__cta-description">
              Join thousands of households using Trackabite to reduce food waste
              and simplify meal planning.
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

export default AboutPage;
