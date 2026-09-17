import React from 'react';
import OnboardingVideo from './OnboardingVideo';
import './PhoneMock.css';

/** The app's phone frame around a screen recording: 9/19.5, soft grey bezel. */
const PhoneMock = ({ src }) => (
  <div className="ob-phone">
    <div className="ob-phone__screen">
      <OnboardingVideo
        src={src}
        className="ob-phone__video"
        objectFit="cover"
      />
    </div>
  </div>
);

export default PhoneMock;
