const CURRENT_GAME = "__CURRENT_GAME__";
const HISTORICAL_GAMES = "__HISTORICAL_GAMES__";

class CornholeGame {
    id: number;
    leftTeam: Array<CornholePlayer>;
    rightTeam: Array<CornholePlayer>;
    pastFrames = new Array<CornholeFrame>();
    numberOfBags: number;

    currentFrame: CornholeFrame;
    currentScore: Score = new Score();

    constructor(gameId: number, numberOfBags: number, leftTeam: Array<CornholePlayer>, rightTeam: Array<CornholePlayer>, registerGame: boolean) {
        if (gameId === 0) {
            this.id = Date.now();
        } else {
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
    updatePlayer(player: CornholePlayer) {
        let updatedLeftArray = new Array<CornholePlayer>();
        for (let checkPlayer of this.leftTeam) {
            if (checkPlayer.name === player.name) {
                updatedLeftArray.push(player);
            } else {
                updatedLeftArray.push(checkPlayer);
            }
        }
        this.leftTeam = updatedLeftArray;

        let updatedRightArray = new Array<CornholePlayer>();
        for (let checkPlayer of this.rightTeam) {
            if (checkPlayer.name === player.name) {
                updatedRightArray.push(player);
            } else {
                updatedRightArray.push(checkPlayer);
            }
        }
        this.rightTeam = updatedRightArray;
    }

    static fromJsonSynchronous(baseGame: CornholeGame): CornholeGame {
        let leftPlayers = new Array<CornholePlayer>();
        for (let leftPlayer of baseGame.leftTeam) {
            leftPlayers.push(CornholePlayer.fromJsonSynchronous(leftPlayer));
        }
        let rightPlayers = new Array<CornholePlayer>();
        for (let rightPlayer of baseGame.rightTeam) {
            rightPlayers.push(CornholePlayer.fromJsonSynchronous(rightPlayer));
        }
        let gameWithFunctions = new CornholeGame(baseGame.id, baseGame.numberOfBags, leftPlayers, rightPlayers, /* registerGame= */ true);
        gameWithFunctions.id = baseGame.id;
        let pastFrames = new Array<CornholeFrame>();
        for (let pastFrame of baseGame.pastFrames) {
            pastFrames.push(CornholeFrame.fromJson(pastFrame));
        }
        gameWithFunctions.pastFrames = pastFrames;
        gameWithFunctions.currentFrame = CornholeFrame.fromJson(baseGame.currentFrame);
        gameWithFunctions.currentScore = Score.fromJson(baseGame.currentScore);
        return gameWithFunctions
    }

    // Constructs the whole class given a base from JSON parsing
    static async fromJson(baseGame: CornholeGame, pulledFromLocalStorage: boolean): Promise<CornholeGame> {
        let leftPlayers = new Array<CornholePlayer>();
        for (let leftPlayer of baseGame.leftTeam) {
            leftPlayers.push(await CornholePlayer.fromJson(leftPlayer));
        }
        let rightPlayers = new Array<CornholePlayer>();
        for (let rightPlayer of baseGame.rightTeam) {
            rightPlayers.push(await CornholePlayer.fromJson(rightPlayer));
        }
        let gameWithFunctions = new CornholeGame(baseGame.id, baseGame.numberOfBags, leftPlayers, rightPlayers, !pulledFromLocalStorage);
        gameWithFunctions.id = baseGame.id;
        let pastFrames = new Array<CornholeFrame>();
        for (let pastFrame of baseGame.pastFrames) {
            pastFrames.push(CornholeFrame.fromJson(pastFrame));
        }
        gameWithFunctions.pastFrames = pastFrames;
        gameWithFunctions.currentFrame = CornholeFrame.fromJson(baseGame.currentFrame);
        gameWithFunctions.currentScore = Score.fromJson(baseGame.currentScore);
        return gameWithFunctions
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
            alert("The left team won! Nice Job!")
        }
        if (this.currentScore.rightCalculatedScore >= 21) {
            // Right team won!
            endGame();
            alert("The right team won! Nice Job!")
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

    addThrow(bagStatus: BagStatus, teamSide: TeamSide) {
        this.currentFrame.addBagResult(teamSide, bagStatus);
        updateScoreDisplay(this);
    }

    subtractThrow(bagStatus: BagStatus, teamSide: TeamSide) {
        this.currentFrame.removeBagResult(teamSide, bagStatus);
        updateScoreDisplay(this);
    }
}

// Hole + board management
let addThrow = function (bagStatus: BagStatus, teamSide: TeamSide) {
    let currentGame : CornholeGame = getCurrentGame();
    currentGame.addThrow(bagStatus, teamSide);
}

let subtractThrow = function (bagStatus: BagStatus, teamSide: TeamSide) {
    let currentGame = getCurrentGame();
    currentGame.subtractThrow(bagStatus, teamSide);
}

let submitFrame = function () {
    getCurrentGame().submitFrame();
}

let undoLastFrame = function () {
    getCurrentGame().undoLastFrame();
}

// Updates score for the frame, player, and overall score.
let updateScoreDisplay = function (game: CornholeGame) {
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
}

let selectTeams = function () {
    // Read the DOM and do stuff to create a CornholeGame instance.
    let startGameScreen = document.getElementById("start_game");
    let addPlayerScreen = document.getElementById("add_players");

    startGameScreen.style.display = "none";
    addPlayerScreen.style.display = "block";
}

// Updates UI to the "game" screen and initializes the CornholeGame, storing it in LocalStorage
let startGame = async function () {
    // Read the DOM and do stuff to create a CornholeGame instance.
    let teamOnePlayerOneName =
        (<HTMLSelectElement>document.getElementById("team_one_player_one"))
            .selectedOptions[0]
            .value;
    let teamOnePlayerTwoName =
        (<HTMLSelectElement>document.getElementById("team_one_player_two"))
            .selectedOptions[0]
            .value;

    let teamTwoPlayerOneName =
        (<HTMLSelectElement>document.getElementById("team_two_player_one"))
            .selectedOptions[0]
            .value;
    let teamTwoPlayerTwoName =
        (<HTMLSelectElement>document.getElementById("team_two_player_two"))
            .selectedOptions[0]
            .value;

    // Got the names, put them in the selectors.

    let newGame = new CornholeGame(
        0,
        4,
        [
            await getPlayerPromise(teamOnePlayerOneName),
            await getPlayerPromise(teamOnePlayerTwoName),
        ],
        [
            await getPlayerPromise(teamTwoPlayerOneName),
            await getPlayerPromise(teamTwoPlayerTwoName),
        ],
        /* registerGame= */ true)
    storeCurrentGame(newGame);

    displayGameProgress(0);
}

let endGame = function () {
    // Store the game in the history, only if there's actual frames from it. Also clear the current game from storage.
    if (getCurrentGame().pastFrames.length > 0) {
        storePastGame(getCurrentGame());
    }
    clearCurrentGame();

    window.location.href = "index.html";
}

let storeCurrentGame = function (currentGame: CornholeGame) {
    localStorage.setObject(CURRENT_GAME, currentGame);
}

let clearCurrentGame = function () {
    cachedCurrentGame = null;
    localStorage.removeItem(CURRENT_GAME);
}

// Cache the current game so we don't need to keep referencing storage
let cachedCurrentGame : CornholeGame = null;
let getCurrentGame = function (): CornholeGame {
    if (!localStorage.getObject(CURRENT_GAME)) {
        return null;
    }
    if (cachedCurrentGame == null) {
        cachedCurrentGame = CornholeGame.fromJsonSynchronous(localStorage.getObject(CURRENT_GAME))
    }
    return cachedCurrentGame;
}

let getPastGames = function (): Promise<Map<number, CornholeGame>> {
    return new Promise (function(resolve) {
        let gamesTable = db.transaction(HISTORICAL_GAMES, "readonly").objectStore(HISTORICAL_GAMES);
        // Get all games from the past 60 days.
        let pastGames = gamesTable.getAll(IDBKeyRange.lowerBound(Date.now() - 24 * 3600 * 1000 * 60));

        pastGames.onsuccess = function (event : any) {
            let pastGameArray : Array<CornholeGame> = event.target.result;
            return resolve(pastGameArray ? new Map(pastGameArray.map((object) => [object.id, object])) : null);
        }
    });
}

let storePastGame = function (finishedGame: CornholeGame, transaction? : IDBTransaction) {
    transaction = transaction ? transaction : db.transaction(HISTORICAL_GAMES, "readwrite");
    let games = transaction.objectStore(HISTORICAL_GAMES);
    transaction.onerror = function() {
        alert("Writing failed");
    }
    
    games.put(finishedGame);
}