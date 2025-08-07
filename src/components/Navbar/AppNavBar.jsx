import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AppNavBar.css';

const AppNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = () => {
    navigate('/home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-brand">
          <Link to="/home">
            <h2>Fridgy</h2>
          </Link>
        </div>
        <div className="nav-menu">
          <Link 
            to="/home" 
            className={`nav-link ${isActiveLink('/home') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/inventory" 
            className={`nav-link ${isActiveLink('/inventory') ? 'active' : ''}`}
          >
            Inventory
          </Link>
          <Link 
            to="/meal-plans" 
            className={`nav-link ${isActiveLink('/meal-plans') ? 'active' : ''}`}
          >
            Meal Plans
          </Link>
          <Link 
            to="/profiles" 
            className={`nav-link ${isActiveLink('/profiles') ? 'active' : ''}`}
          >
            Profiles
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default AppNavBar; 