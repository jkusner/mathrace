const Question = require('./question');

class Game {
    constructor(name, host, numQs) {
        this.name = name;
        this.host = host;
        this.players = [];
        this.scores = {};
        this.numQs = numQs;
        this.questions = [];
        this.started = false;
        
        this.genQuestions();
        this.addPlayer(host);
    }

    addPlayer(socket) {
        this.players.push(socket);
        this.scores[socket] = 0;
    }

    genQuestions() {
        for (let i = 0; i < this.numQs; i++) {
            this.questions.push(Question.generate());
        }
    }

    getState() {
        return { name: this.name, open: !this.started };
    }

    numPlayers() {
        return this.players.length;
    }
}

module.exports = Game