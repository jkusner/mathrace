const PORT = 3000;
const HOST = 'localhost';

const express = require('express');
const app = express();

const Question = require('./question');

app.use(express.static('public'));

const MIN_PLAYERS = 0;

class Game {
    constructor(lobbyId, host, numQs) {
        this.lobbyId = lobbyId;
        this.host = host;
        this.players = [];
        this.scores = {};
        this.numQs = numQs;
        this.questions = [];
        
        this.genQuestions();
        this.addPlayer(host);
    }

    addPlayer(id) {
        this.players.push(id);
        this.scores[id] = 0;
    }

    genQuestions() {
        for (let i = 0; i < this.numQs; i++) {
            this.questions.push(Question.generate());
        }
    }
}


let testGame = new Game('a', 'yeet', 10);
console.log(testGame.questions);