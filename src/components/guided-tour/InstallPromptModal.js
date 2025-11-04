import React from 'react';
import ReactDOM from 'react-dom';
import './InstallPromptModal.css';
import starIcon from '../../assets/icons/star.png';

const InstallPromptModal = ({ isOpen, onInstall, onClose }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="install-prompt-modal__overlay">
      <div className="install-prompt-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="install-prompt-modal__header">
          <div className="install-prompt-modal__icon">
            <img src={starIcon} alt="Star" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          </div>
          <h2 className="install-prompt-modal__title">
            Enjoy the full experience
          </h2>
          <p className="install-prompt-modal__subtitle">
            Add Trackabite to home screen to enjoy full experience, quick access, and faster support
          </p>
        </div>

        <button className="install-prompt-modal__install-button" onClick={onInstall}>
          Add to homescreen
        </button>

        <button className="install-prompt-modal__skip" onClick={onClose}>
          Skip the full experience for now
        </button>
      </div>
    </div>,
    document.body
  );
};

export default InstallPromptModal;
