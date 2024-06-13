var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const CURRENT_GAME = "__CURRENT_GAME__";
const HISTORICAL_GAMES = "__HISTORICAL_GAMES__";
class CornholeGame {
    constructor(gameId, numberOfBags, leftTeam, rightTeam, registerGame) {
        this.pastFrames = new Array();
        this.currentScore = new Score();
        if (gameId === 0) {
            this.id = Date.now();
        }
        else {
            this.id = gameId;
        }
        this.leftTeam = leftTeam;
        this.rightTeam = rightTeam;
        if (registerGame) {
            for (let player of leftTeam) {
                player.registerGame(this.id);
            }
            for (let player of rightTeam) {
                player.registerGame(this.id);
            }
        }
        this.numberOfBags = numberOfBags;
        this.currentFrame = new CornholeFrame(0, numberOfBags);
    }
    // Sometimes the player does not have all of their frames. This will replace an existing player with matching name
    updatePlayer(player) {
        let updatedLeftArray = new Array();
        for (let checkPlayer of this.leftTeam) {
            if (checkPlayer.name === player.name) {
                updatedLeftArray.push(player);
            }
            else {
                updatedLeftArray.push(checkPlayer);
            }
        }
        this.leftTeam = updatedLeftArray;
        let updatedRightArray = new Array();
        for (let checkPlayer of this.rightTeam) {
            if (checkPlayer.name === player.name) {
                updatedRightArray.push(player);
            }
            else {
                updatedRightArray.push(checkPlayer);
            }
        }
        this.rightTeam = updatedRightArray;
    }
    static fromJsonSynchronous(baseGame) {
        let leftPlayers = new Array();
        for (let leftPlayer of baseGame.leftTeam) {
            leftPlayers.push(CornholePlayer.fromJsonSynchronous(leftPlayer));
        }
        let rightPlayers = new Array();
        for (let rightPlayer of baseGame.rightTeam) {
            rightPlayers.push(CornholePlayer.fromJsonSynchronous(rightPlayer));
        }
        let gameWithFunctions = new CornholeGame(baseGame.id, baseGame.numberOfBags, leftPlayers, rightPlayers, /* registerGame= */ true);
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
    // Constructs the whole class given a base from JSON parsing
    static fromJson(baseGame, pulledFromLocalStorage) {
        return __awaiter(this, void 0, void 0, function* () {
            let leftPlayers = new Array();
            for (let leftPlayer of baseGame.leftTeam) {
                leftPlayers.push(yield CornholePlayer.fromJson(leftPlayer));
            }
            let rightPlayers = new Array();
            for (let rightPlayer of baseGame.rightTeam) {
                rightPlayers.push(yield CornholePlayer.fromJson(rightPlayer));
            }
            let gameWithFunctions = new CornholeGame(baseGame.id, baseGame.numberOfBags, leftPlayers, rightPlayers, !pulledFromLocalStorage);
            gameWithFunctions.id = baseGame.id;
            let pastFrames = new Array();
            for (let pastFrame of baseGame.pastFrames) {
                pastFrames.push(CornholeFrame.fromJson(pastFrame));
            }
            gameWithFunctions.pastFrames = pastFrames;
            gameWithFunctions.currentFrame = CornholeFrame.fromJson(baseGame.currentFrame);
            gameWithFunctions.currentScore = Score.fromJson(baseGame.currentScore);
            return gameWithFunctions;
        });
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
        updateScoreDisplay(this);
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
    undoLastFrame() {
        // Undo the last frame
        if (!confirm("Do you really want to remove the last frame?")) {
            return;
        }
        let lastFrame = this.pastFrames.pop();
        this.currentScore.removeScore(lastFrame.getFrameScore());
        let playerTurn = (this.pastFrames.length) % 2;
        this.leftTeam[playerTurn].removeFrameFromGame(this.id, new IndividualFrame(this.currentFrame, TeamSide.LEFT));
        this.rightTeam[playerTurn].removeFrameFromGame(this.id, new IndividualFrame(this.currentFrame, TeamSide.RIGHT));
        this.currentFrame = new CornholeFrame(this.pastFrames.length, this.numberOfBags);
        updateCurrentThrower();
        storeCurrentGame(this);
        updateScoreDisplay(this);
    }
    // Returns the current score if the currently-active frame was finished
    getCurrentScore() {
        return new Score().appendScore(this.currentScore).appendScore(this.currentFrame.getFrameScore());
    }
    addThrow(bagStatus, teamSide) {
        this.currentFrame.addBagResult(teamSide, bagStatus);
        updateScoreDisplay(this);
    }
    subtractThrow(bagStatus, teamSide) {
        this.currentFrame.removeBagResult(teamSide, bagStatus);
        updateScoreDisplay(this);
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
let undoLastFrame = function () {
    getCurrentGame().undoLastFrame();
};
// Updates score for the frame, player, and overall score.
let updateScoreDisplay = function (game) {
    // let game = getCurrentGame();
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
    return __awaiter(this, void 0, void 0, function* () {
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
            yield getPlayerPromise(teamOnePlayerOneName),
            yield getPlayerPromise(teamOnePlayerTwoName),
        ], [
            yield getPlayerPromise(teamTwoPlayerOneName),
            yield getPlayerPromise(teamTwoPlayerTwoName),
        ], 
        /* registerGame= */ true);
        storeCurrentGame(newGame);
        displayGameProgress(0);
    });
};
let endGame = function () {
    // Store the game in the history, only if there's actual frames from it. Also clear the current game from storage.
    if (getCurrentGame().pastFrames.length > 0) {
        storePastGame(getCurrentGame());
    }
    clearCurrentGame();
    window.location.href = "index.html";
};
let storeCurrentGame = function (currentGame) {
    localStorage.setObject(CURRENT_GAME, currentGame);
};
let clearCurrentGame = function () {
    cachedCurrentGame = null;
    localStorage.removeItem(CURRENT_GAME);
};
// Cache the current game so we don't need to keep referencing storage
let cachedCurrentGame = null;
let getCurrentGame = function () {
    if (!localStorage.getObject(CURRENT_GAME)) {
        return null;
    }
    if (cachedCurrentGame == null) {
        cachedCurrentGame = CornholeGame.fromJsonSynchronous(localStorage.getObject(CURRENT_GAME));
    }
    return cachedCurrentGame;
};
let getPastGames = function () {
    let pastGames = localStorage.getObject(HISTORICAL_GAMES);
    if (pastGames) {
        return new Map(pastGames);
    }
    return null;
};
let storePastGame = function (finishedGame) {
    let transaction = db.transaction(HISTORICAL_GAMES, "readwrite");
    let games = transaction.objectStore(HISTORICAL_GAMES);
    transaction.onerror = function () {
        alert("Writing failed");
    };
    games.put(finishedGame);
};
//# sourceMappingURL=game_management.js.map