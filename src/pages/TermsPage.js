/**
 * Terms of Service Page
 * Legal terms for using Fridgy
 */

import React from 'react';
import { usePrice } from '../contexts/PriceContext';
import './LegalPage.css';

function TermsPage() {
  const { formattedWithInterval, formatted } = usePrice();

  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Terms of Service</h1>
        <p className="legal-page__updated">Last Updated: February 25, 2026</p>

        <div className="legal-page__content">
          <section className="legal-page__section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Fridgy ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>2. Description of Service</h2>
            <p>
              Fridgy is a fridge inventory management application that helps users track food items, manage recipes, plan meals, and reduce food waste. The Service includes both free and premium subscription tiers.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>3. Account Registration</h2>
            <p>
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>4. Subscription and Billing</h2>
            <h3>Free Tier</h3>
            <p>The free tier includes limited access to features with the following restrictions:</p>
            <ul>
              <li>20 grocery items maximum</li>
              <li>10 imported recipes maximum</li>
              <li>10 uploaded recipes maximum</li>
              <li>10 meal logs maximum</li>
              <li>5 owned shopping lists and 1 joined shopping list maximum</li>
              <li>No access to AI recipe recommendations or analytics features</li>
            </ul>

            <h3>Premium Tier ({formattedWithInterval})</h3>
            <ul>
              <li>7-day free trial with payment method required</li>
              <li>Automatically renews monthly at {formatted} unless canceled</li>
              <li>Unlimited access to all features</li>
              <li>Cancel anytime through your billing portal</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>5. Cancellation and Refunds</h2>
            <p>
              You may cancel your premium subscription at any time. Upon cancellation:
            </p>
            <ul>
              <li>You will retain access until the end of your current billing period</li>
              <li>Your account will be downgraded to the free tier</li>
              <li>No refunds are provided for partial months</li>
              <li>Your data will be preserved but subject to free tier limitations</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>6. Payment Processing</h2>
            <p>
              All payments are processed securely through Stripe. We do not store your credit card information. By providing payment information, you agree to Stripe's terms of service.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>7. User Content and Intellectual Property Rights</h2>
            <p>
              You retain all rights to the content you upload (recipes, photos, meal logs, etc.). By using the Service, you grant us a license to use, store, and display your content solely for the purpose of providing the Service to you.
            </p>

            <h3>Your Responsibilities for Third-Party Content</h3>
            <p>
              When you save recipes from external sources (websites, blogs, social media), you represent and warrant that:
            </p>
            <ul>
              <li>You have the right to save and use that content for personal purposes</li>
              <li>You will not share copyrighted recipes without proper permission from the copyright holder</li>
              <li>Your use of saved recipes is for personal, non-commercial meal planning only</li>
            </ul>

            <h3>Uploaded Content Requirements</h3>
            <p>
              Any photos, recipes, or other content you upload to Trackabite:
            </p>
            <ul>
              <li>Must not infringe on any third party's intellectual property rights</li>
              <li>Must not contain illegal, offensive, or inappropriate material</li>
              <li>May be processed by our AI systems for functionality purposes (e.g., photo recognition, recipe analysis)</li>
            </ul>

            <h3>Shared Content License</h3>
            <p>
              When you share cookbooks or recipes with other users:
            </p>
            <ul>
              <li>You grant those users a non-exclusive license to view and use the shared recipes for personal purposes</li>
              <li>You remain solely responsible for ensuring you have the rights to share that content</li>
              <li>Trackabite is not responsible for user-shared content that infringes on third-party rights</li>
            </ul>

            <h3>Content Removal and DMCA Compliance</h3>
            <ul>
              <li>We reserve the right to remove any user content that violates these terms or infringes on intellectual property rights</li>
              <li>If you believe your copyrighted work has been infringed, please contact us at hello@trackabite.app with details of the alleged infringement</li>
              <li>We will investigate all valid DMCA complaints and take appropriate action</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>8. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Violate any third-party rights</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>9. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service, including but not limited to food safety decisions based on expiration tracking.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>11. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at: support@trackabite.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
