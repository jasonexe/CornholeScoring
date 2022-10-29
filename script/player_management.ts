const PLAYER_KEY = "__AllPlayers__";

class CornholePlayer {
    // The name of the player - should be unique, only one player ever can have a given name.
    name: string;
    archived: boolean;
    games = new Map<number, Array<IndividualFrame>>();

    constructor(name: string, archived: boolean) {
        this.name = name;
        this.archived = archived;
    }

    /**
     * "Archive" the player - this means they'll only show up in the player summary list, but won't be available to choose
     * for actual games.
     */
    archive() {
        this.archived = true;
        this.updateStorage();
    }

    registerGame(gameId: number) {
        if (!this.games.get(gameId)) {
            this.games.set(gameId, new Array<IndividualFrame>());
        }
        this.updateStorage();
    }

    getGameStats(gameId: number): GameStats {
        return new GameStats();
    }

    addFrameToGame(gameId: number, frame: IndividualFrame) {
        let gameFrameArray = this.games.get(gameId);
        if (!gameFrameArray) {
            gameFrameArray = new Array<IndividualFrame>();
        }
        gameFrameArray.push(frame);
        this.games.set(gameId, gameFrameArray);
        this.updateStorage();
    }

    // Stores any updates to this CornholePlayer in LocalStorage
    updateStorage() {
        updatePlayerData(this);
    }

    // Constructs the whole class given a base from JSON parsing
    static fromJson(basePlayer: CornholePlayer): CornholePlayer {
        let playerWithFunc = new CornholePlayer(basePlayer.name, basePlayer.archived);
        playerWithFunc.games = basePlayer.games;
        return playerWithFunc;
    }
}

let updatePlayerData = function (player: CornholePlayer) {
    let allPlayers: Map<string, CornholePlayer> = localStorage.getObject(PLAYER_KEY);
    if (!allPlayers) {
        // If allPlayers is null, just skip
        return;
    }
    allPlayers.set(player.name, player);
    localStorage.setObject(PLAYER_KEY, allPlayers);
}

let getPlayer = function (playerName: string): CornholePlayer {
    let allPlayers: Map<string, CornholePlayer> = localStorage.getObject(PLAYER_KEY);
    return CornholePlayer.fromJson(allPlayers.get(playerName));
}

let getPlayers = function (): Map<string, CornholePlayer> {
    let allPlayers: Map<string, CornholePlayer> = localStorage.getObject(PLAYER_KEY);
    return new Map([...allPlayers.entries()].sort());
}

let createNewPlayer = function (firstTry: boolean) {
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
        let playerSet = new Map<string, CornholePlayer>();
        playerSet.set(player.name, player);
        localStorage.setObject(PLAYER_KEY, playerSet);
    } else {
        let playerSet: Map<string, CornholePlayer> = localStorage.getObject(PLAYER_KEY);
        console.log(playerSet.get(playerName));
        if (!playerSet.get(playerName)) {
            playerSet.set(playerName, player);
            localStorage.setObject(PLAYER_KEY, playerSet);
        } else {
            createNewPlayer(/* firstTry= */ false);
        }
    }

    updatePlayerSelectionList();
}

let removePlayer = function() {
    let removalPlayerSelector = <HTMLSelectElement> document.getElementById("player_to_remove");
    let removedPlayerName = removalPlayerSelector.selectedOptions[0].value;
    let allPlayers: Map<string, CornholePlayer> = localStorage.getObject(PLAYER_KEY);
    allPlayers.delete(removedPlayerName);
    localStorage.setObject(PLAYER_KEY, allPlayers);
    updatePlayerSelectionList();
}

let archivePlayer = function() {
    let archivePlayerSelector = <HTMLSelectElement> document.getElementById("player_to_remove");
    let archivePlayerName = archivePlayerSelector.selectedOptions[0].value;
    let allPlayers: Map<string, CornholePlayer> = localStorage.getObject(PLAYER_KEY);
    // Archive using the variable so we don't need a deep copy
    allPlayers.get(archivePlayerName).archived = true;
    localStorage.setObject(PLAYER_KEY, allPlayers);
    updatePlayerSelectionList();
}

// Just initializes 4 players if there aren't any
let initializePlayers = function () {
    if (!localStorage.getObject(PLAYER_KEY)) {
        let player1 = new CornholePlayer("zzplayer1", false);
        let player2 = new CornholePlayer("zzplayer2", false);
        let player3 = new CornholePlayer("zzplayer3", false);
        let player4 = new CornholePlayer("zzplayer4", false);
        let playerSet = new Map<string, CornholePlayer>();
        playerSet.set(player2.name, player2);
        playerSet.set(player1.name, player1);
        playerSet.set(player3.name, player3);
        playerSet.set(player4.name, player4);
        console.log(playerSet);
        localStorage.setObject(PLAYER_KEY, playerSet);
    }
}