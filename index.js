const PORT = 3000;
const HOST = 'localhost';

const express = require('express');
const app = express();

const Game = require('./game');

app.use(express.static('public'));

const MIN_PLAYERS = 0;

let testGame = new Game('a', 'yeet', 10);
console.log(testGame.questions);