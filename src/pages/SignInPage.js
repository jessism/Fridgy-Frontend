import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './SignUpPage.css';

const SignInPage = () => {
  const { signIn, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');

  // Check authentication and redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      console.log('[SignIn] User already authenticated, redirecting to home...');
      navigate('/home');
    }
  }, [loading, isAuthenticated, navigate]);

  // Check for redirect message on component mount
  React.useEffect(() => {
    const message = sessionStorage.getItem('signinMessage');
    if (message) {
      setRedirectMessage(message);
      sessionStorage.removeItem('signinMessage');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await signIn(formData.email, formData.password);
      // Check if there's a redirect destination stored
      const redirectPath = sessionStorage.getItem('redirectAfterSignin');
      sessionStorage.removeItem('redirectAfterSignin');
      
      // Redirect to stored path or home
      navigate(redirectPath || '/home');
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes('email')) {
        setErrors({ email: error.message });
      } else if (error.message.includes('Password')) {
        setErrors({ password: error.message });
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="signup-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="signup-page">
      {/* Left Side - Branding */}
      <div 
        className="signup-left"
        style={{
          backgroundImage: `url('/signup-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      </div>

      {/* Right Side - Sign In Form */}
      <div className="signup-right">
        <div className="signup-form-container">
          <div className="signup-header">
            <Link to="/onboarding" className="signin-link">Don't have an account? Sign up →</Link>
          </div>
          
          <div className="signup-form-wrapper">
            <h2 className="signup-title">Sign in to Trackabite</h2>
            
            <form className="signup-form" onSubmit={handleSubmit}>
              {redirectMessage && (
                <div className="redirect-message">
                  {redirectMessage}
                </div>
              )}
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Email address"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <button 
                type="submit" 
                className="signup-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;