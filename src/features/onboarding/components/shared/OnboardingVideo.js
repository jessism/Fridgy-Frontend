import React, { useEffect, useRef, useState } from 'react';
import './OnboardingVideo.css';

/**
 * The autoplay contract in one place.
 *
 * muted + playsInline + autoPlay is the minimum browsers require for
 * unattended playback, and the play() promise must be swallowed because it
 * rejects whenever the browser declines. iOS Low Power Mode blocks autoplay
 * even when muted, so a failure renders the fallback rather than a black box.
 */
const OnboardingVideo = ({
  src,
  size,
  round = false,
  className = '',
  style = {},
  objectFit = 'contain',
}) => {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Autoplay declined (Low Power Mode, data saver, reduced motion).
        // The poster frame still shows, so we leave the element in place.
      });
    }
  }, [src]);

  const box = {
    width: size,
    height: size,
    borderRadius: round ? '50%' : undefined,
    ...style,
  };

  if (failed) {
    return (
      <div
        className={`ob-video ob-video--fallback ${className}`.trim()}
        style={box}
        aria-hidden="true"
      />
    );
  }

  return (
    <video
      ref={ref}
      className={`ob-video ${className}`.trim()}
      style={{ ...box, objectFit }}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  );
};

export default OnboardingVideo;
