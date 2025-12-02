import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TimePickerModal.css';

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const PERIODS = ['AM', 'PM'];

const ITEM_HEIGHT = 50;

/**
 * iOS-style scroll wheel time picker modal
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler, receives time in 24h format (HH:MM)
 * @param {string} initialTime - Initial time in 24h format (HH:MM)
 * @param {string} mealType - Meal type for header display
 */
const TimePickerModal = ({ isOpen, onClose, onSave, initialTime, mealType }) => {
  // Parse initial time into 12h format
  const parseTime = useCallback((time24) => {
    if (!time24) return { hour: 12, minute: '00', period: 'PM' };

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;

    // Find closest minute in our options
    const minuteNum = minutes || 0;
    const closestMinute = MINUTES.reduce((prev, curr) => {
      return Math.abs(parseInt(curr) - minuteNum) < Math.abs(parseInt(prev) - minuteNum) ? curr : prev;
    });

    return { hour: hour12, minute: closestMinute, period };
  }, []);

  const initial = parseTime(initialTime);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(initial.period);

  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const periodRef = useRef(null);

  // Reset values when modal opens with new time
  useEffect(() => {
    if (isOpen) {
      const parsed = parseTime(initialTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
    }
  }, [isOpen, initialTime, parseTime]);

  // Scroll to initial position when modal opens
  useEffect(() => {
    if (isOpen) {
      const parsed = parseTime(initialTime);

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (hourRef.current) {
          const hourIndex = HOURS.indexOf(parsed.hour);
          hourRef.current.scrollTo({ top: hourIndex * ITEM_HEIGHT, behavior: 'auto' });
        }
        if (minuteRef.current) {
          const minuteIndex = MINUTES.indexOf(parsed.minute);
          minuteRef.current.scrollTo({ top: minuteIndex * ITEM_HEIGHT, behavior: 'auto' });
        }
        if (periodRef.current) {
          const periodIndex = PERIODS.indexOf(parsed.period);
          periodRef.current.scrollTo({ top: periodIndex * ITEM_HEIGHT, behavior: 'auto' });
        }
      }, 50);
    }
  }, [isOpen, initialTime, parseTime]);

  // Handle scroll to determine selected value
  const handleScroll = (ref, items, setter) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    setter(items[clampedIndex]);
  };

  // Convert to 24h format and save
  const handleSave = () => {
    // Read current scroll positions directly from refs to ensure we get the actual position
    const hourIndex = hourRef.current ? Math.round(hourRef.current.scrollTop / ITEM_HEIGHT) : HOURS.indexOf(selectedHour);
    const minuteIndex = minuteRef.current ? Math.round(minuteRef.current.scrollTop / ITEM_HEIGHT) : MINUTES.indexOf(selectedMinute);
    const periodIndex = periodRef.current ? Math.round(periodRef.current.scrollTop / ITEM_HEIGHT) : PERIODS.indexOf(selectedPeriod);

    const hour = HOURS[Math.max(0, Math.min(hourIndex, HOURS.length - 1))];
    const minute = MINUTES[Math.max(0, Math.min(minuteIndex, MINUTES.length - 1))];
    const period = PERIODS[Math.max(0, Math.min(periodIndex, PERIODS.length - 1))];

    let hour24 = hour;
    if (period === 'AM') {
      if (hour === 12) hour24 = 0;
    } else {
      if (hour !== 12) hour24 = hour + 12;
    }

    const time24 = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onSave(time24);
  };

  // Get meal type label for header
  const getMealLabel = () => {
    if (!mealType) return 'Meal';
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  if (!isOpen) return null;

  return (
    <div className="time-picker-modal__overlay" onClick={onClose}>
      <div className="time-picker-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="time-picker-modal__header">
          <h3>Set {getMealLabel()} Time</h3>
        </div>

        <div className="time-picker-modal__wheels-container">
          {/* Hour wheel */}
          <div className="time-picker-modal__wheel-wrapper">
            <div
              ref={hourRef}
              className="time-picker-modal__wheel"
              onScroll={() => handleScroll(hourRef, HOURS, setSelectedHour)}
            >
              <div className="time-picker-modal__wheel-padding" />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className={`time-picker-modal__wheel-item ${selectedHour === hour ? 'time-picker-modal__wheel-item--selected' : ''}`}
                >
                  {hour}
                </div>
              ))}
              <div className="time-picker-modal__wheel-padding" />
            </div>
          </div>

          <div className="time-picker-modal__separator">:</div>

          {/* Minute wheel */}
          <div className="time-picker-modal__wheel-wrapper">
            <div
              ref={minuteRef}
              className="time-picker-modal__wheel"
              onScroll={() => handleScroll(minuteRef, MINUTES, setSelectedMinute)}
            >
              <div className="time-picker-modal__wheel-padding" />
              {MINUTES.map((minute) => (
                <div
                  key={minute}
                  className={`time-picker-modal__wheel-item ${selectedMinute === minute ? 'time-picker-modal__wheel-item--selected' : ''}`}
                >
                  {minute}
                </div>
              ))}
              <div className="time-picker-modal__wheel-padding" />
            </div>
          </div>

          {/* AM/PM wheel */}
          <div className="time-picker-modal__wheel-wrapper">
            <div
              ref={periodRef}
              className="time-picker-modal__wheel time-picker-modal__wheel--period"
              onScroll={() => handleScroll(periodRef, PERIODS, setSelectedPeriod)}
            >
              <div className="time-picker-modal__wheel-padding" />
              {PERIODS.map((period) => (
                <div
                  key={period}
                  className={`time-picker-modal__wheel-item ${selectedPeriod === period ? 'time-picker-modal__wheel-item--selected' : ''}`}
                >
                  {period}
                </div>
              ))}
              <div className="time-picker-modal__wheel-padding" />
            </div>
          </div>

          {/* Selection highlight */}
          <div className="time-picker-modal__highlight" />
        </div>

        <div className="time-picker-modal__actions">
          <button
            className="time-picker-modal__btn time-picker-modal__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="time-picker-modal__btn time-picker-modal__btn--save"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;
