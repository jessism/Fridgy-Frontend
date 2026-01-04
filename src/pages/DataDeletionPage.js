/**
 * Data Deletion Page
 * Instructions for users to request deletion of their data (required by Facebook)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

function DataDeletionPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Data Deletion Request</h1>
        <p className="legal-page__updated">How to delete your Trackabite data</p>

        <div className="legal-page__content">
          <section className="legal-page__section">
            <h2>Request Data Deletion</h2>
            <p>
              You have the right to request deletion of all your personal data from Trackabite.
              To request deletion of your data, please send an email to:
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:hello@trackabite.app?subject=Data%20Deletion%20Request">
                hello@trackabite.app
              </a>
            </p>
          </section>

          <section className="legal-page__section">
            <h2>What to Include in Your Request</h2>
            <p>Please include the following in your email:</p>
            <ul>
              <li><strong>Subject line:</strong> "Data Deletion Request"</li>
              <li><strong>Your account email address:</strong> The email you used to sign up for Trackabite</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>What Data Will Be Deleted</h2>
            <p>Upon your request, we will delete all data associated with your account, including:</p>
            <ul>
              <li>Account information (name, email, password)</li>
              <li>Inventory items and food tracking history</li>
              <li>Saved and imported recipes</li>
              <li>Meal logs and meal photos</li>
              <li>Meal plans</li>
              <li>Shopping lists</li>
              <li>Dietary preferences and allergies</li>
              <li>Subscription and billing history</li>
              <li>App preferences and settings</li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>Processing Time</h2>
            <p>
              We will process your data deletion request within <strong>30 days</strong> of receiving it.
              You will receive a confirmation email once your data has been deleted.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>Important Notes</h2>
            <ul>
              <li>Data deletion is permanent and cannot be undone</li>
              <li>You will no longer be able to access your Trackabite account after deletion</li>
              <li>If you have an active subscription, please cancel it before requesting deletion</li>
              <li>Some data may be retained for legal compliance purposes as outlined in our <Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>Questions?</h2>
            <p>
              If you have any questions about data deletion or our privacy practices, please contact us at{' '}
              <a href="mailto:hello@trackabite.app">hello@trackabite.app</a> or review our{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DataDeletionPage;
