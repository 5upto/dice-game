class ApiService {
  static BASE_URL = 'http://localhost:3001/api';
  
  static async initGame(diceConfig) {
    try {
      const response = await fetch(`${this.BASE_URL}/game/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diceConfig })
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to connect to server. Please ensure backend is running.');
    }
  }
  
  static async determineFirstPlayer(gameId) {
    try {
      const response = await fetch(`${this.BASE_URL}/game/${gameId}/first-player`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to determine first player');
    }
  }
  
  static async completeFirstPlayer(gameId, data) {
    try {
      const response = await fetch(`${this.BASE_URL}/game/${gameId}/first-player/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to complete first player determination');
    }
  }
  
  static async playRound(gameId, data) {
    try {
      const response = await fetch(`${this.BASE_URL}/game/${gameId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to play round');
    }
  }
  
  static async getComputerMove(gameId, availableDice) {
    try {
      const response = await fetch(`${this.BASE_URL}/game/${gameId}/computer-move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableDice })
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to get computer move');
    }
  }
  
  static async getGameStats(gameId) {
    try {
      const response = await fetch(`${this.BASE_URL}/game/${gameId}/stats`);
      return await response.json();
    } catch (error) {
      throw new Error('Failed to get game stats');
    }
  }
}

export default ApiService;