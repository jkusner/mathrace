const PORT = 3000;
const HOST = 'localhost';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Game = require('./game');

app.use(express.static('public'));

let games = {};

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function broadcastLobbies() {
    let openGames = [];
    for (let name in games) {
        let game = games[name];
        if (game != null && !game.started && !game.finished) {
            openGames.push(game.getState());
        }
    }
    io.emit('lobbies', openGames);
}

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);

    socket.on('create lobby', lobbyInfo => {
        const reply = (success, message) => socket.emit('create lobby response', {success, message});

        if (!lobbyInfo || !lobbyInfo.name || !lobbyInfo.numQs) {
            return reply(false, 'Missing information');
        }

        let name = lobbyInfo.name;
        let numQs = Number(lobbyInfo.numQs);
        
        name = name.replace(/[^A-Za-z0-9_\- ]/g, '');
        name = name.substring(0, 15);
        name = name.trim();

        if (!name) {
            return reply(false, 'Invalid name');
        }

        if (isNaN(numQs) || numQs < 0) {
            return reply(false, 'Invalid number of questions');
        }

        if (games[name]) {
            return reply(false, 'Name already in use');
        }

        let g = new Game(name, socket, numQs);
        g.onGameOver(() => {
            console.log('Removing ' + name + ' from active games list.');
            games[name] = null;
        });
        games[name] = g;

        console.log('A new lobby has been created', lobbyInfo);

        broadcastLobbies();
        return reply(true, 'Lobby created');
    });

    socket.on('join request', lobbyName => {
        const reply = (success, message) => socket.emit('join response', {success, message});

        console.log(`Incoming join request from ${socket.id}, lobby: ${lobbyName}`);

        let game = games[lobbyName];
        if (!game) {
            return reply(false, "Game not found");
        }
        if (game.started) {
            return reply(false, "Game already started");
        }

        if (game.isPlayer(socket)) {
            game.removePlayer(socket);
        }
        game.addPlayer(socket);
    });

    broadcastLobbies();
    socket.emit('initial connect');
});

setInterval(broadcastLobbies, 5000);