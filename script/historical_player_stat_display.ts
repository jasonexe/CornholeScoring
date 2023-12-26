const sortingFunctions = {
    "name": (a: [string, CornholePlayer], b: [string, CornholePlayer]): number => { return a[0].localeCompare(b[0]) },
    "games_played": (a: [string, CornholePlayer], b: [string, CornholePlayer]): number => {
        // We only care about games played during the date range, so filter out others.
        let aGamesPlayed = getGameCountWithinDateRange(a);
        let bGamesPlayed = getGameCountWithinDateRange(b);
        if (aGamesPlayed === bGamesPlayed) {
            // If both played the same number of games, order alphabetically
            return a[0].localeCompare(b[0]);
        }
        return bGamesPlayed - aGamesPlayed;
    },
    "average_score": (a: [string, CornholePlayer], b: [string, CornholePlayer]): number => {
        let player1Aggregate = getPlayerAggregateData(a[1]);
        let player2Aggregate = getPlayerAggregateData(b[1]);
        let average1ScorePerFrame = ((player1Aggregate.totalHoles * 3 + player1Aggregate.totalBoards) / (player1Aggregate.totalFrames));
        let average2ScorePerFrame = ((player2Aggregate.totalHoles * 3 + player2Aggregate.totalBoards) / (player2Aggregate.totalFrames));
        // Do 2 minus 1 because we want it to be descending
        return (average2ScorePerFrame || 0) - (average1ScorePerFrame || 0)
    },
    "hole_rate": (a: [string, CornholePlayer], b: [string, CornholePlayer]): number => {
        let player1Aggregate = getPlayerAggregateData(a[1]);
        let player2Aggregate = getPlayerAggregateData(b[1]);
        return (player2Aggregate.totalHoles / player2Aggregate.totalThrown) - (player1Aggregate.totalHoles / player1Aggregate.totalThrown);
    },
    "board_rate": (a: [string, CornholePlayer], b: [string, CornholePlayer]): number => {
        let player1Aggregate = getPlayerAggregateData(a[1]);
        let player2Aggregate = getPlayerAggregateData(b[1]);
        return (player2Aggregate.totalBoards / player2Aggregate.totalThrown) - (player1Aggregate.totalBoards / player1Aggregate.totalThrown);
    },
}

class PlayerData {
    totalHoles: number = 0;
    totalBoards: number = 0;
    totalThrown: number = 0;
    totalFrames: number = 0;
    totalWins: number = 0;
    gamesPlayed: number = 0;
}


interface DateRange {
    start: Date;
    end: Date;
    label: string;
}

let getGameCountWithinDateRange = function (gameList: [string, CornholePlayer]) {
    let gamesPlayed = 0;
    let startDate = new Date((document.getElementById("start-date") as HTMLInputElement).value)
    let endDate = new Date((document.getElementById("end-date") as HTMLInputElement).value)
    for (let gameTime of gameList[1].games.keys()) {
        let gameDate = new Date(gameTime);
        if (gameDate > endDate || gameDate < startDate) {
            continue;
        }
        gamesPlayed += 1;
    }
    return gamesPlayed;
}

let initializeDateRanges = function () {
    // Get current date
    const currentDate: Date = new Date();

    // Create an array to store the date ranges
    const dateRanges: DateRange[] = [];

    // Generate date ranges for the past 12 months
    for (let i = 0; i < 12; i += 3) {
        const endDate: Date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, currentDate.getDate() + 1);
        const startDate: Date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i - 2, currentDate.getDate() + 1);

        const endDateString: string = endDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        const startDateString: string = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        dateRanges.push({ start: startDate, end: endDate, label: `${startDateString} - ${endDateString}` });
    }

    // Populate the select box with date ranges
    const selectBox: HTMLSelectElement = document.getElementById('date-range-select') as HTMLSelectElement;

    for (let j = 0; j < dateRanges.length; j++) {
        const option: HTMLOptionElement = document.createElement('option');
        option.value = formatDate(dateRanges[j].start) + "__" + formatDate(dateRanges[j].end);
        option.text = dateRanges[j].label;

        selectBox.appendChild(option);
    }
}

