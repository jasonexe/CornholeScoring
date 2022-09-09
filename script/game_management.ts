let selectTeams = function() {
    // Read the DOM and do stuff to create a CornholeGame instance.
    let startGameScreen = document.getElementById("start_game");
    let addPlayerScreen = document.getElementById("add_players");

    startGameScreen.style.display = "none";
    addPlayerScreen.style.display = "block";
}

let startGame = function() {
    // Read the DOM and do stuff to create a CornholeGame instance.
    let addPlayerScreen = document.getElementById("add_players");
    let gameProgressScreen = document.getElementById("game_screen");

    addPlayerScreen.style.display = "none";
    gameProgressScreen.style.display = "block";
}

let endGame = function() {
    let startGameScreen = document.getElementById("start_game");
    let gameProgressScreen = document.getElementById("game_screen");

    gameProgressScreen.style.display = "none";
    startGameScreen.style.display = "block";
}