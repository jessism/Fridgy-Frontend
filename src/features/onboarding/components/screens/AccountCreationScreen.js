import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { OnboardingLayout, OnboardingButton } from '../shared';
import { STORAGE_KEYS } from '../../constants/onboardingConstants';
import './AccountCreationScreen.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATORS = {
  firstName: (v) => (v.trim().length >= 2 ? null : 'At least 2 characters'),
  email: (v) => (EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email'),
  password: (v) => (v.length >= 8 ? null : 'At least 8 characters'),
};

const AccountCreationScreen = ({ data, updateData, onComplete, onBack, loading, error, setError }) => {
  const account = data.accountData || {};
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const paid = (() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PAYMENT_COMPLETED) === 'true';
    } catch (e) {
      return false;
    }
  })();

  const setField = (field, value) => {
    if (error) setError(null);
    updateData({ accountData: { ...account, [field]: value } });
  };

  const errorFor = (field) =>
    touched[field] ? VALIDATORS[field](account[field] || '') : null;

  const isValid = Object.keys(VALIDATORS).every(
    (f) => !VALIDATORS[f](account[f] || '')
  );

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched({ firstName: true, email: true, password: true });
    if (isValid && !loading) onComplete();
  };

  const field = (name, label, props) => (
    <div className="ob-field">
      <label className="ob-field__label" htmlFor={`ob-${name}`}>
        {label}
      </label>
      <div className="ob-field__control">
        <input
          id={`ob-${name}`}
          className={`ob-field__input ${errorFor(name) ? 'ob-field__input--error' : ''}`.trim()}
          value={account[name] || ''}
          onChange={(e) => setField(name, e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, [name]: true }))}
          disabled={loading}
          {...props}
        />
        {name === 'password' && (
          <button
            type="button"
            className="ob-field__eye"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {errorFor(name) && <p className="ob-field__error">{errorFor(name)}</p>}
    </div>
  );

  return (
    <OnboardingLayout showBack onBack={onBack}>
      <form className="ob-account" onSubmit={onSubmit}>
        <div className="ob-account__head">
          <h1 className="ob-h1 ob-account__title">
            {paid ? 'Complete your account' : 'Create your account'}
          </h1>
          <p className="ob-sub">
            {paid
              ? 'Your trial is active! Just a few details to get you started.'
              : 'Just a few details to get you started'}
          </p>
        </div>

        <div className="ob-account__fields">
          {field('firstName', 'First name', {
            type: 'text',
            placeholder: 'Your first name',
            autoComplete: 'given-name',
          })}
          {field('email', 'Email', {
            type: 'email',
            placeholder: 'you@example.com',
            autoComplete: 'email',
            inputMode: 'email',
          })}
          {field('password', 'Password', {
            type: showPassword ? 'text' : 'password',
            placeholder: 'At least 8 characters',
            autoComplete: 'new-password',
          })}
        </div>

        {error && <p className="ob-account__error">{error}</p>}

        <div className="ob-footer">
          <OnboardingButton type="submit" disabled={!isValid} loading={loading}>
            Create Account
          </OnboardingButton>
          <p className="ob-footnote ob-account__legal">
            By creating an account, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </form>
    </OnboardingLayout>
  );
};

export default AccountCreationScreen;
