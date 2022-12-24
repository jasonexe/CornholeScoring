const sortingFunctions = {
    "name": (a, b) => { return a[0].localeCompare(b[0]); },
    "games_played": (a, b) => { return b[1].games.size - a[1].games.size; },
    "average_score": (a, b) => {
        let player1Aggregate = getPlayerAggregateData(a[1]);
        let player2Aggregate = getPlayerAggregateData(b[1]);
        let average1ScorePerFrame = ((player1Aggregate.totalHoles * 3 + player1Aggregate.totalBoards) / (player1Aggregate.totalFrames));
        let average2ScorePerFrame = ((player2Aggregate.totalHoles * 3 + player2Aggregate.totalBoards) / (player2Aggregate.totalFrames));
        // Do 2 minus 1 because we want it to be descending
        return average2ScorePerFrame - average1ScorePerFrame;
    },
    "hole_rate": (a, b) => {
        let player1Aggregate = getPlayerAggregateData(a[1]);
        let player2Aggregate = getPlayerAggregateData(b[1]);
        return (player2Aggregate.totalHoles / player2Aggregate.totalThrown) - (player1Aggregate.totalHoles / player1Aggregate.totalThrown);
    },
    "board_rate": (a, b) => {
        let player1Aggregate = getPlayerAggregateData(a[1]);
        let player2Aggregate = getPlayerAggregateData(b[1]);
        return (player2Aggregate.totalBoards / player2Aggregate.totalThrown) - (player1Aggregate.totalBoards / player1Aggregate.totalThrown);
    },
};
class PlayerData {
    constructor() {
        this.totalHoles = 0;
        this.totalBoards = 0;
        this.totalThrown = 0;
        this.totalFrames = 0;
    }
}
let getPlayerAggregateData = function (player) {
    let playerData = new PlayerData();
    for (let gameInfo of player.games) {
        for (let frameData of gameInfo[1]) {
            if (!frameData.score) {
                playerData.totalThrown += frameData.bagsPossible;
                playerData.totalFrames += 1;
                continue;
            }
            for (let bagStatus of frameData.score) {
                if (bagStatus === BagStatus.IN) {
                    playerData.totalHoles += 1;
                }
                else {
                    playerData.totalBoards += 1;
                }
            }
            playerData.totalThrown += frameData.bagsPossible;
            playerData.totalFrames += 1;
        }
    }
    return playerData;
};
let setupPlayerHistoryPage = function () {
    let unarchivedContainer = document.getElementById("non_archived_player_history_container");
    let archivedContainer = document.getElementById("archived_player_history_container");
    unarchivedContainer.innerHTML = "";
    archivedContainer.innerHTML = "";
    let sortingChoice = document.getElementsByName("sorting_rule")[0].selectedOptions[0].value;
    let sortedPlayers = new Map([...getPlayers()].sort(sortingFunctions[sortingChoice]));
    for (let player of sortedPlayers) {
        if (player[1].games.size === 0) {
            continue;
        }
        let aggregateData = getPlayerAggregateData(player[1]);
        let totalHoles = 0;
        let totalBoards = 0;
        let totalThrown = 0;
        let totalFrames = 0;
        for (let gameInfo of player[1].games) {
            for (let frameData of gameInfo[1]) {
                if (!frameData.score) {
                    totalThrown += frameData.bagsPossible;
                    totalFrames += 1;
                    continue;
                }
                for (let bagStatus of frameData.score) {
                    if (bagStatus === BagStatus.IN) {
                        totalHoles += 1;
                    }
                    else {
                        totalBoards += 1;
                    }
                }
                totalThrown += frameData.bagsPossible;
                totalFrames += 1;
            }
        }
        let playerSection = document.createElement("section");
        playerSection.className = "player_stat";
        // playerSection.style.width = "200%";
        let nameTitle = createHeader3WithText(player[1].name);
        nameTitle.classList.add("capitalize", "center_text");
        playerSection.append(nameTitle);
        playerSection.append(createHeader3WithText("Statistics"));
        playerSection.append(createDivWithText("Games Played: " + player[1].games.size.toString() + "<br>Frames Played: " + totalFrames, false));
        let tableContainer = document.createElement("table");
        let titleRow = document.createElement("tr");
        titleRow.append(createTableDataWithText("Total", false));
        titleRow.append(createTableDataWithText("Holes", false));
        titleRow.append(createTableDataWithText("Boards", false));
        titleRow.append(createTableDataWithText("Misses", false));
        titleRow.append(createTableDataWithText("Avg/Frame", false));
        tableContainer.append(titleRow);
        let percentageRow = document.createElement("tr");
        percentageRow.append(createTableDataWithText(Math.round(((aggregateData.totalHoles * 3 + totalBoards) / (totalThrown * 3)) * 100).toString() + "%", true));
        percentageRow.append(createTableDataWithText(Math.round((aggregateData.totalHoles / aggregateData.totalThrown) * 100).toString() + "%", true));
        percentageRow.append(createTableDataWithText(Math.round((aggregateData.totalBoards / aggregateData.totalThrown) * 100).toString() + "%", true));
        percentageRow.append(createTableDataWithText(Math.round(((aggregateData.totalThrown - (aggregateData.totalHoles + aggregateData.totalBoards)) / aggregateData.totalThrown) * 100).toString() + "%", true));
        percentageRow.append(createTableDataWithText("N/A", true));
        tableContainer.append(percentageRow);
        let countRow = document.createElement("tr");
        countRow.append(createTableDataWithText(((aggregateData.totalHoles * 3 + aggregateData.totalBoards)).toString(), true));
        countRow.append(createTableDataWithText((aggregateData.totalHoles).toString(), true));
        countRow.append(createTableDataWithText((aggregateData.totalBoards).toString(), true));
        countRow.append(createTableDataWithText(((aggregateData.totalThrown - (aggregateData.totalHoles + aggregateData.totalBoards))).toString(), true));
        let averageScorePerFrame = ((aggregateData.totalHoles * 3 + aggregateData.totalBoards) / (aggregateData.totalFrames));
        countRow.append(createTableDataWithText((Math.round((averageScorePerFrame + Number.EPSILON) * 100) / 100).toString(), true));
        tableContainer.append(countRow);
        playerSection.append(tableContainer);
        playerSection.append(document.createElement("hr"));
        if (player[1].archived) {
            archivedContainer.append(playerSection);
        }
        else {
            unarchivedContainer.append(playerSection);
        }
    }
};
let displayArchivedPlayers = false;
let toggleArchiveDisplay = function () {
    let unarchivedContainer = document.getElementById("non_archived_player_history_container");
    let archivedContainer = document.getElementById("archived_player_history_container");
    if (displayArchivedPlayers) {
        unarchivedContainer.style.display = "block";
        archivedContainer.style.display = "none";
    }
    else {
        unarchivedContainer.style.display = "none";
        archivedContainer.style.display = "block";
    }
    displayArchivedPlayers = !displayArchivedPlayers;
};
//# sourceMappingURL=historical_player_stat_display.js.map