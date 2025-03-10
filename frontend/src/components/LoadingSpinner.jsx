import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading</h2>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;