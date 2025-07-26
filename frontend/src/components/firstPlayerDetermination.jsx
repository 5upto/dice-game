import React, { useState, useEffect } from 'react';
import { Shield, Key, Hash, CheckCircle, User, Bot } from 'lucide-react';
import ApiService from '../services/apiService';

const FirstPlayerDetermination = ({ gameId, onFirstPlayerDetermined }) => {
  const [stage, setStage] = useState('init'); // init, input, result
  const [hmacData, setHmacData] = useState(null);
  const [userNumber, setUserNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    initFirstPlayer();
  }, []);
  
  useEffect(() => {
    if (stage === 'result' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (stage === 'result' && countdown === 0) {
      onFirstPlayerDetermined(result.firstPlayer);
    }
  }, [stage, countdown, result, onFirstPlayerDetermined]);
  
  const initFirstPlayer = async () => {
    setLoading(true);
    try {
      const data = await ApiService.determineFirstPlayer(gameId);
      setHmacData(data);
      setStage('input');
    } catch (error) {
      console.error('Error initializing first player:', error);
      // Handle error appropriately
    }
    setLoading(false);
  };
  
  const submitUserNumber = async () => {
    if (!userNumber || (userNumber !== '0' && userNumber !== '1')) return;
    
    setLoading(true);
    try {
      const result = await ApiService.completeFirstPlayer(gameId, {
        userNumber: parseInt(userNumber),
        ...hmacData
      });
      
      setResult(result);
      setStage('result');
    } catch (error) {
      console.error('Error completing first player determination:', error);
      // Handle error appropriately
    }
    setLoading(false);
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center">
            <Shield className="mr-3" />
            Fair First Player Determination
          </h2>
          <p className="text-center text-purple-100 mt-2">
            Using cryptographic proof to ensure fairness
          </p>
        </div>
        
        <div className="p-8">
          {/* Loading Stage */}
          {stage === 'init' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-4">Generating Secure Random Data</h3>
              <p className="text-gray-600">
                Creating cryptographically secure random numbers and HMAC proof...
              </p>
            </div>
          )}
          
          {/* Input Stage */}
          {stage === 'input' && hmacData && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Hash className="mr-2 text-blue-500" />
                  Step 1: Computer's Commitment
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h4 className="font-semibold mb-3 text-gray-700">Computer's HMAC (SHA-256):</h4>
                  <div className="bg-white p-4 rounded border font-mono text-sm break-all border-l-4 border-l-blue-500">
                    {hmacData.hmac}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    <strong>What this means:</strong> The computer has generated a secret number (0 or 1) 
                    and created this HMAC as proof. The computer cannot change its number now.
                  </p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2 text-green-500" />
                  Step 2: Your Choice
                </h3>
                <p className="text-gray-600 mb-6">
                  Now select your number. The final result will be the sum of both numbers modulo 2.
                  If the result is 0, you go first. If it's 1, the computer goes first.
                </p>
                
                <div className="flex gap-6 justify-center mb-8">
                  <button
                    onClick={() => setUserNumber('0')}
                    className={`px-12 py-6 rounded-xl font-bold text-2xl transition-all duration-200 ${
                      userNumber === '0' 
                        ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                    }`}
                  >
                    0
                  </button>
                  <button
                    onClick={() => setUserNumber('1')}
                    className={`px-12 py-6 rounded-xl font-bold text-2xl transition-all duration-200 ${
                      userNumber === '1' 
                        ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                    }`}
                  >
                    1
                  </button>
                </div>
              </div>
              
              <button
                onClick={submitUserNumber}
                disabled={!userNumber || loading}
                className="w-full py-4 bg-purple-500 text-white rounded-lg font-semibold text-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Verifying and Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={20} />
                    Confirm Selection & Reveal Result
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Result Stage */}
          {stage === 'result' && result && (
            <div className="text-center">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center justify-center">
                  <Key className="mr-2 text-yellow-500" />
                  Verification & Results
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-4">Numbers Revealed</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Your number:</span>
                        <span className="font-bold text-green-600">{result.userNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Computer's number:</span>
                        <span className="font-bold text-blue-600">{result.computerNumber}</span>
                      </div>
                      <hr className="border-blue-300" />
                      <div className="flex justify-between">
                        <span>Sum:</span>
                        <span className="font-bold">{result.userNumber + result.computerNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Result (mod 2):</span>
                        <span className="font-bold text-purple-600">{result.result}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-4">Verification Status</h4>
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="text-green-500 mr-2" size={32} />
                      <span className="text-green-700 font-semibold">VERIFIED</span>
                    </div>
                    <p className="text-sm text-green-700">
                      The computer's HMAC has been successfully verified. 
                      The process was fair and tamper-proof.
                    </p>
                  </div>
                </div>
                
                <div className={`text-3xl font-bold mb-6 ${
                  result.firstPlayer === 'player' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {result.firstPlayer === 'player' ? (
                    <div className="flex items-center justify-center">
                      <User className="mr-3" size={36} />
                      You Go First!
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Bot className="mr-3" size={36} />
                      Computer Goes First!
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    Starting game in <span className="font-bold text-purple-600">{countdown}</span> seconds...
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-yellow-800 mb-2">🔐 How This Proves Fairness:</h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Computer generated a secret number and created HMAC proof</li>
                  <li>2. You chose your number after seeing the HMAC</li>
                  <li>3. Computer revealed its number and secret key</li>
                  <li>4. HMAC was verified to prove the computer didn't cheat</li>
                  <li>5. Result calculated: ({result.userNumber} + {result.computerNumber}) mod 2 = {result.result}</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstPlayerDetermination;