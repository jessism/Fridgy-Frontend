import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PublicNavBar.css';

const PublicNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <div className="logo">
            <Link to="/">
              <h2>Fridgy</h2>
            </Link>
          </div>
          <div className="auth-actions">
            <Link to="/signin" className="btn btn-secondary signin-btn">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary signup-btn">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicNavBar;