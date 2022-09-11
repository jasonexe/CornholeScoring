const PLAYER_KEY = "__AllPlayers__";
class CornholePlayer {
    constructor(name) {
        this.games = new Map();
        this.name = name;
    }
    registerGame(gameId) {
        if (!this.games[gameId]) {
            this.games[gameId] = new Array();
        }
    }
    getGameStats(gameId) {
        return new GameStats();
    }
    addFrameToGame(gameId, frame) {
        let gameFrameArray = this.games.get(gameId);
        if (!gameFrameArray) {
            gameFrameArray = new Array();
        }
        gameFrameArray.push(frame);
        this.games.set(gameId, gameFrameArray);
        this.updateStorage;
    }
    // Stores any updates to this CornholePlayer in LocalStorage
    updateStorage() {
        updatePlayerData(this);
    }
    // Constructs the whole class given a base from JSON parsing
    static fromJson(basePlayer) {
        let playerWithFunc = new CornholePlayer(basePlayer.name);
        playerWithFunc.games = basePlayer.games;
        return playerWithFunc;
    }
}
// Sets up any storage if it hasn't been initialized yet
let setupPage = function () {
    initializePlayers();
    updatePlayerSelectionList();
    if (getCurrentGame()) {
        // If there was already a game loaded, go straight to the game page.
        displayGameProgress(getCurrentGame().pastFrames.length);
    }
};
let updatePlayerData = function (player) {
    let allPlayers = localStorage.getObject(PLAYER_KEY);
    allPlayers.set(player.name, player);
    localStorage.setObject(PLAYER_KEY, allPlayers);
};
let getPlayer = function (playerName) {
    let allPlayers = localStorage.getObject(PLAYER_KEY);
    return CornholePlayer.fromJson(allPlayers.get(playerName));
};
let createNewPlayer = function (firstTry) {
    let playerName = prompt(firstTry ?
        "What is the name of the player?"
        : "That name is already taken, try another one");
    if (!playerName) {
        return;
    }
    playerName = playerName.toLocaleLowerCase();
    let player = new CornholePlayer(playerName);
    if (localStorage.getObject(PLAYER_KEY) === null) {
        // will have to create an empty array. Would like to use Set but seems it doesn't work in JS
        let playerSet = new Map();
        playerSet.set(player.name, player);
        localStorage.setObject(PLAYER_KEY, playerSet);
    }
    else {
        let playerSet = localStorage.getObject(PLAYER_KEY);
        console.log(playerSet.get(playerName));
        if (!playerSet.get(playerName)) {
            playerSet.set(playerName, player);
            localStorage.setObject(PLAYER_KEY, playerSet);
        }
        else {
            createNewPlayer(/* firstTry= */ false);
        }
    }
    updatePlayerSelectionList();
};
// TODO(jason) Add a removePlayer function.
// Updates the dropdowns on screen 2, where the user selects which players are in the game.
const updatePlayerSelectionList = function () {
    let allPlayers = localStorage.getObject(PLAYER_KEY);
    var sortedPlayers = new Map([...allPlayers.entries()].sort());
    let playerSelectors = document.getElementsByClassName("player_options");
    for (let selector of Array.from(playerSelectors)) {
        let castSelector = selector;
        castSelector.innerHTML = "";
        for (let playerData of sortedPlayers) {
            let option = new Option(playerData[0], playerData[0]);
            option.textContent = playerData[0];
            castSelector.add(option);
        }
    }
};
// Just initializes 4 players if there aren't any
let initializePlayers = function () {
    if (!localStorage.getObject(PLAYER_KEY)) {
        let player1 = new CornholePlayer("player1");
        let player2 = new CornholePlayer("player2");
        let player3 = new CornholePlayer("player3");
        let player4 = new CornholePlayer("player4");
        let playerSet = new Map();
        playerSet.set(player2.name, player2);
        playerSet.set(player1.name, player1);
        playerSet.set(player3.name, player3);
        playerSet.set(player4.name, player4);
        console.log(playerSet);
        localStorage.setObject(PLAYER_KEY, playerSet);
    }
};
//# sourceMappingURL=player_management.js.map