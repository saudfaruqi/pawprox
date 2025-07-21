import React from 'react';

const PriceRange = ({ min, max, step, value, onChange, formatLabel }) => {
  const [low, high] = value;
  
  // Clamp to ensure low ≤ high
  const handleLowChange = e => {
    const newLow = Math.min(Number(e.target.value), high);
    onChange([newLow, high]);
  };
  
  const handleHighChange = e => {
    const newHigh = Math.max(Number(e.target.value), low);
    onChange([low, newHigh]);
  };

  return (
    <div className="w-full">
      <div className="relative h-2 bg-gray-200 rounded-full mb-4">
        {/* Colored range bar */}
        <div
          className="absolute h-full bg-[#2E6166] rounded-full"
          style={{
            left: `${((low - min) / (max - min)) * 100}%`,
            right: `${((max - high) / (max - min)) * 100}%`,
          }}
        />
        
        {/* Overlapped range inputs */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLowChange}
          className="absolute w-full h-2 opacity-0 cursor-pointer pointer-events-none"
          style={{ pointerEvents: 'auto' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHighChange}
          className="absolute w-full h-2 opacity-0 cursor-pointer pointer-events-none"
          style={{ pointerEvents: 'auto' }}
        />
      </div>
      
      {/* Value labels */}
      <div className="flex justify-between text-sm font-medium">
        <span className="px-3 py-1 bg-gray-100 rounded-lg">
          {formatLabel(low)}
        </span>
        <span className="px-3 py-1 bg-gray-100 rounded-lg">
          {formatLabel(high)}
        </span>
      </div>
    </div>
  );
};

export default PriceRange;