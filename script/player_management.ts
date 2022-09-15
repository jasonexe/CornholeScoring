const PLAYER_KEY = "__AllPlayers__";

class CornholePlayer {
    // The name of the player - should be unique, only one player ever can have a given name.
    name: string;
    games = new Map<number, Array<IndividualFrame>>();

    constructor(name: string) {
        this.name = name;
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
        let playerWithFunc = new CornholePlayer(basePlayer.name);
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
    let player = new CornholePlayer(playerName);
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

// Just initializes 4 players if there aren't any
let initializePlayers = function () {
    if (!localStorage.getObject(PLAYER_KEY)) {
        let player1 = new CornholePlayer("zzplayer1");
        let player2 = new CornholePlayer("zzplayer2");
        let player3 = new CornholePlayer("zzplayer3");
        let player4 = new CornholePlayer("zzplayer4");
        let playerSet = new Map<string, CornholePlayer>();
        playerSet.set(player2.name, player2);
        playerSet.set(player1.name, player1);
        playerSet.set(player3.name, player3);
        playerSet.set(player4.name, player4);
        console.log(playerSet);
        localStorage.setObject(PLAYER_KEY, playerSet);
    }
}