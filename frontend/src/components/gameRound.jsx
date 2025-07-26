import React, { useState, useEffect } from 'react';
import { User, Bot, Trophy, RotateCcw, Eye, EyeOff, Hash, Key, Target } from 'lucide-react';
import ApiService from '../services/apiService';
import DiceDisplay from './diceDisplay';
import DiceFace from './diceFace';
import ProbabilityTable from './probabilityTable';

const GameRound = ({ gameData, firstPlayer, onGameEnd }) => {
  const [currentPlayer, setCurrentPlayer] = useState(firstPlayer);
  const [selectedDice, setSelectedDice] = useState({ player: null, computer: null });
  const [gameState, setGameState] = useState('selecting'); // selecting, rolling, result
  const [roundResult, setRoundResult] = useState(null);
  const [gameStats, setGameStats] = useState({ playerWins: 0, computerWins: 0, totalRounds: 0 });
  const [userNumber, setUserNumber] = useState('');
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hmacData, setHmacData] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const selectDice = async (diceIndex) => {
    if (currentPlayer === 'player' && selectedDice.player === null) {
      setSelectedDice(prev => ({ ...prev, player: diceIndex }));
      setLoading(true);

      try {
        // Get computer's dice selection
        const availableDice = gameData.dice.filter((_, index) => index !== diceIndex);
        const computerMove = await ApiService.getComputerMove(gameData.gameId, availableDice);
        const originalComputerIndex = gameData.dice.findIndex(dice =>
          dice.name === computerMove.computerDiceName
        );

        setSelectedDice(prev => ({ ...prev, computer: originalComputerIndex }));
        setGameState('rolling');
      } catch (error) {
        console.error('Error getting computer move:', error);
      }

      setLoading(false);
    }
  };

  const rollDice = async () => {
    const userNum = parseInt(userNumber);
    if (isNaN(userNum) || userNum < 0 || userNum > 5) {
      alert('Please enter a number between 0 and 5');
      return;
    }

    setIsRolling(true);
    setLoading(true);

    try {
      const result = await ApiService.playRound(gameData.gameId, {
        playerDiceIndex: selectedDice.player,
        computerDiceIndex: selectedDice.computer,
        userNumber: userNum
      });

      // Add delay for rolling animation
      setTimeout(() => {
        setRoundResult(result);
        setGameStats(result.gameStats);
        setGameState('result');
        setIsRolling(false);
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Error playing round:', error);
      setIsRolling(false);
      setLoading(false);
    }
  };

  const nextRound = () => {
    setSelectedDice({ player: null, computer: null });
    setRoundResult(null);
    setUserNumber('');
    setGameState('selecting');
    setCurrentPlayer(firstPlayer);
    setHmacData(null);
  };

  const resetGame = () => {
    onGameEnd();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Dice Battle Arena</h2>

          {/* Game Stats */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <User className="text-green-600" size={24} />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gameStats.playerWins}</div>
                <div className="text-sm text-gray-600">You</div>
              </div>
            </div>

            <div className="text-2xl font-bold text-gray-400">VS</div>

            <div className="flex items-center gap-2">
              <Bot className="text-blue-600" size={24} />
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gameStats.computerWins}</div>
                <div className="text-sm text-gray-600">Computer</div>
              </div>
            </div>

            <div className="border-l pl-8">
              <div className="text-2xl font-bold text-gray-600">{gameStats.totalRounds}</div>
              <div className="text-sm text-gray-600">Rounds</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowProbabilities(!showProbabilities)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
            >
              {showProbabilities ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="ml-2">{showProbabilities ? 'Hide' : 'Show'} Odds</span>
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <RotateCcw size={16} className="mr-2" />
              New Game
            </button>
          </div>
        </div>
      </div>

      {/* Probability Table */}
      {showProbabilities && (
        <ProbabilityTable probabilities={gameData.probabilities} />
      )}

      {/* Dice Selection Phase */}
      {gameState === 'selecting' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold mb-6 text-center">
            {currentPlayer === 'player' ? 'Choose Your Dice' : 'Computer is Selecting...'}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gameData.dice.map((dice, index) => (
              <DiceDisplay
                key={index}
                dice={dice}
                isSelected={selectedDice.player === index || selectedDice.computer === index}
                onClick={() => selectDice(index)}
                disabled={loading || selectedDice.player !== null}
                showOwner={selectedDice.player === index || selectedDice.computer === index}
                owner={selectedDice.player === index ? 'player' : selectedDice.computer === index ? 'computer' : null}
              />
            ))}
          </div>

          {loading && (
            <div className="text-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-600">Computer is selecting dice...</p>
            </div>
          )}
        </div>
      )}

      {/* Rolling Phase */}
      {gameState === 'rolling' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-8 text-center">Ready to Roll!</h3>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Player's Dice */}
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4 text-green-600 flex items-center justify-center">
                <User className="mr-2" />
                Your Dice
              </h4>
              <DiceDisplay
                dice={gameData.dice[selectedDice.player]}
                isSelected={true}
                showOwner={true}
                owner="player"
                disabled={true}
              />
            </div>

            {/* Computer's Dice */}
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4 text-blue-600 flex items-center justify-center">
                <Bot className="mr-2" />
                Computer's Dice
              </h4>
              <DiceDisplay
                dice={gameData.dice[selectedDice.computer]}
                isSelected={true}
                showOwner={true}
                owner="computer"
                disabled={true}
              />
            </div>
          </div>

          {/* Fair Random Input */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <Hash className="mr-2 text-purple-500" />
                Fair Random Number Generation
              </h4>
              <p className="text-gray-600 mb-4">
                To ensure fair play, enter a number between 0 and 5. This will be combined with
                the computer's cryptographically secure random number to generate the dice rolls.
              </p>

              <div className="flex items-center gap-4">
                <label className="font-medium">Your number (0-5):</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={userNumber}
                  onChange={(e) => setUserNumber(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  disabled={loading}
                />
                <button
                  onClick={rollDice}
                  disabled={loading || !userNumber || isRolling}
                  className="px-8 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isRolling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Rolling...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2" size={16} />
                      Roll Dice!
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Rolling Animation */}
          {isRolling && (
            <div className="text-center">
              <div className="flex justify-center gap-8 mb-4">
                <DiceFace value={Math.floor(Math.random() * 6) + 1} size="xl" animate={true} />
                <div className="text-4xl font-bold text-gray-400 flex items-center">VS</div>
                <DiceFace value={Math.floor(Math.random() * 6) + 1} size="xl" animate={true} />
              </div>
              <p className="text-lg text-gray-600">Rolling dice...</p>
            </div>
          )}
        </div>
      )}

      {/* Result Phase */}
      {gameState === 'result' && roundResult && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-8 text-center">Round Results</h3>

          {/* Roll Results */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Player Result */}
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4 text-green-600 flex items-center justify-center">
                <User className="mr-2" />
                Your Roll
              </h4>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <DiceFace value={roundResult.playerRoll} size="xl" />
                <div className="text-3xl font-bold text-green-600 mt-4">
                  {roundResult.playerRoll}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {roundResult.playerDice.name}
                </div>
              </div>
            </div>

            {/* Computer Result */}
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4 text-blue-600 flex items-center justify-center">
                <Bot className="mr-2" />
                Computer's Roll
              </h4>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <DiceFace value={roundResult.computerRoll} size="xl" />
                <div className="text-3xl font-bold text-blue-600 mt-4">
                  {roundResult.computerRoll}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {roundResult.computerDice.name}
                </div>
              </div>
            </div>
          </div>

          {/* Winner Announcement */}
          <div className="text-center mb-8">
            {roundResult.winner === 'player' && (
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6">
                <Trophy className="mx-auto text-green-600 mb-4" size={48} />
                <h3 className="text-3xl font-bold text-green-600 mb-2">You Win!</h3>
                <p className="text-green-700">
                  {roundResult.playerRoll} beats {roundResult.computerRoll}
                </p>
              </div>
            )}

            {roundResult.winner === 'computer' && (
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-6">
                <Bot className="mx-auto text-blue-600 mb-4" size={48} />
                <h3 className="text-3xl font-bold text-blue-600 mb-2">Computer Wins!</h3>
                <p className="text-blue-700">
                  {roundResult.computerRoll} beats {roundResult.playerRoll}
                </p>
              </div>
            )}

            {roundResult.winner === 'tie' && (
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
                <Target className="mx-auto text-gray-600 mb-4" size={48} />
                <h3 className="text-3xl font-bold text-gray-600 mb-2">It's a Tie!</h3>
                <p className="text-gray-700">
                  Both rolled {roundResult.playerRoll}
                </p>
              </div>
            )}
          </div>

          {/* Verification Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-gray-900">            <h4 className="font-semibold mb-4 flex items-center">
            <Key className="mr-2 text-yellow-500" />
            Verification Details
          </h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h5 className="font-semibold mb-2">Player Roll Generation:</h5>
                <p><strong>Your input:</strong> {roundResult.userNumber}</p>
                <p><strong>Computer's random:</strong> {roundResult.playerComputerNumber}</p>
                <p><strong>HMAC:</strong> <code className="text-xs">{roundResult.playerHmac?.substring(0, 16)}...</code></p>
                <p><strong>Verification Key:</strong> <code className="text-xs">{roundResult.playerKey?.substring(0, 16)}...</code></p>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Computer Roll Generation:</h5>
                <p><strong>Computer's input:</strong> 0 (standard)</p>
                <p><strong>Computer's random:</strong> {roundResult.computerComputerNumber}</p>
                <p><strong>HMAC:</strong> <code className="text-xs">{roundResult.computerHmac?.substring(0, 16)}...</code></p>
                <p><strong>Verification Key:</strong> <code className="text-xs">{roundResult.computerKey?.substring(0, 16)}...</code></p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={nextRound}
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Play Another Round
            </button>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              Start New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRound;