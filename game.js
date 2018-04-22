const Question = require('./question');

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

module.exports = Game