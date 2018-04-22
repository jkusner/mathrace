const PORT = 3000;
const HOST = 'localhost';

const express = require('express');
const app = express();

app.use(express.static('public'));

const MIN_PLAYERS = 0;

function randInt(max) {
    return Math.floor(Math.random() * max);
}

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

const OPERATIONS = ['+', '-', '*'];
class Question {
    constructor(a, b, op, ans) {
        this.a = a;
        this.b = b;
        this.op = op;
        this.ans = ans;
        this.buildString();
    }
    buildString() {
        let qString = '';
        if (this.a instanceof Question) {
            qString += '(' + this.a.str + ')';
        } else {
            qString += this.a;
        }

        qString += ' ' + this.op + ' ';

        if (this.b instanceof Question) {
            qString += '(' + this.b.str + ')';
        } else {
            qString += this.b;
        }
        this.str = qString;
    }
    static generate(diff=1) {
        let a, b;
        
        if (randInt(diff + 1) > 0) {
            a = Question.generate(diff - 1);
        } else {
            a = randInt(20) - 10;
        }

        b = randInt(20) - 10;

        if (Math.random() > .5) {
            let temp = a;
            a = b;
            temp = b;
        }

        let op = OPERATIONS[randInt(OPERATIONS.length)];
        
        let aAns = a.ans || a;
        let bAns = b.ans || b;

        let ans = eval(aAns + ' ' + op + ' ' + bAns);

        return new Question(a, b, op, ans);
    }
}

let testGame = new Game('a', 'yeet', 10);
console.log(testGame.questions);