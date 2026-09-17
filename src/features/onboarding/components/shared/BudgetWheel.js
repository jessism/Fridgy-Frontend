import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BUDGET_VALUES,
  BUDGET_ITEM_HEIGHT as ITEM_H,
} from '../../constants/onboardingConstants';
import './BudgetWheel.css';

// The centring spacer height ((VISIBLE - 1) / 2 * ITEM_H) lives in
// BudgetWheel.css; both are derived from the same two constants.

/**
 * Snap wheel picker, replacing the web's old range slider to match the app.
 *
 * Two things make this behave on touch devices:
 *  - the highlighted row updates live while scrolling (local state) but
 *    `onChange` only fires once the scroll settles, so we don't write to
 *    localStorage on every frame via useOnboarding;
 *  - the settled index is always recomputed from scrollTop rather than
 *    tracked incrementally, because iOS momentum scrolling overshoots snap
 *    points and an incremental count drifts.
 */
const BudgetWheel = ({ value, onChange, symbol = '$' }) => {
  const ref = useRef(null);
  const settleTimer = useRef(null);
  // Set while we scroll the list ourselves, so our own scroll doesn't
  // bounce back through onChange.
  const programmatic = useRef(false);

  const indexOfValue = useCallback((v) => {
    const i = BUDGET_VALUES.indexOf(v);
    return i === -1 ? BUDGET_VALUES.indexOf(100) : i;
  }, []);

  const [active, setActive] = useState(() => indexOfValue(value));

  // Centre on the current value at mount, without smooth scrolling.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const i = indexOfValue(value);
    programmatic.current = true;
    el.scrollTop = i * ITEM_H;
    setActive(i);
    // One frame is enough for the browser to emit the scroll event.
    const id = requestAnimationFrame(() => {
      programmatic.current = false;
    });
    return () => cancelAnimationFrame(id);
    // Mount only: re-centring on every `value` change would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const i = Math.max(
      0,
      Math.min(BUDGET_VALUES.length - 1, Math.round(el.scrollTop / ITEM_H))
    );
    setActive(i);
    if (!programmatic.current && BUDGET_VALUES[i] !== value) {
      onChange(BUDGET_VALUES[i]);
    }
  }, [onChange, value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const onScroll = () => {
      // Track the finger immediately so the highlight follows the list.
      const i = Math.max(
        0,
        Math.min(BUDGET_VALUES.length - 1, Math.round(el.scrollTop / ITEM_H))
      );
      setActive(i);

      // `scrollend` is Chrome 114+/Firefox 109+/Safari 17.4+; older Safari
      // needs the debounce, so we keep both and let whichever fires first win.
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(settle, 120);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    const hasScrollEnd = 'onscrollend' in window;
    if (hasScrollEnd) el.addEventListener('scrollend', settle);

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (hasScrollEnd) el.removeEventListener('scrollend', settle);
      clearTimeout(settleTimer.current);
    };
  }, [settle]);

  const scrollToIndex = (i, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(BUDGET_VALUES.length - 1, i));
    el.scrollTo({ top: next * ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      scrollToIndex(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      scrollToIndex(active - 1);
    }
  };

  return (
    <div className="ob-wheel">
      <div className="ob-wheel__band" aria-hidden="true" />
      <div className="ob-wheel__mask ob-wheel__mask--top" aria-hidden="true" />
      <div className="ob-wheel__mask ob-wheel__mask--bottom" aria-hidden="true" />

      <div
        className="ob-wheel__scroller"
        ref={ref}
        tabIndex={0}
        role="listbox"
        aria-label="Weekly grocery budget"
        onKeyDown={onKeyDown}
      >
        <div className="ob-wheel__spacer" />
        {BUDGET_VALUES.map((v, i) => (
          <div
            key={v}
            role="option"
            aria-selected={i === active}
            className={`ob-wheel__item ${i === active ? 'ob-wheel__item--active' : ''}`.trim()}
            onClick={() => scrollToIndex(i)}
          >
            {symbol}
            {v}
          </div>
        ))}
        <div className="ob-wheel__spacer" />
      </div>
    </div>
  );
};

export default BudgetWheel;
