import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center z-10">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing Scenario...</p>
      <p className="text-sm text-gray-500">Please wait while the AI processes the details.</p>
    </div>
  );
};

export default LoadingOverlay;
