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
        this.finished = false;
        
        this.genQuestions();
        this.addPlayer(host);
    }

    addPlayer(socket) {
        if (this.started) return false;

        this.players.push(socket);
        this.scores[socket] = 0;

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

        if (this.host == null) {
            this.host = socket;
        }

        this.broadcastUpdate();

        return true;
    }

    removePlayer(socket) {
        let i = this.players.indexOf(socket);
        if (i < 0) return false;
        this.players.splice(i, 1);

        console.log('User left game');
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

        console.log('Starting game', this.name);

        this.started = true;
        this.broadcast('starting', this.questions);
        this.broadcastUpdate();
    }

    isPlayer(socket) {
        return this.players.indexOf(socket) >= 0;
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
        for (let i = 0; i < this.numQs; i++) {
            this.questions.push(Question.generate());
        }
    }

    getState() {
        return { name: this.name, started: this.started, players: this.players.length };
    }

    numPlayers() {
        return this.players.length;
    }
}

module.exports = Game