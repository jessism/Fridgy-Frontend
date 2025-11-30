import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import appLogo from '../assets/images/Logo.png';
import Button from '../components/Button';
import './PublicSupportPage.css';

const faqs = [
  {
    question: "How do I add items to my fridge?",
    answer: "Simply tap the + button in the app and take a photo of your groceries. Our AI will automatically identify the items and add them to your inventory. You can also manually add items if you prefer."
  },
  {
    question: "How does the AI recognize food items?",
    answer: "Trackabite uses advanced computer vision and machine learning to identify food items from photos. It can recognize hundreds of common grocery items and even estimate quantities and expiration dates based on the type of food."
  },
  {
    question: "Can I share my inventory with family members?",
    answer: "Yes! You can share your fridge inventory and shopping lists with family members. Everyone in your household can see what's in the fridge and add items to shared shopping lists in real-time."
  },
  {
    question: "How do expiration reminders work?",
    answer: "When you add items to your inventory, Trackabite tracks their estimated expiration dates. You'll receive notifications as items approach their expiration date, helping you use them before they go bad."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We take your privacy seriously. All data is encrypted in transit and at rest. We never sell your personal information, and you can delete your account and all associated data at any time."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time from the Settings page in the app. Go to Settings > Subscription > Cancel Subscription. Your premium features will remain active until the end of your billing period."
  }
];

const PublicSupportPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show a success message
    // In production, this would send to a backend or email service
    setFormStatus('success');
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setFormStatus(null), 5000);
  };

  return (
    <div className="public-support-page">
      {/* Header */}
      <header className={`public-support-page__header ${isScrolled ? 'public-support-page__header--scrolled' : ''}`}>
        <div className="public-support-page__container">
          <div className="public-support-page__header-content">
            <Link to="/" className="public-support-page__logo-section">
              <img src={appLogo} alt="Trackabite logo" className="public-support-page__logo" />
              <span className="public-support-page__brand-name">Trackabite</span>
            </Link>
            <div className="public-support-page__header-actions">
              <Button variant="secondary" size="medium" href="/signin">
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="public-support-page__hero">
        <div className="public-support-page__container">
          <h1 className="public-support-page__title">How can we help?</h1>
          <p className="public-support-page__subtitle">
            Find answers to common questions or reach out to our team
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="public-support-page__faq">
        <div className="public-support-page__container">
          <h2 className="public-support-page__section-title">Frequently Asked Questions</h2>
          <div className="public-support-page__faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`public-support-page__faq-item ${openFaq === index ? 'public-support-page__faq-item--open' : ''}`}
              >
                <button
                  className="public-support-page__faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>
                  <span className="public-support-page__faq-icon">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                <div className="public-support-page__faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="public-support-page__contact">
        <div className="public-support-page__container">
          <div className="public-support-page__contact-content">
            <h2 className="public-support-page__section-title">Still need help?</h2>
            <p className="public-support-page__contact-description">
              Send us a message and we'll get back to you as soon as possible.
            </p>

            <form className="public-support-page__form" onSubmit={handleSubmit}>
              <div className="public-support-page__form-group">
                <label htmlFor="name" className="public-support-page__form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="public-support-page__form-input"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="public-support-page__form-group">
                <label htmlFor="email" className="public-support-page__form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="public-support-page__form-input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="public-support-page__form-group">
                <label htmlFor="message" className="public-support-page__form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="public-support-page__form-textarea"
                  placeholder="How can we help you?"
                  rows="5"
                  required
                />
              </div>

              {formStatus === 'success' && (
                <div className="public-support-page__form-success">
                  Thanks for reaching out! We'll get back to you soon.
                </div>
              )}

              <Button type="submit" variant="primary" size="large">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicSupportPage;
