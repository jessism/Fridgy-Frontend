import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { OnboardingLayout, OnboardingButton, OnboardingVideo } from '../shared';
import { VIDEOS } from '../../constants/onboardingConstants';
import { requestOnboardingPushPermission } from '../../utils/pushOptIn';
import './PushNotificationsScreen.css';

const CHECKLIST = ['Expiration alerts', 'Meal reminders'];

const NOTICES = {
  denied: 'No problem — you can turn these on later in Settings.',
  requires_install:
    'Add Trackabite to your home screen to get alerts on this device.',
};

const PushNotificationsScreen = ({ data, updateData, onNext, onBack, progress }) => {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  /*
   * Must run from the click, not on mount — browsers only honour a
   * permission request that follows a user gesture. The subscription itself
   * is deferred to after signup (there is no bearer token yet); see
   * registerDeferredPush in useOnboarding.
   */
  const onEnable = async () => {
    setBusy(true);
    setNotice(null);

    const { status } = await requestOnboardingPushPermission();

    if (status === 'granted') {
      updateData({
        pushPermission: 'granted',
        notificationPreferences: {
          ...data.notificationPreferences,
          expirationAlerts: true,
          mealReminders: true,
        },
      });
      setBusy(false);
      onNext();
      return;
    }

    if (status === 'denied') {
      updateData({
        pushPermission: 'denied',
        notificationPreferences: {
          mealReminders: false,
          expirationAlerts: false,
          weeklyReports: false,
        },
      });
    } else {
      // unsupported / requires_install — nothing was asked, so leave the
      // preferences alone and let the user carry on.
      updateData({ pushPermission: status });
    }

    setBusy(false);

    if (NOTICES[status]) {
      // Show why, then let them move on themselves.
      setNotice(NOTICES[status]);
    } else {
      onNext();
    }
  };

  const onSkip = () => {
    updateData({ pushPermission: 'default' });
    onNext();
  };

  return (
    <OnboardingLayout showBack onBack={onBack} progress={progress}>
      <div className="ob-push">
        <OnboardingVideo src={VIDEOS.notify} className="ob-push__mascot" round />

        <h1 className="ob-h1 ob-push__title">Stay in the loop</h1>
        <p className="ob-sub">
          I'll remind you before food expires and suggest meals so nothing gets
          forgotten in the fridge.
        </p>

        <ul className="ob-push__list">
          {CHECKLIST.map((item) => (
            <li key={item}>
              <Check size={18} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {notice && <p className="ob-footnote ob-push__notice">{notice}</p>}
      </div>

      <div className="ob-footer">
        {notice ? (
          <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
        ) : (
          <OnboardingButton onClick={onEnable} loading={busy}>
            Enable Notifications
          </OnboardingButton>
        )}
        <OnboardingButton variant="ghost" onClick={onSkip} disabled={busy}>
          Maybe Later
        </OnboardingButton>
      </div>
    </OnboardingLayout>
  );
};

export default PushNotificationsScreen;
