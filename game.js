const Question = require('./question');

// TODO add event handler for onGameOver(), remove game from active games list
class Game {
    constructor(name, host, numQs) {
        this.name = name;
        this.host = host;
        this.players = [];
        this.remainingQuestions = {};
        // Due to penalties, numQs != this.questions.length!
        this.numQs = numQs;
        this.questions = [];
        this.clientQuestions = [];
        this.started = false;
        this.finished = false;

        this.leader = null;
        
        this.genQuestions();
        this.addPlayer(host);
    }

    addPlayer(socket) {
        if (this.started) return false;

        this.players.push(socket);

        socket.on('disconnect', () => {
            this.removePlayer(socket);
        });

        socket.emit('lobby joined', {
            success: true,
            message: 'Lobby joined successfully',
            lobbyName: this.name,
            playerCount: this.players.length,
            host: this.host == socket
        });

        socket.on('start request', () => {
            if (socket != this.host) return;
            this.startGame();
        });

        socket.on('question solved', data => {
            if (this.started && !this.finished && this.isPlayer(socket)) {
                this.onQuestionCorrect(socket, data.index);
            }
        });

        socket.on('question wrong', data => {
            if (this.started && !this.finished && this.isPlayer(socket)) {
                this.onQuestionIncorrect(socket, data.index);
            }
        });

        if (this.host == null) {
            this.host = socket;
        }

        console.log(`User ${socket.id} joined game ${this.name}`);

        this.broadcastUpdate();

        return true;
    }

    removePlayer(socket) {
        let i = this.players.indexOf(socket);
        if (i < 0) return false;
        this.players.splice(i, 1);

        console.log(`User ${socket.id} left game ${this.name}`);
        socket.emit('kick');

        if (this.host == socket) {
            this.host = this.players[0];
        }

        if (!this.host) {
            // TODO: This lobby is empty, kill it
        }

        this.broadcastUpdate();

        return true;
    }

    startGame() {
        if (this.started) return false;

        console.log(`Starting game ${this.name} with ${this.players.length} players`);

        for (let socket of this.players) {
            this.remainingQuestions[socket.id] = this.numQs;
        }

        this.started = true;
        this.broadcast('starting', {questions: this.clientQuestions, numQs: this.numQs });
        this.broadcastUpdate();
    }

    isPlayer(socket) {
        return this.players.indexOf(socket) >= 0;
    }

    onQuestionCorrect(socket, index) {
        this.remainingQuestions[socket.id]--;
        
        if (!this.leader || this.remainingQuestions[socket.id] <= this.remainingQuestions[this.leader.id]) {
            this.leader = socket;
            this.broadcast('leader progress', this.remainingQuestions[this.leader.id]);
        }
    }

    onQuestionIncorrect(socket, index) { // TODO send new list of questions if they run out
        this.remainingQuestions[socket.id]++;

        if (this.leader == socket) {
            let min = this.remainingQuestions[socket.id];
            let newLeader = this.leader;
    
            for (let player of this.players) {
                if (this.remainingQuestions[player.id] < min) {
                    min = this.remainingQuestions[player.id];
                    newLeader = player;
                }
            }
    
            this.leader = newLeader;

            this.broadcast('leader progress', this.remainingQuestions[this.leader.id]);
        }
    }

    broadcast(msg, data) {
        for (let sock of this.players) {
            sock.emit(msg, data);
        }
    }

    broadcastUpdate() {
        let state = this.getState();
        for (let sock of this.players) {
            state.host = sock == this.host;
            sock.emit('lobby update', state);
        }
    }

    genQuestions() {
        for (let i = 0; i < this.numQs * 10; i++) {
            this.questions.push(Question.generate());
        }
        this.clientQuestions = this.questions.map(q => q.getData());
    }

    getState() {
        return { name: this.name, started: this.started, players: this.players.length };
    }

    numPlayers() {
        return this.players.length;
    }
}

module.exports = Game