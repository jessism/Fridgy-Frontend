import React from 'react';
import { PRELOAD_VIDEOS } from '../../constants/onboardingConstants';

/**
 * The four feature clips are 1-3.4MB each. Without this, steps 11-14 each
 * stall on a cold fetch; mounting hidden preloading elements a few steps
 * earlier means they are warm by the time the user arrives.
 */
const OnboardingVideoPreloader = ({ active }) => {
  if (!active) return null;

  return (
    <div
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {PRELOAD_VIDEOS.map((src) => (
        <video key={src} src={src} preload="auto" muted playsInline />
      ))}
    </div>
  );
};

export default OnboardingVideoPreloader;
