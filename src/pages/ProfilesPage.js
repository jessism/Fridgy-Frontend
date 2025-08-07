import React from 'react';
import { Link } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import './HomePage.css'; // Now in the same directory

const ProfilesPage = () => {
  return (
    <div className="homepage">
      <AppNavBar />

      {/* Profiles Content */}
      <div style={{paddingTop: '100px', minHeight: '100vh', background: 'white'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
          <h1 style={{fontFamily: 'var(--header-font)', fontSize: '3rem', color: 'var(--header-color)', marginBottom: '2rem'}}>
            Your Profile
          </h1>
          <p style={{fontFamily: 'var(--description-font)', fontSize: '1.2rem', color: 'var(--description-color)', marginBottom: '3rem'}}>
            Manage your account settings and preferences
          </p>
          
          {/* Placeholder content */}
          <div style={{
            background: 'rgba(139, 195, 74, 0.1)',
            padding: '3rem',
            borderRadius: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{fontFamily: 'var(--header-font)', marginBottom: '1rem'}}>Coming Soon!</h2>
            <p style={{fontFamily: 'var(--description-font)', color: '#666'}}>
              Profile management and settings will be implemented here.
            </p>
            <Link to="/" className="btn btn-primary" style={{marginTop: '2rem', display: 'inline-block'}}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default ProfilesPage; 