import React from 'react';
import DiceFace from './diceFace';

const DiceDisplay = ({ 
  dice, 
  isSelected = false, 
  onClick, 
  disabled = false, 
  showOwner = false,
  owner = null,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const ownerColors = {
    player: 'border-green-500 bg-green-50',
    computer: 'border-blue-500 bg-blue-50'
  };
  
  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 rounded-lg cursor-pointer transition-all duration-200
        ${isSelected 
          ? (owner ? ownerColors[owner] : 'border-blue-500 bg-blue-50') + ' shadow-lg transform scale-105' 
          : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-semibold text-center flex-1 ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg'
        }`}>
          {dice.name}
        </h3>
        {showOwner && owner && (
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            owner === 'player' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {owner === 'player' ? 'You' : 'Computer'}
          </span>
        )}
      </div>
      
      <div className={`grid gap-2 ${
        size === 'sm' ? 'grid-cols-6' : 'grid-cols-3'
      }`}>
        {dice.faces.map((face, index) => (
          <DiceFace 
            key={index} 
            value={face} 
            size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'} 
          />
        ))}
      </div>
      
      <div className={`mt-2 text-gray-600 text-center ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}>
        Faces: {dice.faces.join(', ')}
      </div>
      
      {isSelected && (
        <div className="mt-2 text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-white font-semibold ${
            owner === 'player' ? 'bg-green-500' : owner === 'computer' ? 'bg-blue-500' : 'bg-gray-500'
          }`}>
            Selected
          </span>
        </div>
      )}
    </div>
  );
};

export default DiceDisplay;