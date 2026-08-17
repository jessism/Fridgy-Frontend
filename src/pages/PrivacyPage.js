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
        <p className="legal-page__updated">Last Updated: August 16, 2026</p>

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

            <h3>Photos and Image Data</h3>
            <ul>
              <li>Photos of grocery items (when you use the camera feature for automatic item detection)</li>
              <li>Photos are processed in memory only and deleted immediately after AI analysis</li>
              <li>We do not store, retain, or archive your photos</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>2.1. Photo Processing in Detail</h2>
            <p>
              When you use our grocery inventory feature, you may choose to take or upload photos of grocery items for automatic identification.
            </p>

            <h3>How We Process Photos</h3>
            <ul>
              <li>Photos are sent securely to our servers via HTTPS encryption</li>
              <li>We use Google Gemini 2.0 Flash AI to analyze photos and identify grocery items</li>
              <li>Photos are processed <strong>in memory only</strong> and are <strong>never written to disk or stored in a database</strong></li>
              <li>Photos are <strong>automatically deleted immediately</strong> after AI processing completes (typically within seconds)</li>
              <li>We do not retain, archive, or use your photos for any other purpose, including AI model training</li>
            </ul>

            <h3>Third-Party Photo Processing</h3>
            <p>
              We use Google's Gemini AI service to process grocery photos. During processing, photo data is sent to Google's servers. Google's privacy policy applies to this data processing. Learn more at: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
            </p>

            <h3>Your Consent</h3>
            <p>
              Before your first photo capture, we will ask for your explicit consent to process photos using AI. You can:
            </p>
            <ul>
              <li>Accept photo processing to use the automatic grocery detection feature</li>
              <li>Decline photo processing (you can still manually add items)</li>
              <li>Revoke consent at any time by deleting and reinstalling the app</li>
            </ul>

            <h3>Photo Data Retention</h3>
            <ul>
              <li><strong>Photos:</strong> 0 seconds - Deleted immediately after processing</li>
              <li><strong>Detected grocery items:</strong> Retained in your account until you delete them</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>2.2. User-Generated and Third-Party Content</h2>

            <h3>Recipe Saving</h3>
            <p>
              Users can save recipes from external sources (websites, blogs, social media platforms) into their personal Trackabite account. When you save recipes from external sources:
            </p>
            <ul>
              <li>You are responsible for ensuring you have permission to save and use that content</li>
              <li>Saved recipes are stored for your personal, non-commercial use only</li>
              <li>We do not claim ownership of any recipes or content you save</li>
            </ul>

            <h3>Content Sharing</h3>
            <p>
              Users can share cookbooks and recipes with other users. When you share content:
            </p>
            <ul>
              <li>You represent that you have the right to share that content</li>
              <li>You grant other users permission to view the shared recipes for personal use</li>
              <li>You remain responsible for the content you share</li>
            </ul>

            <h3>User Photos</h3>
            <p>
              Users can upload photos of grocery items for AI-powered inventory tracking. These photos are:
            </p>
            <ul>
              <li>Processed by our AI to detect food items</li>
              <li>Stored temporarily for processing purposes only</li>
              <li>Linked to your account and inventory data</li>
              <li>Not shared with other users without your explicit consent</li>
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
              <li>Analyze food items and recipes using AI image recognition (Google Gemini 2.0 Flash)</li>
              <li>Process grocery photos to automatically detect items (photos are deleted immediately after processing)</li>
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
              <li><strong>RevenueCat:</strong> Subscription management for mobile app</li>
              <li><strong>Supabase:</strong> Database hosting and file storage</li>
              <li><strong>Google Gemini AI (2.0 Flash):</strong> AI-powered grocery photo recognition, food item detection, and recipe analysis. Photos are sent to Google's servers for processing and deleted immediately after analysis.</li>
              <li><strong>Spoonacular:</strong> Recipe data and nutrition information</li>
              <li><strong>PostHog:</strong> Usage analytics</li>
              <li><strong>Meta (Facebook/Instagram):</strong> Advertising measurement and attribution for our mobile app ads. See section 5 for details on what is shared.</li>
            </ul>
            <p>
              These services have their own privacy policies and handle data according to their terms. For Google Gemini photo processing, see: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>. For Meta, see: <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Meta Privacy Policy</a>
            </p>
          </section>

          <section className="legal-page__section">
            <h2>5. Advertising and Attribution</h2>
            <p>
              We advertise Trackabite on Meta platforms (Facebook and Instagram). To understand which ads lead people to install and subscribe to our app, we share a limited amount of data with Meta.
            </p>

            <h3>What We Share with Meta</h3>
            <ul>
              <li>An anonymous app identifier generated by Meta's software development kit</li>
              <li>Your device's advertising identifier (IDFA), <strong>only if you grant permission</strong> through the iOS App Tracking Transparency prompt</li>
              <li>Subscription events — specifically when a free trial is started and when a subscription is purchased — sent to Meta by our subscription provider, RevenueCat</li>
            </ul>

            <h3>What We Do Not Share with Meta</h3>
            <ul>
              <li>Your name or email address</li>
              <li>Your photos, recipes, meal plans, meal logs, or grocery inventory</li>
              <li>Any content you create or store in the app</li>
            </ul>

            <h3>Your Choice on iOS (App Tracking Transparency)</h3>
            <p>
              On iOS, we ask for your permission before your device's advertising identifier is used for advertising measurement. <strong>Declining does not affect any app functionality</strong> — every feature works exactly the same either way. You can change this choice at any time in iOS Settings → Privacy &amp; Security → Tracking.
            </p>
            <p>
              Whether or not you grant permission, Apple's SKAdNetwork may provide us with aggregated, privacy-preserving measurement of ad performance. This aggregate reporting does not identify you personally.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>6. Data Storage and Security</h2>
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
            <h2>7. Data Retention and Account Deletion</h2>
            <p>
              We retain your data for as long as your account is active. You have the right to request deletion of your Trackabite account at any time.
            </p>

            <h3>How to Delete Your Account</h3>
            <ol>
              <li>Open the Trackabite app</li>
              <li>Go to Profile → Delete Account</li>
              <li>Review the warning about data loss</li>
              <li>Confirm deletion</li>
            </ol>

            <h3>30-Day Grace Period</h3>
            <ul>
              <li>When you request account deletion, your account will be <strong>scheduled for deletion in 30 days</strong></li>
              <li>During this 30-day grace period, you can cancel the deletion by logging back into your account</li>
              <li>Your data remains accessible during the grace period</li>
            </ul>

            <h3>What Gets Deleted</h3>
            <p>When your account is permanently deleted after the 30-day grace period, we will delete:</p>
            <ul>
              <li>Your account credentials (email, password, name)</li>
              <li>All saved recipes (imported and created)</li>
              <li>Meal plans and meal logs</li>
              <li>Grocery inventory items</li>
              <li>Shopping lists</li>
              <li>Cookbooks</li>
              <li>Subscription information (your subscription will be cancelled)</li>
              <li>Usage analytics and preferences</li>
            </ul>

            <h3>Subscription Cancellation</h3>
            <p>
              If you have an active subscription, it will be automatically cancelled when your account is deleted. You will not be charged after deletion, but you will not receive a refund for any remaining subscription period.
            </p>

            <h3>Data We May Retain</h3>
            <p>For legal, security, or business purposes, we may retain:</p>
            <ul>
              <li>Transaction records (required for tax and accounting compliance)</li>
              <li>Aggregated, anonymized analytics data (not linked to your identity)</li>
              <li>Backup data for up to 90 days (then permanently deleted)</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account (with 30-day grace period - see section 7)</li>
              <li>Delete detected grocery items from your inventory at any time</li>
              <li>Decline or revoke photo processing consent</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Opt out of advertising tracking by declining the App Tracking Transparency prompt, or by turning it off later in iOS Settings (see section 5)</li>
              <li>Withdraw consent at any time</li>
              <li>Contact us to inquire about photo processing practices</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>9. Cookies and Tracking</h2>
            <p>
              We use local storage and session storage to maintain your login session and app preferences. We use analytics to understand how users interact with our app and improve the experience.
            </p>
            <p>
              We also use advertising measurement to understand which of our ads lead people to install and subscribe to Trackabite. See section 5 for what is shared, what is not, and how to opt out.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>10. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 18. We do not knowingly collect information from children. If you are under 18, please do not use the Service.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>11. International Users</h2>
            <p>
              Your data may be transferred and processed in countries other than your country of residence. By using the Service, you consent to such transfers.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>12. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>13. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> hello@trackabite.app
            </p>
          </section>

          <section className="legal-page__section">
            <h2>14. Government and Legal Data Requests</h2>
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
            <h2>15. GDPR & CCPA Compliance</h2>
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
