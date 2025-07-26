import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Info } from 'lucide-react';

const ProbabilityTable = ({ probabilities, compact = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(compact);
  
  if (!probabilities) return null;
  
  const getCellColor = (probability) => {
    const prob = parseFloat(probability.replace('%', ''));
    if (prob > 60) return 'bg-green-100 text-green-800';
    if (prob >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="p-4 bg-gray-50 border-b cursor-pointer flex items-center justify-between"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-xl font-bold flex items-center">
          <BarChart3 className="mr-2" />
          Win Probabilities
        </h3>
        <div className="flex items-center">
          <Info className="mr-2 text-gray-500" size={16} />
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-6">
          <div className="mb-4 text-sm text-gray-600">
            <p>This table shows the probability of each dice winning against others.</p>
            <p className="mt-1">
              <span className="inline-block w-3 h-3 bg-green-100 rounded mr-1"></span>
              Good advantage ({'>'}60%)
              <span className="inline-block w-3 h-3 bg-yellow-100 rounded mr-1 ml-3"></span>
              Moderate (40-60%)
              <span className="inline-block w-3 h-3 bg-red-100 rounded mr-1 ml-3"></span>
              Disadvantage ({'<'}40%)
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {probabilities.headers.map((header, index) => (
                    <th 
                      key={index} 
                      className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {probabilities.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className={`
                          border border-gray-300 px-4 py-3
                          ${cellIndex === 0 
                            ? 'font-semibold text-gray-800' 
                            : `text-center font-medium ${
                                cell === '50.00%' ? 'text-gray-600' : getCellColor(cell)
                              }`
                          }
                        `}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>
              <strong>Non-transitive property:</strong> Even if Dice A beats Dice B, and Dice B beats Dice C, 
              Dice C might still beat Dice A! This creates interesting strategic choices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProbabilityTable;