import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import appLogo from '../assets/images/Logo.png';
import heroBackground from '../assets/images/LandingPage_Hero_Background.png';
import './LandingPage.css';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debug: Test if image can be loaded
  useEffect(() => {
    const testImage = new Image();
    testImage.onload = () => {
      console.log('✅ Image loaded successfully:', heroBackground);
    };
    testImage.onerror = () => {
      console.log('❌ Image failed to load:', heroBackground);
    };
    testImage.src = heroBackground;

    // Also test public folder image
    const testPublicImage = new Image();
    testPublicImage.onload = () => {
      console.log('✅ Public image loaded successfully:', '/LandingPage_Hero_Background.png');
    };
    testPublicImage.onerror = () => {
      console.log('❌ Public image failed to load:', '/LandingPage_Hero_Background.png');
    };
    testPublicImage.src = '/LandingPage_Hero_Background.png';
  }, [heroBackground]);

  // Debug: Log the imported image URL
  console.log('Hero background image URL:', heroBackground);
  console.log('Public background URL:', '/LandingPage_Hero_Background.png');
  console.log('Final backgroundImage style will be:', `url(${heroBackground}), url(/LandingPage_Hero_Background.png)`);

  // Alternative public folder approach
  const publicBackgroundUrl = '/LandingPage_Hero_Background.png';

  return (
    <div className="landing-page">
      {/* Header */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img src={appLogo} alt="App logo" className="header-logo" />
              <span className="brand-name">Fridgy</span>
            </div>
            <div className="header-actions">
              <Link to="/signup" className="download-app-btn">Download App</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          {/* Floating Avatar Elements */}
          <div className="floating-avatar floating-avatar-1">
            <img src="https://i.pravatar.cc/80?img=1" alt="User 1" />
          </div>
          <div className="floating-avatar floating-avatar-2">
            <img src="https://i.pravatar.cc/80?img=2" alt="User 2" />
          </div>
          <div className="floating-avatar floating-avatar-3">
            <img src="https://i.pravatar.cc/80?img=3" alt="User 3" />
          </div>
          <div className="floating-avatar floating-avatar-4">
            <img src="https://i.pravatar.cc/80?img=4" alt="User 4" />
          </div>
          <div className="floating-avatar floating-avatar-5">
            <img src="https://i.pravatar.cc/80?img=5" alt="User 5" />
          </div>
          <div className="floating-avatar floating-avatar-6">
            <img src="https://i.pravatar.cc/80?img=6" alt="User 6" />
          </div>

          <div className="container">
            <div className="hero-content">
              {/* Main Content - Centered */}
              <div className="hero-main">
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
                
                <div className="app-store-buttons">
                  <a href="#" className="app-store-btn app-store-ios">
                    <div className="app-store-icon">🍎</div>
                    <div className="btn-content">
                      <span className="btn-text-small">Download on the</span>
                      <span className="btn-text-large">App Store</span>
                    </div>
                  </a>
                  <a href="#" className="app-store-btn app-store-android">
                    <div className="app-store-icon">📱</div>
                    <div className="btn-content">
                      <span className="btn-text-small">Get it on</span>
                      <span className="btn-text-large">Google Play</span>
                    </div>
                  </a>
                </div>

                {/* Phone Mockup - Moved here below the buttons */}
                <div className="hero-phone">
                  <div className="phone-mockup">
                    <div className="phone-frame">
                      <div className="phone-notch"></div>
                      <div className="phone-screen">
                        <div className="phone-status-bar">
                          <span className="status-time">9:41</span>
                          <div className="status-indicators">
                            <span className="signal">📶</span>
                            <span className="wifi">📶</span>
                            <span className="battery">🔋</span>
                          </div>
                        </div>
                        
                        <div className="app-interface">
                          <div className="app-header">
                            <img src={appLogo} alt="App" className="app-logo" />
                            <span className="app-name">Fridgy</span>
                            <div className="app-icons">
                              <span className="search-icon">🔍</span>
                              <div className="cart-icon">
                                🛒
                                <span className="cart-badge">3</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="app-tabs">
                            <div className="tab active">
                              <span>Explore All Product</span>
                            </div>
                            <div className="tab">
                              <span>Top Selling Product</span>
                            </div>
                          </div>
                          
                          <div className="popular-products">
                            <div className="section-header">
                              <h3>Popular Products</h3>
                              <span className="see-all">See all</span>
                            </div>
                            
                            <div className="products-grid">
                              <div className="product-item">
                                <div className="product-box"></div>
                                <span>33 Items</span>
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;