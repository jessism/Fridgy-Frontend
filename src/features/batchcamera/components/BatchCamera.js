import React from 'react';
import DirectCameraInterface from './DirectCameraInterface';

const BatchCamera = ({ onComplete }) => {
  return <DirectCameraInterface onComplete={onComplete} />;
};

export default BatchCamera;