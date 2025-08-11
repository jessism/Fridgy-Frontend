import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './SignUpPage.css';

const SignUpPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');

  // Check for redirect message on component mount
  React.useEffect(() => {
    const message = sessionStorage.getItem('signupMessage');
    if (message) {
      setRedirectMessage(message);
      sessionStorage.removeItem('signupMessage');
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
      await signUp(formData);
      // Check if there's a redirect destination stored
      const redirectPath = sessionStorage.getItem('redirectAfterSignup');
      sessionStorage.removeItem('redirectAfterSignup');
      
      // Redirect to stored path or home
      navigate(redirectPath || '/home');
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes('Name')) {
        setErrors({ firstName: error.message });
      } else if (error.message.includes('email')) {
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

      {/* Right Side - Signup Form */}
      <div className="signup-right">
        <div className="signup-form-container">
          <div className="signup-header">
            <Link to="/signin" className="signin-link">Already have an account? Sign in →</Link>
          </div>
          
          <div className="signup-form-wrapper">
            <h2 className="signup-title">Sign up to Trackabite</h2>
            
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
                <label htmlFor="firstName" className="form-label">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="First name"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

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
                <div className="password-hint">
                  Password should be at least 8 characters long
                </div>
              </div>

              <button 
                type="submit" 
                className="signup-button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account →'}
              </button>
            </form>

            <div className="terms-text">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="terms-link">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="terms-link">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 