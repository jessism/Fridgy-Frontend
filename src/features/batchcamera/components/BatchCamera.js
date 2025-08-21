import React from 'react';
import DirectCameraInterfaceV2 from './DirectCameraInterfaceV2';

const BatchCamera = ({ onComplete }) => {
  return <DirectCameraInterfaceV2 onComplete={onComplete} />;
};

export default BatchCamera;