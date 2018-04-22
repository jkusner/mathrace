window.location.hash = '';

$(() => {
    const socket = io();
    window.socket = socket;

    let lobbyList = [];

    let curLobby = null;

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

    socket.on('join response', data => {
        console.log('Join lobby recv', data);

        if (data.success) {
            curLobby = data.lobbyName;
            $.mobile.changePage('#pre-game', {transition: 'slide'});
            $('#lobby-name-container').text('Lobby: ' + curLobby);
            $("#player-count").text('Players: ' + data.playerCount);
        }
    });

    socket.on('lobby update', data => {
        console.log('Lobby update', data);
        $("#player-count").text('Players: ' + data.playerCount);
    });

    function showLoading() {
        $.mobile.loading('show');
    }

    function hideLoading() {
        $.mobile.loading('hide');
    }
});