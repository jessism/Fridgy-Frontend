import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * A small "i" that explains how a number is defined. Hover shows the native
 * tooltip; click pins a popover (touch has no hover). Escape or an outside
 * click closes it.
 */
const InfoTip = ({ text, label = 'How this is calculated' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!text) return null;
  return (
    <span className="ad-infotip" ref={ref}>
      <button
        type="button"
        className="ad-infotip__btn"
        title={text}
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      >
        <Info size={14} aria-hidden="true" />
      </button>
      {open && <span className="ad-infotip__pop" role="tooltip">{text}</span>}
    </span>
  );
};

export default InfoTip;
