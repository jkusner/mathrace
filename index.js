const PORT = 3000;
const HOST = 'localhost';

const express = require('express');
const app = express();

const Game = require('./game');

app.use(express.static('public'));

let activeGames = [];

let testGame = new Game('a', 'yeet', 10);
activeGames.push(testGame);
console.log(testGame.questions);

app.post('/createLobby', (req, res) => {
    console.log('Create lobby called');
    res.end('Yo.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});