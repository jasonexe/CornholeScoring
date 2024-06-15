var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PLAYER_KEY = "__AllPlayers__";
class CornholePlayer {
    constructor(name, archived) {
        this.games = new Map();
        this.name = name;
        this.archived = archived;
        this.games = new Map();
        this.favorite = false;
    }
    /**
     * "Archive" the player - this means they'll only show up in the player summary list, but won't be available to choose
     * for actual games.
     */
    archive() {
        this.archived = true;
        this.updateStorage();
    }
    registerGame(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            // If there's already data in storage that doesn't match what's in the game player, merge them
            let localPlayer = yield getPlayerPromise(this.name);
            if (localPlayer) {
                for (let game of localPlayer.games) {
                    // Go through all the games already stored locally, and make sure they're synced up.
                    if (!this.games.has(game[0])) {
                        // Add it if it's not there
                        this.addFullGameWithoutStorageUpdate(game[0], game[1]);
                    }
                }
            }
            if (!this.games.get(gameId)) {
                this.games.set(gameId, new Array());
            }
            this.updateStorage();
        });
    }
    getGameStats(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            let pastGame = yield getGamePromise(gameId);
            if (!pastGame) {
                return null;
            }
            return new GameStatsForPlayer(pastGame, this.name);
        });
    }
    addFrameToGame(gameId, frame) {
        let gameFrameArray = this.games.get(gameId);
        if (!gameFrameArray) {
            gameFrameArray = new Array();
        }
        gameFrameArray.push(frame);
        this.games.set(gameId, gameFrameArray);
        this.updateStorage();
    }
    removeFrameFromGame(gameId, frame) {
        let gameFrameArray = this.games.get(gameId);
        if (!gameFrameArray) {
            // No-op if there's not even a game stored for the customer
            return;
        }
        let lastFrame = gameFrameArray.pop();
        // To be safe, make sure the last frame is the frame we want to remove. In theory this should never be false.
        if (lastFrame !== frame) {
            // If it's not the right one, return early.
            gameFrameArray.push(lastFrame);
            return;
        }
        this.games.set(gameId, gameFrameArray);
        this.updateStorage();
    }
    addFramesFromGame(game) {
        if (this.games.get(game.id) && this.games.get(game.id).length > 0) {
            // Return early and don't update storage if the game frames already exist
            return;
        }
        let playerIndex;
        let playerSide;
        let leftMoveIndex = game.leftTeam.findIndex((player) => player.name === this.name);
        if (leftMoveIndex >= 0) {
            playerIndex = leftMoveIndex;
            playerSide = TeamSide.LEFT;
        }
        else {
            playerIndex = game.rightTeam.findIndex((player) => player.name === this.name);
            playerSide = TeamSide.RIGHT;
        }
        let frames = game.pastFrames.filter((element, index) => {
            return index % 2 === playerIndex;
        });
        for (let frame of frames) {
            this.addFrameToGame(game.id, new IndividualFrame(frame, playerSide));
        }
        this.updateStorage();
    }
    addFullGame(gameId, allFrames) {
        if (this.games.get(gameId).length > 0) {
            // Return early and don't update storage if the game frames already exist
            return;
        }
        this.games.set(gameId, allFrames);
        this.updateStorage();
    }
    addFullGameWithoutStorageUpdate(gameId, allFrames) {
        this.games.set(gameId, allFrames);
    }
    // Stores any updates to this CornholePlayer in LocalStorage
    updateStorage() {
        updatePlayerData(this);
    }
    // Only should be called for the players in the current game (we won't populate any data from storage in this one)
    static fromJsonSynchronous(basePlayer) {
        let playerWithFunc = new CornholePlayer(basePlayer.name, basePlayer.archived == null ? false : basePlayer.archived);
        playerWithFunc.favorite = basePlayer.favorite === undefined ? false : basePlayer.favorite;
        playerWithFunc.games = basePlayer.games;
        return playerWithFunc;
    }
    // Constructs the whole class given a base from JSON parsing
    static fromJson(basePlayer) {
        return __awaiter(this, void 0, void 0, function* () {
            let playerWithFunc = new CornholePlayer(basePlayer.name, basePlayer.archived == null ? false : basePlayer.archived);
            playerWithFunc.favorite = basePlayer.favorite === undefined ? false : basePlayer.favorite;
            if (basePlayer.games) {
                // If the base player already has games, then we don't need to pull from the DB
                playerWithFunc.games = basePlayer.games;
            }
            else {
                let storedPlayer = yield getPlayerPromise(basePlayer.name);
                if (storedPlayer) {
                    playerWithFunc.games = storedPlayer.games;
                }
            }
            return playerWithFunc;
        });
    }
}
function updatePlayerData(player, transaction) {
    transaction = transaction ? transaction : db.transaction(PLAYER_KEY, "readwrite");
    let players = transaction.objectStore(PLAYER_KEY);
    transaction.onerror = function () {
        alert("Writing failed");
    };
    players.put(player);
}
// Adds the given completed game to the existing map of completed games.
let addGameToPlayer = function (gameId, playerName, allFrames) {
    return __awaiter(this, void 0, void 0, function* () {
        let existingStoredPlayer = yield getPlayerPromise(playerName);
        if (existingStoredPlayer != null) {
            existingStoredPlayer.addFullGame(gameId, allFrames);
        }
        else {
            let newPlayer = new CornholePlayer(playerName, false);
            newPlayer.addFullGame(gameId, allFrames);
        }
    });
};
let urlPlayerName = function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("playerName")) {
        return urlParams.get("playerName");
    }
    return "Error Retrieving Player";
};
let getPlayers = function () {
    return new Promise(function (resolve) {
        let playersTable = db.transaction(PLAYER_KEY, "readonly").objectStore(PLAYER_KEY);
        let allPlayers = playersTable.getAll();
        allPlayers.onsuccess = function (event) {
            let allPlayerArray = event.target.result;
            return resolve(allPlayerArray ? new Map(allPlayerArray.map((object) => [object.name, object])) : null);
        };
    });
};
let createNewPlayer = function (firstTry) {
    let playerName = prompt(firstTry ?
        "What is the name of the player?"
        : "That name is already taken, try another one");
    if (!playerName) {
        return;
    }
    playerName = playerName.toLocaleLowerCase();
    let player = new CornholePlayer(playerName, /* archived= */ false);
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
    updatePlayerSelectionList(/* initialize= */ false);
};
let favoritePlayer = function () {
    let favoritePlayerSelector = document.getElementById("player_to_remove");
    let favoritePlayerName = favoritePlayerSelector.selectedOptions[0].value;
    let allPlayers = localStorage.getObject(PLAYER_KEY);
    allPlayers.get(favoritePlayerName).favorite = !allPlayers.get(favoritePlayerName).favorite;
    localStorage.setObject(PLAYER_KEY, allPlayers);
    updatePlayerSelectionList(/* initialize= */ false);
};
let removePlayer = function () {
    let removalPlayerSelector = document.getElementById("player_to_remove");
    let removedPlayerName = removalPlayerSelector.selectedOptions[0].value;
    let allPlayers = localStorage.getObject(PLAYER_KEY);
    allPlayers.delete(removedPlayerName);
    localStorage.setObject(PLAYER_KEY, allPlayers);
    updatePlayerSelectionList(/* initialize= */ false);
};
let archivePlayer = function () {
    let archivePlayerSelector = document.getElementById("player_to_remove");
    let archivePlayerName = archivePlayerSelector.selectedOptions[0].value;
    let allPlayers = localStorage.getObject(PLAYER_KEY);
    // Archive using the variable so we don't need a deep copy
    allPlayers.get(archivePlayerName).archived = true;
    localStorage.setObject(PLAYER_KEY, allPlayers);
    updatePlayerSelectionList(/* initialize= */ false);
};
//# sourceMappingURL=player_management.js.map