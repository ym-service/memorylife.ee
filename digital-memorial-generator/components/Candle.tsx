
import React from 'react';

interface CandleProps {
  isOn: boolean;
}

export const Candle: React.FC<CandleProps> = ({ isOn }) => {
  return (
    <span className="inline-flex items-end gap-1.5" aria-hidden="true">
      <span
        className={`w-2.5 h-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[radial-gradient(closest-side,#ffd08a,#d49537_60%,#6c3e16_95%)] origin-bottom transition-opacity duration-500 ${isOn ? 'opacity-100 animate-flicker' : 'opacity-0'}`}
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,185,109,.5))' }}
      ></span>
      <span className="w-0.5 h-2.5 bg-[#2e2119] mx-auto"></span>
      <span className="w-0.5 h-3.5 bg-[#8b6a3d]"></span>
    </span>
  );
};
