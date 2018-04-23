window.location.hash = '';

$(() => {
    const socket = io();
    window.socket = socket; // for debug

    let lobbyList = [];
    let curLobby = null;
    let connected = false;
    
    let questions = null;
    let numRemaining = 0;
    let curQuestion = 0;

    let leaderRemaining = 9999;

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

    socket.on('starting', data => {
        console.log('Game starting', data.questions);
        questions = data.questions;
        // TODO: have an excess amount of questions for penalty
        numRemaining = data.numQs;
        leaderRemaining = data.numQs;

        console.log('Received questions', questions);

        $.mobile.changePage('#starting', {transition: 'flip'});

        $("#starting-countdown").text('3');
        setTimeout(() => $("#starting-countdown").text('2'), 1000);
        setTimeout(() => $("#starting-countdown").text('1'), 2000);
        setTimeout(startGameplay, 3000);
    });

    socket.on('leader progress', remaining => {
        console.log('Leader has ' + remaining + ' questions remaining! (I have ' + numRemaining+ ')');
        leaderRemaining = remaining;
        updateLeaderStatus();
    });

    socket.on('join response', data => {
        console.log('Join failed', data);
    });

    function startGameplay() {
        $.mobile.changePage('#gameplay', {transition: 'flow'});
        curQuestion = 0;
        displayQuestion(questions[curQuestion]);
    }

    function displayQuestion(q) {
        $("#question-num").text(`${numRemaining} QUESTIONS LEFT`);
        $("#game-question").text(q.str);
        for (let i = 0; i < 4; i++) {
            $(`#game-choice-${i+1}`)
            .text(q.choices[i])
            .off('click')
            .click(() => onClickedAnswer(i == q.correctIndex))
            .css('outline', i == q.correctIndex ? '1px solid green' : '');
        }
        updateLeaderStatus();
    }

    function updateLeaderStatus() {
        if (numRemaining <= leaderRemaining) {
            $("#game-position").text(`You are in the lead!`);
        } else if (numRemaining > leaderRemaining + 1) {
            $("#game-position").text(`You are ${numRemaining - leaderRemaining} questions behind!`);
        } else {
            $("#game-position").text(`You are almost in the lead!`);                        
        }
    }

    function onClickedAnswer(correct) {
        if (correct) {
            socket.emit('question solved', { index: curQuestion });
            if (numRemaining > 1) {
                numRemaining--;
                curQuestion++;
                displayQuestion(questions[curQuestion]);
            } else {
                alert('Out of questions!');
            }
        } else {
            // TODO: penalty
        }
    }
});