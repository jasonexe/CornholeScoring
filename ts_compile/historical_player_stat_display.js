const sortingFunctions = {
    "name": (a, b) => { return a[0].localeCompare(b[0]); },
    "games_played": (a, b) => { return b[1].games.size - a[1].games.size; },
    "average_score": (a, b) => {
        let player1Aggregate = getPlayerAggregateData(a[1]);
        let player2Aggregate = getPlayerAggregateData(b[1]);
        let average1ScorePerFrame = ((player1Aggregate.totalHoles * 3 + player1Aggregate.totalBoards) / (player1Aggregate.totalFrames));
        let average2ScorePerFrame = ((player2Aggregate.totalHoles * 3 + player2Aggregate.totalBoards) / (player2Aggregate.totalFrames));
        // Do 2 minus 1 because we want it to be descending
        return (average2ScorePerFrame || 0) - (average1ScorePerFrame || 0);
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
        this.totalWins = 0;
    }
}
let initializeDateRanges = function () {
    // Get current date
    const currentDate = new Date();
    // Create an array to store the date ranges
    const dateRanges = [];
    // Generate date ranges for the past 12 months
    for (let i = 0; i < 12; i += 3) {
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, currentDate.getDate() + 1);
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i - 2, currentDate.getDate() + 1);
        const endDateString = endDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const startDateString = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        dateRanges.push({ start: startDate, end: endDate, label: `${startDateString} - ${endDateString}` });
    }
    // Populate the select box with date ranges
    const selectBox = document.getElementById('date-range-select');
    for (let j = 0; j < dateRanges.length; j++) {
        const option = document.createElement('option');
        option.value = formatDate(dateRanges[j].start) + "__" + formatDate(dateRanges[j].end);
        option.text = dateRanges[j].label;
        selectBox.appendChild(option);
    }
};
let preloadDateRange = function (value) {
    let dates = value.split("__");
    let startDate = dates[0];
    let endDate = dates[1];
    document.getElementById("start-date").value = startDate;
    document.getElementById("end-date").value = endDate;
};
let getPlayerAggregateData = function (player) {
    let startDate = new Date(document.getElementById("start-date").value);
    let endDate = new Date(document.getElementById("end-date").value);
    let playerData = new PlayerData();
    playerData.totalWins = getPlayerWins(player);
    for (let gameInfo of player.games) {
        // Determine how the player did in the game
        let gameDate = new Date(gameInfo[0]);
        if (gameDate > endDate || gameDate < startDate) {
            continue;
        }
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
// This is set at the start of setupPlayerHistoryPage()
let pastGamesCache = undefined;
let getPlayerWins = function (player) {
    // Determine if the user won the game
    let totalWins = 0;
    for (let gameInfo of player.games) {
        let gameData = pastGamesCache.get(gameInfo[0]);
        if (gameData == null) {
            continue;
        }
        for (let leftTeamPlayer of gameData.leftTeam) {
            if (player.name == leftTeamPlayer.name) {
                if (gameData.currentScore.leftCalculatedScore >= 21) {
                    totalWins += 1;
                }
            }
        }
        for (let rightTeamPlayer of gameData.rightTeam) {
            if (player.name == rightTeamPlayer.name) {
                if (gameData.currentScore.rightCalculatedScore >= 21) {
                    totalWins += 1;
                }
            }
        }
    }
    return totalWins;
};
let setupPlayerHistoryPage = function () {
    pastGamesCache = getPastGames();
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
        if (aggregateData.totalThrown === 0) {
            continue;
        }
        let playerSection = document.createElement("section");
        playerSection.className = "player_stat";
        let nameTitle = createHeader3WithText(player[1].name);
        nameTitle.classList.add("capitalize", "center_text");
        playerSection.append(nameTitle);
        playerSection.append(createHeader3WithText("Statistics"));
        playerSection.append(createDivWithText("Games Played: "
            + player[1].games.size.toString()
            + ", Games Won: " + aggregateData.totalWins + " (" + Math.round((aggregateData.totalWins / player[1].games.size) * 100) + "%)"
            + "<br>Frames Played: " + aggregateData.totalFrames, 
        /* bold= */ false));
        let tableContainer = document.createElement("table");
        let titleRow = document.createElement("tr");
        titleRow.append(createTableDataWithText("Total", false));
        titleRow.append(createTableDataWithText("Holes", false));
        titleRow.append(createTableDataWithText("Boards", false));
        titleRow.append(createTableDataWithText("Misses", false));
        titleRow.append(createTableDataWithText("Avg/Frame", false));
        tableContainer.append(titleRow);
        let percentageRow = document.createElement("tr");
        percentageRow.append(createTableDataWithText(Math.round(((aggregateData.totalHoles * 3 + aggregateData.totalBoards) / (aggregateData.totalThrown * 3)) * 100).toString() + "%", true));
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
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
//# sourceMappingURL=historical_player_stat_display.js.map