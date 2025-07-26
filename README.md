# Domino Dice

A strategic dice game application built with React and Node.js. Players compete against the computer using customizable dice configurations.

## Project Overview

This dice game features:
- Multi-dice gameplay with customizable configurations
- Secure random number generation
- Probability-based game logic
- Player vs Computer competition
- Game statistics tracking
- Responsive UI with interactive dice visualization

## Project Structure

```
dice-game/
├── frontend/         
│   ├── public/       
│   └── src/         
│       ├── components/
│       ├── service/   
│       └── App.js   
├── backend/          
│   ├── server.js     
│   └── package.json  
└── README.md        
```

## Tech Stack

### Frontend
- React.js
- CSS Modules
- Responsive UI Components
- Dice visualization with interactive elements

### Backend
- Node.js with Express
- MySQL Database
- Secure random number generation
- Probability calculations
- Game state management

## Key Features

1. **Customizable Dice**
   - Multiple dice with different configurations
   - Interactive dice display
   - Visual feedback for dice selection

2. **Fair Gameplay**
   - Secure random number generation
   - HMAC-based verification
   - Probability-based game logic

3. **Game Statistics**
   - Player vs Computer win tracking
   - Round history
   - Game statistics stored in MySQL

4. **User Experience**
   - Responsive design
   - Smooth animations
   - Clear visual feedback
   - Intuitive dice selection

## Screenshots

### Game Interface
![Game Interface](screenshots/Screenshot%20%28280%29.png)

### Dice Selection
![Dice Selection](screenshots/Screenshot%20%28281%29.png)

### Game Play
![Game Play](screenshots/Screenshot%20%28282%29.png)

### Statistics View
![Statistics View](screenshots/Screenshot%20%28284%29.png)

### Game Play 2
![Game Play 2](screenshots/Screenshot%20%28286%29.png)

### Results Screen
![Results Screen](screenshots/Screenshot%20%28287%29.png)


### 

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL Server

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Configure your MySQL database:
   - Update database credentials in `backend/server.js`
   - Ensure MySQL server is running

5. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```
6. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

The ui will be available at `http://localhost:5174`
The backend will be running at `http://localhost:3001`

## Environment Variables

Create a `.env` file in the backend directory with:
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dice_game
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
