import React, { useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import GameSetup from './components/gameSetup';
import FirstPlayerDetermination from './components/firstPlayerDetermination';
import GameRound from './components/gameRound';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('setup');
  const [gameData, setGameData] = useState(null);
  const [firstPlayer, setFirstPlayer] = useState(null);

  const handleGameStart = (data) => {
    setGameData(data);
    setGameState('firstPlayer');
  };

  const handleFirstPlayerDetermined = (player) => {
    setFirstPlayer(player);
    setGameState('playing');
  };

  const handleGameEnd = () => {
    setGameState('setup');
    setGameData(null);
    setFirstPlayer(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
       <div className="container">
      {gameState === 'setup' && (
        <GameSetup onGameStart={handleGameStart} />
      )}
      
      {gameState === 'firstPlayer' && gameData && (
        <FirstPlayerDetermination 
          gameId={gameData.gameId}
          onFirstPlayerDetermined={handleFirstPlayerDetermined} 
        />
      )}
      
      {gameState === 'playing' && gameData && firstPlayer && (
        <GameRound 
          gameData={gameData}
          firstPlayer={firstPlayer}
          onGameEnd={handleGameEnd}
        />
      )}
    </div>
    </div>
  );
}

export default App;