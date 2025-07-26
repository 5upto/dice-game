// server.js - Express.js Backend
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const crypto = require('crypto');
const { createHmac } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'dice_game'
};

// Initialize Database
async function initDB() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Create games table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dice_config JSON,
        player_wins INT DEFAULT 0,
        computer_wins INT DEFAULT 0,
        total_rounds INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create rounds table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rounds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT,
        round_number INT,
        player_dice JSON,
        computer_dice JSON,
        player_roll INT,
        computer_roll INT,
        winner VARCHAR(20),
        hmac_key VARCHAR(512),
        computer_number INT,
        player_number INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id)
      )
    `);
    
    await connection.end();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Classes for game logic

// Dice Configuration Parser
class DiceConfigParser {
  static parse(diceStrings) {
    if (!Array.isArray(diceStrings) || diceStrings.length < 3) {
      throw new Error('At least 3 dice configurations required');
    }
    
    const dice = [];
    for (let i = 0; i < diceStrings.length; i++) {
      const faces = diceStrings[i].split(',').map(face => {
        const num = parseInt(face.trim());
        if (isNaN(num)) {
          throw new Error(`Invalid number '${face}' in dice ${i + 1}`);
        }
        return num;
      });
      
      if (faces.length !== 6) {
        throw new Error(`Dice ${i + 1} must have exactly 6 faces`);
      }
      
      dice.push(new Dice(faces, `Dice ${i + 1}`));
    }
    
    return dice;
  }
}

// Dice Class
class Dice {
  constructor(faces, name) {
    this.faces = faces;
    this.name = name;
  }
  
  roll(randomValue) {
    return this.faces[randomValue % this.faces.length];
  }
  
  toJSON() {
    return {
      name: this.name,
      faces: this.faces
    };
  }
}

// Fair Random Generator
class FairRandomGenerator {
  static generateSecureKey() {
    return crypto.randomBytes(32).toString('hex'); // 256 bits
  }
  
  static generateSecureNumber(min, max) {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    let randomNumber;
    
    do {
      const randomBytes = crypto.randomBytes(bytesNeeded);
      randomNumber = randomBytes.readUIntBE(0, bytesNeeded);
    } while (randomNumber >= Math.floor(256 ** bytesNeeded / range) * range);
    
    return min + (randomNumber % range);
  }
  
  static calculateHMAC(message, key) {
    return createHmac('sha256', key).update(message.toString()).digest('hex');
  }
  
  static generateFairRoll(userNumber, computerNumber, diceSize) {
    return (userNumber + computerNumber) % diceSize;
  }
}

// Probability Calculator
class ProbabilityCalculator {
  static calculateWinProbabilities(dice) {
    const results = {};
    
    for (let i = 0; i < dice.length; i++) {
      results[dice[i].name] = {};
      
      for (let j = 0; j < dice.length; j++) {
        if (i === j) continue;
        
        let wins = 0;
        let total = 0;
        
        for (let face1 of dice[i].faces) {
          for (let face2 of dice[j].faces) {
            total++;
            if (face1 > face2) wins++;
          }
        }
        
        results[dice[i].name][dice[j].name] = {
          wins,
          total,
          probability: (wins / total * 100).toFixed(2)
        };
      }
    }
    
    return results;
  }
}

// Table Generator
class TableGenerator {
  static generateProbabilityTable(dice, probabilities) {
    const table = {
      headers: ['Dice vs Dice'].concat(dice.map(d => d.name)),
      rows: []
    };
    
    for (let i = 0; i < dice.length; i++) {
      const row = [dice[i].name];
      
      for (let j = 0; j < dice.length; j++) {
        if (i === j) {
          row.push('50.00%');
        } else {
          const prob = probabilities[dice[i].name][dice[j].name];
          row.push(`${prob.probability}%`);
        }
      }
      
      table.rows.push(row);
    }
    
    return table;
  }
}

// Game Logic
class GameLogic {
  constructor(diceConfig) {
    this.dice = diceConfig;
    this.probabilities = ProbabilityCalculator.calculateWinProbabilities(this.dice);
  }
  
  getProbabilityTable() {
    return TableGenerator.generateProbabilityTable(this.dice, this.probabilities);
  }
  
  async determineFirstPlayer() {
    const key = FairRandomGenerator.generateSecureKey();
    const computerNumber = FairRandomGenerator.generateSecureNumber(0, 1);
    const hmac = FairRandomGenerator.calculateHMAC(computerNumber, key);
    
    return {
      hmac,
      key,
      computerNumber
    };
  }
  
  async playRound(playerDiceIndex, computerDiceIndex, userNumber, gameData) {
    const playerDice = this.dice[playerDiceIndex];
    const computerDice = this.dice[computerDiceIndex];
    
    // Generate fair random for player roll
    const playerKey = FairRandomGenerator.generateSecureKey();
    const playerComputerNumber = FairRandomGenerator.generateSecureNumber(0, 5);
    const playerHmac = FairRandomGenerator.calculateHMAC(playerComputerNumber, playerKey);
    
    // Generate fair random for computer roll
    const computerKey = FairRandomGenerator.generateSecureKey();
    const computerComputerNumber = FairRandomGenerator.generateSecureNumber(0, 5);
    const computerHmac = FairRandomGenerator.calculateHMAC(computerComputerNumber, computerKey);
    
    // Calculate rolls
    const playerRollIndex = FairRandomGenerator.generateFairRoll(userNumber, playerComputerNumber, 6);
    const computerRollIndex = FairRandomGenerator.generateFairRoll(0, computerComputerNumber, 6); // Computer always inputs 0
    
    const playerRoll = playerDice.roll(playerRollIndex);
    const computerRoll = computerDice.roll(computerRollIndex);
    
    const winner = playerRoll > computerRoll ? 'player' : 
                   computerRoll > playerRoll ? 'computer' : 'tie';
    
    return {
      playerDice: playerDice.toJSON(),
      computerDice: computerDice.toJSON(),
      playerRoll,
      computerRoll,
      winner,
      playerKey,
      computerKey,
      playerComputerNumber,
      computerComputerNumber,
      playerHmac,
      computerHmac,
      userNumber
    };
  }
}

// API Routes

// Initialize new game
app.post('/api/game/init', async (req, res) => {
  try {
    const { diceConfig } = req.body;
    const dice = DiceConfigParser.parse(diceConfig);
    const gameLogic = new GameLogic(dice);
    
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO games (dice_config) VALUES (?)',
      [JSON.stringify(dice.map(d => d.toJSON()))]
    );
    await connection.end();
    
    const probabilities = gameLogic.getProbabilityTable();
    
    res.json({
      gameId: result.insertId,
      dice: dice.map(d => d.toJSON()),
      probabilities,
      message: 'Game initialized successfully'
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      example: 'Try: ["2,2,4,4,9,9", "6,8,1,1,8,6", "7,5,3,7,5,3"]'
    });
  }
});

// Determine first player
app.post('/api/game/:gameId/first-player', async (req, res) => {
  try {
    const gameLogic = new GameLogic([]); // We don't need dice for this
    const firstPlayerData = await gameLogic.determineFirstPlayer();
    
    res.json(firstPlayerData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete first player determination
app.post('/api/game/:gameId/first-player/complete', async (req, res) => {
  try {
    const { userNumber, hmac, key, computerNumber } = req.body;
    
    // Verify HMAC
    const calculatedHmac = FairRandomGenerator.calculateHMAC(computerNumber, key);
    if (calculatedHmac !== hmac) {
      return res.status(400).json({ error: 'HMAC verification failed' });
    }
    
    const result = FairRandomGenerator.generateFairRoll(userNumber, computerNumber, 2);
    const firstPlayer = result === 0 ? 'player' : 'computer';
    
    res.json({
      firstPlayer,
      userNumber,
      computerNumber,
      result,
      verified: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Play round
app.post('/api/game/:gameId/play', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerDiceIndex, computerDiceIndex, userNumber } = req.body;
    
    // Get game data
    const connection = await mysql.createConnection(dbConfig);
    const [games] = await connection.execute(
      'SELECT * FROM games WHERE id = ?',
      [gameId]
    );
    
    if (games.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = games[0];
    const dice = DiceConfigParser.parse(game.dice_config.map(d => d.faces.join(',')));
    const gameLogic = new GameLogic(dice);
    
    const roundResult = await gameLogic.playRound(playerDiceIndex, computerDiceIndex, userNumber, game);
    
    // Save round to database
    const roundNumber = game.total_rounds + 1;
    await connection.execute(
      `INSERT INTO rounds (game_id, round_number, player_dice, computer_dice, 
       player_roll, computer_roll, winner, hmac_key, computer_number, player_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [gameId, roundNumber, JSON.stringify(roundResult.playerDice), 
       JSON.stringify(roundResult.computerDice), roundResult.playerRoll, 
       roundResult.computerRoll, roundResult.winner, roundResult.playerKey, 
       roundResult.playerComputerNumber, userNumber]
    );
    
    // Update game stats
    const playerWins = game.player_wins + (roundResult.winner === 'player' ? 1 : 0);
    const computerWins = game.computer_wins + (roundResult.winner === 'computer' ? 1 : 0);
    
    await connection.execute(
      'UPDATE games SET player_wins = ?, computer_wins = ?, total_rounds = ? WHERE id = ?',
      [playerWins, computerWins, roundNumber, gameId]
    );
    
    await connection.end();
    
    res.json({
      ...roundResult,
      roundNumber,
      gameStats: {
        playerWins,
        computerWins,
        totalRounds: roundNumber
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get computer dice selection
app.post('/api/game/:gameId/computer-move', async (req, res) => {
  try {
    const { availableDice } = req.body;
    const computerChoice = FairRandomGenerator.generateSecureNumber(0, availableDice.length - 1);
    
    res.json({
      computerDiceIndex: computerChoice,
      computerDiceName: availableDice[computerChoice].name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game stats
app.get('/api/game/:gameId/stats', async (req, res) => {
  try {
    const { gameId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [games] = await connection.execute(
      'SELECT * FROM games WHERE id = ?',
      [gameId]
    );
    
    const [rounds] = await connection.execute(
      'SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number DESC LIMIT 10',
      [gameId]
    );
    
    await connection.end();
    
    if (games.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({
      game: games[0],
      recentRounds: rounds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;