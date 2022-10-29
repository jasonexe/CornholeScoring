let setupPlayerHistoryPage = function () {
    let unarchivedContainer = document.getElementById("non_archived_player_history_container");
    let archivedContainer = document.getElementById("archived_player_history_container");
    for (let player of getPlayers()) {
        if (player[1].games.size === 0) {
            continue;
        }
        let totalHoles = 0;
        let totalBoards = 0;
        let totalThrown = 0;
        let totalFrames = 0;
        for (let gameInfo of player[1].games) {
            for (let frameData of gameInfo[1]) {
                for (let bagStatus of frameData.score) {
                    if (bagStatus === BagStatus.IN) {
                        totalHoles += 1;
                    } else {
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

        let titleSection = document.createElement("section");
        titleSection.className = "horizontal_spacing";
        titleSection.append(createDivWithText("Total", false));
        titleSection.append(createDivWithText("Holes", false));
        titleSection.append(createDivWithText("Boards", false));
        titleSection.append(createDivWithText("Misses", false));
        titleSection.append(createDivWithText("Avg/Frame", false));
        playerSection.append(titleSection);

        let percentageSection = document.createElement("section");
        percentageSection.className = "horizontal_spacing";
        percentageSection.append(createDivWithText(Math.round(((totalHoles*3 + totalBoards) / (totalThrown * 3)) * 100).toString() + "%", true));
        percentageSection.append(createDivWithText(Math.round((totalHoles / totalThrown) * 100).toString() + "%", true));
        percentageSection.append(createDivWithText(Math.round((totalBoards / totalThrown) * 100).toString() + "%", true));
        percentageSection.append(createDivWithText(Math.round(((totalThrown - (totalHoles + totalBoards)) / totalThrown) * 100).toString() + "%", true));
        percentageSection.append(createDivWithText("N/A", true));
        playerSection.append(percentageSection);

        let countSection = document.createElement("section");
        countSection.className = "horizontal_spacing";
        countSection.append(createDivWithText(((totalHoles * 3 + totalBoards)).toString(), true));
        countSection.append(createDivWithText((totalHoles).toString(), true));
        countSection.append(createDivWithText((totalBoards).toString(), true));
        countSection.append(createDivWithText(((totalThrown - (totalHoles + totalBoards))).toString(), true));
        let averageScorePerFrame = ((totalHoles * 3 + totalBoards) / (totalFrames));
        countSection.append(createDivWithText((Math.round((averageScorePerFrame + Number.EPSILON) * 100) / 100).toString(), true));
        playerSection.append(countSection);
        
        playerSection.append(document.createElement("hr"));

        if(player[1].archived) {
            archivedContainer.append(playerSection);
        } else {
            unarchivedContainer.append(playerSection);
        }
    }
}

let displayArchivedPlayers = false;
let toggleArchiveDisplay = function() {
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