let preloadDateRange = function (value: String) {
    let dates = value.split("__");
    let startDate = dates[0];
    let endDate = dates[1];
    (document.getElementById("start-date") as HTMLInputElement).value = startDate;
    (document.getElementById("end-date") as HTMLInputElement).value = endDate;
}

let getPlayerAggregateData = function (player: CornholePlayer) {
    let startDate = new Date((document.getElementById("start-date") as HTMLInputElement).value)
    let endDate = new Date((document.getElementById("end-date") as HTMLInputElement).value)
    let playerData = new PlayerData();
    playerData.totalWins = getPlayerWins(player, startDate, endDate);
    for (let gameInfo of player.games) {
        // Determine how the player did in the game
        let gameDate = new Date(gameInfo[0]);
        // If the game was out of range, or it wasn't actually played, skip it
        if (gameDate > endDate || gameDate < startDate || gameInfo[1].length == 0) {
            continue;
        }
        playerData.gamesPlayed += 1;
        for (let frameData of gameInfo[1]) {
            if (!frameData.score) {
                playerData.totalThrown += frameData.bagsPossible;
                playerData.totalFrames += 1;
                continue;
            }
            for (let bagStatus of frameData.score) {
                if (bagStatus === BagStatus.IN) {
                    playerData.totalHoles += 1;
                } else {
                    playerData.totalBoards += 1;
                }
            }
            playerData.totalThrown += frameData.bagsPossible;
            playerData.totalFrames += 1;
        }
    }
    return playerData;
}

// This is set at the start of setupPlayerHistoryPage()
let pastGamesCache = undefined;
let getPlayerWins = function (player: CornholePlayer, startDate: Date, endDate: Date) {
    // Determine if the user won the game
    let totalWins = 0;
    for (let gameInfo of player.games) {
        let gameDate = new Date(gameInfo[0]);
        if (gameDate > endDate || gameDate < startDate) {
            continue;
        }
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
}

let setupPlayerHistoryPage = function () {
    pastGamesCache = getPastGames();
    let unarchivedContainer = document.getElementById("non_archived_player_history_container");
    let archivedContainer = document.getElementById("archived_player_history_container");
    unarchivedContainer.innerHTML = "";
    archivedContainer.innerHTML = "";
    let sortingChoice = (<HTMLSelectElement>document.getElementsByName("sorting_rule")[0]).selectedOptions[0].value;
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
        let nameTitleLink = document.createElement("a");
        nameTitleLink.setAttribute("href", "./individual_stats.html?playerName=" + player[1].name);
        nameTitleLink.setAttribute("target", "_blank");
        nameTitleLink.appendChild(nameTitle);
        playerSection.append(nameTitleLink);
        playerSection.append(createHeader3WithText("Statistics"));
        playerSection.append(createDivWithText("Games Played: "
            + aggregateData.gamesPlayed.toString()
            + ", Games Won: " + aggregateData.totalWins + " (" + Math.round((aggregateData.totalWins / aggregateData.gamesPlayed) * 100) + "%)"
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
        } else {
            unarchivedContainer.append(playerSection);
        }
    }
}

let displayArchivedPlayers = false;
let toggleArchiveDisplay = function () {
    let unarchivedContainer = document.getElementById("non_archived_player_history_container");
    let archivedContainer = document.getElementById("archived_player_history_container");
    if (displayArchivedPlayers) {
        unarchivedContainer.style.display = "block";
        archivedContainer.style.display = "none";
    } else {
        unarchivedContainer.style.display = "none";
        archivedContainer.style.display = "block";
    }
    displayArchivedPlayers = !displayArchivedPlayers;
}

function formatDate(date: Date): string {
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}