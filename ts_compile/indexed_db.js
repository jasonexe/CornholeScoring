// import idb from './idb.js';
const SCOREHOLE_NAME = "scorehole";
// let openRequest = idb.openDB(SCOREHOLE_NAME, 1);
let openRequest = indexedDB.open(SCOREHOLE_NAME, 1);
let db;
openRequest.onupgradeneeded = function (event) {
    // initialize, read from localStorage if necessary
    let db = event.target.result;
    switch (event.oldVersion) {
        case 0:
            // No existing database, initialize it
            db.createObjectStore(PLAYER_KEY, { keyPath: 'name' });
            db.createObjectStore(HISTORICAL_GAMES, { keyPath: 'id' });
            let player1 = new CornholePlayer("zzplayer1", false);
            let player2 = new CornholePlayer("zzplayer2", false);
            let player3 = new CornholePlayer("zzplayer3", false);
            let player4 = new CornholePlayer("zzplayer4", false);
            let transaction = event.target.transaction;
            updatePlayerData(player1, transaction);
            updatePlayerData(player2, transaction);
            updatePlayerData(player3, transaction);
            updatePlayerData(player4, transaction);
            break;
        case 1:
            // It did exist, so do whatever upgrade is needed
            break;
    }
};
openRequest.onerror = function () {
    alert("Something went wrong opening the database: " + openRequest.error);
};
openRequest.onsuccess = function () {
    db = openRequest.result;
};
// Note that these will not return any class methods
let getPlayerPromise = function (playerName) {
    return new Promise(function (resolve) {
        let tx = db.transaction(PLAYER_KEY, "readonly");
        var store = tx.objectStore(PLAYER_KEY);
        store.get(playerName).onsuccess = function (event) {
            return resolve(event.target.result ? CornholePlayer.fromJson(event.target.result) : null);
        };
    });
};
let getGamePromise = function (gameId) {
    return new Promise(function (resolve) {
        let tx = db.transaction(HISTORICAL_GAMES, "readonly");
        var store = tx.objectStore(HISTORICAL_GAMES);
        store.get(gameId).onsuccess = function (event) {
            let game = event.target.result;
            return resolve(game ? CornholeGame.fromJson(game, true) : null);
        };
    });
};
let getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value, reviver);
};
//# sourceMappingURL=indexed_db.js.map