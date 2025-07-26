import React from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DiceFace = ({ value, size = 'md', animate = false }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 28,
    xl: 36
  };
  
  const DiceComponents = {
    1: Dice1, 
    2: Dice2, 
    3: Dice3, 
    4: Dice4, 
    5: Dice5, 
    6: Dice6
  };
  
  // For values > 6, use Dice6 and show the number
  const displayValue = Math.min(6, Math.max(1, value));
  const DiceComponent = DiceComponents[displayValue];
  
  return (
    <div className={`
      ${sizeClasses[size]} 
      flex items-center justify-center 
      bg-white border-2 border-gray-300 
      rounded-lg shadow-md relative
      ${animate ? 'animate-bounce' : ''}
      transition-all duration-200
    `}>
      <DiceComponent 
        className="text-gray-700" 
        size={iconSizes[size]} 
      />
      {value > 6 && (
        <span className="absolute -top-1 -right-1 text-xs font-bold text-red-600 bg-white rounded-full px-1 border border-red-200">
          {value}
        </span>
      )}
      {value === 0 && (
        <span className="absolute text-xs font-bold text-gray-600">
          0
        </span>
      )}
    </div>
  );
};

export default DiceFace;