import React, { useState } from 'react';
import { Settings, Play, Plus, Trash2, Info, AlertCircle } from 'lucide-react';
import ApiService from '../services/apiService';
import DiceDisplay from './diceDisplay';

const GameSetup = ({ onGameStart }) => {
  const [diceInputs, setDiceInputs] = useState([
    '2,2,4,4,9,9',
    '6,8,1,1,8,6',
    '7,5,3,7,5,3'
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewDice, setPreviewDice] = useState([]);

  const parseDiceInput = (input) => {
    try {
      const faces = input.split(',').map(face => {
        const num = parseInt(face.trim());
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      });

      if (faces.length !== 6) throw new Error('Must have 6 faces');

      return faces;
    } catch (err) {
      return null;
    }
  };

  const updatePreview = () => {
    const preview = diceInputs.map((input, index) => {
      const faces = parseDiceInput(input);
      return faces ? { name: `Dice ${index + 1}`, faces } : null;
    }).filter(Boolean);

    setPreviewDice(preview);
  };

  React.useEffect(() => {
    updatePreview();
  }, [diceInputs]);

  const addDice = () => {
    setDiceInputs([...diceInputs, '1,2,3,4,5,6']);
  };

  const removeDice = (index) => {
    if (diceInputs.length > 3) {
      setDiceInputs(diceInputs.filter((_, i) => i !== index));
    }
  };

  const updateDice = (index, value) => {
    const newInputs = [...diceInputs];
    newInputs[index] = value;
    setDiceInputs(newInputs);
  };

  const validateInputs = () => {
    if (diceInputs.length < 3) {
      return 'At least 3 dice are required';
    }

    for (let i = 0; i < diceInputs.length; i++) {
      const faces = parseDiceInput(diceInputs[i]);
      if (!faces) {
        return `Dice ${i + 1} has invalid format`;
      }
    }

    return null;
  };

  const startGame = async () => {
    const validation = validateInputs();
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ApiService.initGame(diceInputs);
      if (result.error) {
        setError(result.error + (result.example ? '\n\nExample: ' + result.example : ''));
      } else {
        onGameStart(result);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const loadPreset = (preset) => {
    const presets = {
      classic: ['2,2,4,4,9,9', '6,8,1,1,8,6', '7,5,3,7,5,3'],
      simple: ['1,1,6,6,8,8', '2,2,5,5,9,9', '3,3,4,4,7,7'],
      extreme: ['1,1,1,6,6,6', '2,2,2,5,5,5', '3,3,3,4,4,4']
    };

    setDiceInputs(presets[preset]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Domino Dice
          </h1>
          <p className="text-center text-blue-100 max-w-2xl mx-auto">
            Experience the fascinating world of non-transitive dice with cryptographically secure randomness
          </p>
        </div>

        <div className="p-8">
          {/* Quick Start Presets */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2" />
              Quick Start Presets
            </h3>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => loadPreset('classic')}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Classic Set
              </button>
              <button
                onClick={() => loadPreset('simple')}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              >
                Simple Set
              </button>
              <button
                onClick={() => loadPreset('extreme')}
                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Extreme Set
              </button>
            </div>
          </div>

          {/* Dice Configuration */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2" />
              Configure Dice
            </h2>
            <p className="text-gray-600 mb-6">
              Enter 6 comma-separated integers for each dice. Each dice must have exactly 6 faces.
            </p>

            <div className="space-y-4">
              {diceInputs.map((input, index) => {
                const isValid = parseDiceInput(input) !== null;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <label className="font-medium w-20 text-gray-700">
                      Dice {index + 1}:
                    </label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => updateDice(index, e.target.value)}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors text-gray-900 ${isValid
                          ? 'border-gray-300 focus:ring-blue-500'
                          : 'border-red-300 focus:ring-red-500 bg-red-50'
                          }`}
                        placeholder="e.g., 1,2,3,4,5,6"
                      />
                      {!isValid && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={20} />
                      )}
                    </div>
                    {diceInputs.length > 3 && (
                      <button
                        onClick={() => removeDice(index)}
                        className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Remove dice"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={addDice}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                disabled={diceInputs.length >= 8}
              >
                <Plus className="mr-2" size={16} />
                Add Dice
              </button>
              <button
                onClick={startGame}
                disabled={loading || validateInputs()}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="mr-2" size={16} />
                {loading ? 'Starting Game...' : 'Start Game'}
              </button>
            </div>
          </div>

          {/* Preview */}
          {previewDice.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Dice Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {previewDice.map((dice, index) => (
                  <DiceDisplay
                    key={index}
                    dice={dice}
                    size="sm"
                    disabled={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
                <div>
                  <h4 className="text-red-800 font-semibold mb-2">Configuration Error</h4>
                  <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
                </div>
              </div>
            </div>
          )}

          {/* How to Play */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
              <Info className="mr-2" size={20} />
              How to Play
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-blue-700 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Game Rules:</h4>
                <ul className="space-y-1">
                  <li>• Each player selects a different dice</li>
                  <li>• Both dice are rolled simultaneously</li>
                  <li>• Higher roll wins the round</li>
                  <li>• Play multiple rounds to determine overall winner</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Fair Play Features:</h4>
                <ul className="space-y-1">
                  <li>• Cryptographically secure random generation</li>
                  <li>• HMAC verification for transparency</li>
                  <li>• Player participation in randomness</li>
                  <li>• Probability tables for strategic planning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;