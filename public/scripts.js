window.location.hash = '';

$(() => {
    const socket = io();
    window.socket = socket; // for debug

    let lobbyList = [];
    let curLobby = null;
    let questions = null;
    let connected = false;

    $('#create-lobby').submit(function () {
        let name = $("#lobby-name").val();
        let numQs = $("#num-questions").val();
        if (!name || !numQs) {
            return false;
        }

        socket.emit('create lobby', {name, numQs});

        $('#create-lobby').prop('disabled', true);

        return false;
    });

    $("#lobby-start").click(() => {
        socket.emit('start request');
    });

    socket.on('initial connect', () => {
        if (connected) {
            alert('Oh no! Connection reset!');
            location.reload();
        }
        connected = true;
    });

    socket.on('create lobby response', data => {
        if (!data.success) {
            alert(data.message);
        }
        $('#create-lobby').prop('disabled', false);
    });

    socket.on('lobbies', lobbies => {
        console.log('Lobbies updated: ', lobbies);

        lobbyList = lobbies;

        $("#lobby-list").empty();
        for (let lobby of lobbies) {
            let $lobby = $("<li></li>");
            $("<a></a>").prop('href', "#").text(lobby.name).appendTo($lobby);
            $lobby.click(() => {
                console.log('Attempting to join lobby');
                socket.emit('join request', lobby.name);
            });
            $("#lobby-list").append($lobby);
        }

        $("#lobby-list").listview('refresh');
    });

    socket.on('lobby joined', data => {
        console.log('Joined lobby', data);

        if (data.success) {
            curLobby = data.lobbyName;
            $.mobile.changePage('#pre-game', {transition: 'slide'});
            $('#lobby-name-container').text('Lobby: ' + curLobby);
            $("#player-count").text('Players: ' + data.playerCount);
        }
    });

    socket.on('lobby update', data => {
        console.log('Lobby update', data);
        $("#player-count").text('Players: ' + data.players);
        
        if (data.host) {
            $("#host-controls").show();
            $("#not-host").hide();
        } else {
            $("#host-controls").hide();
            $("#not-host").show();
        }
    });

    socket.on('starting', qs => {
        console.log('Game starting', qs);
        questions = qs;

        $.mobile.changePage('#starting', {transition: 'flip'});

        $("#starting-countdown").text('3');
        setTimeout(() => $("#starting-countdown").text('2'), 1000);
        setTimeout(() => $("#starting-countdown").text('1'), 2000);
        setTimeout(startGameplay, 3000);
    });

    function startGameplay() {
        $.mobile.changePage('#gameplay', {transition: 'flow'});
        displayQuestion(questions[0]);
    }

    function displayQuestion(q) {
        $("#game-question").text(q.str);
        $("#game-choice-1").text(q.ans);
    }
});