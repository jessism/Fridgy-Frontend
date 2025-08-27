import React from 'react';
import { Link } from 'react-router-dom';
import trackaBiteLogo from '../assets/images/Trackabite-logo.png';
import './LandingPage-Option3.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Custom Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img src={trackaBiteLogo} alt="Fridgy logo" className="header-logo" />
              <span className="brand-name">Fridgy</span>
            </div>
            <div className="auth-section">
              <Link to="/signin" className="auth-link signin-link">Sign In</Link>
              <span className="auth-divider">|</span>
              <Link to="/signup" className="auth-link signup-link">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          {/* Floating Decorative Elements */}
          <div className="floating-element floating-element-1">
            <div className="avatar-circle avatar-1">👩</div>
          </div>
          <div className="floating-element floating-element-2">
            <div className="avatar-circle avatar-2">👨</div>
          </div>
          <div className="floating-element floating-element-3">
            <div className="avatar-circle avatar-3">🍎</div>
          </div>
          <div className="floating-element floating-element-4">
            <div className="avatar-circle avatar-4">🥗</div>
          </div>
          <div className="floating-element floating-element-5">
            <div className="avatar-circle avatar-5">👩‍🍳</div>
          </div>
          <div className="floating-element floating-element-6">
            <div className="avatar-circle avatar-6">🥕</div>
          </div>

          <div className="container">
            <div className="hero-content">
              {/* Centered Content */}
              <div className="hero-center">
                <div className="hero-badge">
                  <span>Transform Your Experience</span>
                </div>
                <h1 className="hero-title">
                  Food tracking that remembers for you.
                </h1>
                <p className="hero-subtitle">
                  Download Fridgy for effortless food tracking and a<br/>
                  seamless inventory management experience.
                </p>
                
                {/* App Store Buttons */}
                <div className="app-store-buttons">
                  <a href="#" className="app-store-btn app-store-ios">
                    <div className="btn-content">
                      <span className="btn-text-small">Download on the</span>
                      <span className="btn-text-large">App Store</span>
                    </div>
                  </a>
                  <a href="#" className="app-store-btn app-store-android">
                    <div className="btn-content">
                      <span className="btn-text-small">Get it on</span>
                      <span className="btn-text-large">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="hero-phone">
                <div className="phone-mockup">
                  <div className="phone-notch"></div>
                  <div className="phone-screen">
                    <div className="app-interface">
                      <div className="app-status-bar">
                        <span className="status-time">9:41</span>
                        <span className="status-signal">📶 📶 📶</span>
                      </div>
                      <div className="app-header">
                        <img src={trackaBiteLogo} alt="Fridgy" className="app-logo" />
                        <span className="app-title">Fridgy</span>
                        <div className="app-search">🔍</div>
                        <div className="app-notification">🔔 <span className="notification-badge">3</span></div>
                      </div>
                      
                      <div className="app-sections">
                        <div className="section-tabs">
                          <div className="tab active">Explore All Product</div>
                          <div className="tab">Top Selling Product</div>
                        </div>
                        
                        <div className="popular-section">
                          <h3>Popular Products</h3>
                          <span className="see-all">See all</span>
                        </div>
                        
                        <div className="product-grid">
                          <div className="product-item">
                            <div className="product-image green"></div>
                            <span>20 items</span>
                          </div>
                          <div className="product-item">
                            <div className="product-image"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;