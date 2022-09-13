const CURRENT_GAME = "__CURRENT_GAME__";
const HISTORICAL_GAMES = "__HISTORICAL_GAMES__";
class CornholeGame {
    constructor(gameId, numberOfBags, leftTeam, rightTeam) {
        this.pastFrames = new Array();
        this.currentScore = new Score();
        if (gameId === 0) {
            this.id = Date.now();
        }
        else {
            this.id = gameId;
        }
        this.leftTeam = leftTeam;
        for (let player of leftTeam) {
            player.registerGame(this.id);
        }
        this.rightTeam = rightTeam;
        for (let player of rightTeam) {
            player.registerGame(this.id);
        }
        this.numberOfBags = numberOfBags;
        this.currentFrame = new CornholeFrame(0, numberOfBags);
    }
    // Constructs the whole class given a base from JSON parsing
    static fromJson(baseGame) {
        let leftPlayers = new Array();
        for (let leftPlayer of baseGame.leftTeam) {
            leftPlayers.push(CornholePlayer.fromJson(leftPlayer));
        }
        let rightPlayers = new Array();
        for (let rightPlayer of baseGame.rightTeam) {
            rightPlayers.push(CornholePlayer.fromJson(rightPlayer));
        }
        let gameWithFunctions = new CornholeGame(baseGame.id, baseGame.numberOfBags, leftPlayers, rightPlayers);
        gameWithFunctions.id = baseGame.id;
        let pastFrames = new Array();
        for (let pastFrame of baseGame.pastFrames) {
            pastFrames.push(CornholeFrame.fromJson(pastFrame));
        }
        gameWithFunctions.pastFrames = pastFrames;
        gameWithFunctions.currentFrame = CornholeFrame.fromJson(baseGame.currentFrame);
        gameWithFunctions.currentScore = Score.fromJson(baseGame.currentScore);
        return gameWithFunctions;
    }
    // Call at the end of the frame - updates the score, pushes the frame to players, updates game in storage.
    submitFrame() {
        this.pastFrames.push(this.currentFrame);
        this.currentScore.appendScore(this.currentFrame.getFrameScore());
        let playerTurn = (this.pastFrames.length - 1) % 2;
        this.leftTeam[playerTurn].addFrameToGame(this.id, new IndividualFrame(this.currentFrame, TeamSide.LEFT));
        this.rightTeam[playerTurn].addFrameToGame(this.id, new IndividualFrame(this.currentFrame, TeamSide.RIGHT));
        this.currentFrame = new CornholeFrame(this.pastFrames.length, this.numberOfBags);
        updateCurrentThrower();
        storeCurrentGame(this);
        updateScoreDisplay();
        if (this.currentScore.leftCalculatedScore >= 21) {
            // Left team won!
            endGame();
            alert("The left team won! Nice Job!");
        }
        if (this.currentScore.rightCalculatedScore >= 21) {
            // Right team won!
            endGame();
            alert("The right team won! Nice Job!");
        }
    }
    getCurrentScore() {
        return new Score().appendScore(this.currentScore).appendScore(this.currentFrame.getFrameScore());
    }
    addThrow(bagStatus, teamSide) {
        this.currentFrame.addBagResult(teamSide, bagStatus);
        storeCurrentGame(this);
        updateScoreDisplay();
    }
    subtractThrow(bagStatus, teamSide) {
        this.currentFrame.removeBagResult(teamSide, bagStatus);
        storeCurrentGame(this);
        updateScoreDisplay();
    }
}
// Hole + board management
let addThrow = function (bagStatus, teamSide) {
    let currentGame = getCurrentGame();
    currentGame.addThrow(bagStatus, teamSide);
};
let subtractThrow = function (bagStatus, teamSide) {
    let currentGame = getCurrentGame();
    currentGame.subtractThrow(bagStatus, teamSide);
};
let submitFrame = function () {
    getCurrentGame().submitFrame();
};
// Updates score for the frame, player, and overall score.
let updateScoreDisplay = function () {
    let game = getCurrentGame();
    let frameScore = game.currentFrame.getFrameScore();
    let currentFrame = game.currentFrame;
    let gameScore = game.getCurrentScore();
    // Updates the score each player has gotten
    let leftPlayerRawScoreElement = document.getElementById("left_score");
    let rightPlayerRawScoreElement = document.getElementById("right_score");
    leftPlayerRawScoreElement.innerText = frameScore.leftRawScore.toString();
    rightPlayerRawScoreElement.innerText = frameScore.rightRawScore.toString();
    // Updates the number of each bag type
    updatePlayerBagStatusDisplay(currentFrame);
    updateFrameAndCurrentScoreDisplay(frameScore, gameScore);
    updatePastFrames(game);
};
let selectTeams = function () {
    // Read the DOM and do stuff to create a CornholeGame instance.
    let startGameScreen = document.getElementById("start_game");
    let addPlayerScreen = document.getElementById("add_players");
    startGameScreen.style.display = "none";
    addPlayerScreen.style.display = "block";
};
// Updates UI to the "game" screen and initializes the CornholeGame, storing it in LocalStorage
let startGame = function () {
    // Read the DOM and do stuff to create a CornholeGame instance.
    let teamOnePlayerOneName = document.getElementById("team_one_player_one")
        .selectedOptions[0]
        .value;
    let teamOnePlayerTwoName = document.getElementById("team_one_player_two")
        .selectedOptions[0]
        .value;
    let teamTwoPlayerOneName = document.getElementById("team_two_player_one")
        .selectedOptions[0]
        .value;
    let teamTwoPlayerTwoName = document.getElementById("team_two_player_two")
        .selectedOptions[0]
        .value;
    // Got the names, put them in the selectors.
    let newGame = new CornholeGame(0, 4, [
        getPlayer(teamOnePlayerOneName),
        getPlayer(teamOnePlayerTwoName),
    ], [
        getPlayer(teamTwoPlayerOneName),
        getPlayer(teamTwoPlayerTwoName),
    ]);
    storeCurrentGame(newGame);
    displayGameProgress(0);
};
let endGame = function () {
    // Store the game in the history, clear the current game from storage.
    storePastGame(getCurrentGame());
    clearCurrentGame();
    let startGameScreen = document.getElementById("start_game");
    let gameProgressScreen = document.getElementById("game_screen");
    gameProgressScreen.style.display = "none";
    startGameScreen.style.display = "block";
};
let storeCurrentGame = function (currentGame) {
    localStorage.setObject(CURRENT_GAME, currentGame);
};
let clearCurrentGame = function () {
    localStorage.removeItem(CURRENT_GAME);
};
let getCurrentGame = function () {
    if (!localStorage.getObject(CURRENT_GAME)) {
        return null;
    }
    return CornholeGame.fromJson(localStorage.getObject(CURRENT_GAME));
};
let getPastGames = function () {
    let pastGames = localStorage.getObject(HISTORICAL_GAMES);
    if (pastGames) {
        return new Map(pastGames);
    }
    return null;
};
let getPastGame = function (gameId) {
    let pastGames = localStorage.getObject(HISTORICAL_GAMES);
    if (pastGames.has(gameId)) {
        return CornholeGame.fromJson(pastGames.get(gameId));
    }
    return null;
};
let storePastGame = function (finishedGame) {
    let pastGames = getPastGames();
    if (!pastGames) {
        // If there's no games already stored, then create a new array.
        localStorage.setObject(HISTORICAL_GAMES, new Map().set(finishedGame.id, finishedGame));
        return;
    }
    pastGames.set(finishedGame.id, finishedGame);
    localStorage.setObject(HISTORICAL_GAMES, pastGames);
};
//# sourceMappingURL=game_management.js.map