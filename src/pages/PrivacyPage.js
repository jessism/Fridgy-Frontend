/**
 * Privacy Policy Page
 * Privacy policy for Trackabite users
 */

import React from 'react';
import './LegalPage.css';

function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Privacy Policy</h1>
        <p className="legal-page__updated">Last Updated: January 24, 2026</p>

        <div className="legal-page__content">
          <section className="legal-page__section">
            <h2>1. Introduction</h2>
            <p>
              Trackabite ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our food inventory management and recipe application.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>2. Information We Collect</h2>

            <h3>Account Information</h3>
            <ul>
              <li>First name and email address</li>
              <li>Password (encrypted)</li>
              <li>Timezone preference</li>
            </ul>

            <h3>Usage Data</h3>
            <ul>
              <li>Inventory items (food names, quantities, units, expiration dates, categories)</li>
              <li>Saved and imported recipes (from Instagram, websites, or manual entry)</li>
              <li>Meal logs and meal photos</li>
              <li>Meal plans</li>
              <li>Shopping lists (including collaborative lists with other users)</li>
              <li>Dietary preferences, allergies, and preferred cuisines</li>
              <li>Household size, budget preferences, and cooking time preferences</li>
            </ul>

            <h3>Payment Information</h3>
            <ul>
              <li>Payment information is processed by Stripe (we do not store credit card numbers)</li>
              <li>Subscription status and billing history</li>
            </ul>

            <h3>Technical Data</h3>
            <ul>
              <li>Device information and browser type</li>
              <li>Push notification subscriptions</li>
              <li>Usage analytics (page views and feature usage)</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve the Service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related notifications (expiring items, trial ending, payment issues)</li>
              <li>Generate AI-powered recipe recommendations based on your inventory</li>
              <li>Analyze food items and recipes using AI image recognition</li>
              <li>Provide customer support</li>
              <li>Analyze usage patterns to improve features</li>
              <li>Prevent fraud and enforce our Terms of Service</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Stripe:</strong> Payment processing and subscription management</li>
              <li><strong>Supabase:</strong> Database hosting and file storage</li>
              <li><strong>Google Gemini:</strong> AI-powered food recognition and recipe analysis</li>
              <li><strong>Spoonacular:</strong> Recipe data and nutrition information</li>
              <li><strong>PostHog:</strong> Usage analytics</li>
            </ul>
            <p>
              These services have their own privacy policies and handle data according to their terms.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>5. Data Storage and Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul>
              <li>Passwords are encrypted using bcrypt hashing</li>
              <li>All data transmission is encrypted via HTTPS/SSL</li>
              <li>Access to user data is restricted and authenticated</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal compliance.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use local storage and session storage to maintain your login session and app preferences. We use analytics to understand how users interact with our app and improve the experience.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 18. We do not knowingly collect information from children. If you are under 18, please do not use the Service.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>10. International Users</h2>
            <p>
              Your data may be transferred and processed in countries other than your country of residence. By using the Service, you consent to such transfers.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>11. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> hello@trackabite.app
            </p>
          </section>

          <section className="legal-page__section">
            <h2>13. Government and Legal Data Requests</h2>
            <p>
              We have the following policies in place regarding requests from government authorities or law enforcement for user data:
            </p>
            <ul>
              <li><strong>Legal Review:</strong> All requests from public authorities or government agencies for user personal data will be reviewed for legal validity before any response. We verify that requests come from legitimate authorities and are legally valid.</li>
              <li><strong>Data Minimization:</strong> When legally required to respond to a valid request, we will only disclose the minimum information necessary to comply with the specific request. No additional data beyond what is legally required will be shared.</li>
              <li><strong>Challenging Unlawful Requests:</strong> Requests that appear to be unlawful, overly broad, or inappropriate will be challenged or rejected. Legal counsel will be consulted when necessary.</li>
              <li><strong>Documentation:</strong> All data requests from public authorities are documented, including the date and source of request, nature of data requested, response provided, and legal reasoning.</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>14. GDPR & CCPA Compliance</h2>
            <p>
              If you are a resident of the European Union or California, you have additional rights under GDPR and CCPA respectively. Please contact us to exercise these rights.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
