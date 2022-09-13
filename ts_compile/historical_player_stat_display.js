let setupPlayerHistoryPage = function () {
    let mainContainer = document.getElementById("main_player_history_container");
    for (let player of getPlayers()) {
        if (player[1].games.size === 0) {
            continue;
        }
        let playerSection = document.createElement("section");
        playerSection.className = "player_stat";
        playerSection.style.width = "200%";
        let nameTitle = createHeader3WithText(player[1].name);
        nameTitle.classList.add("capitalize", "center_text");
        playerSection.append(nameTitle);
        playerSection.append(createHeader3WithText("Statistics"));
        playerSection.append(createDivWithText("Games Played: " + player[1].games.size.toString(), false));
        let titleSection = document.createElement("section");
        titleSection.className = "horizontal_spacing";
        titleSection.append(createDivWithText("Total", false));
        titleSection.append(createDivWithText("Holes", false));
        titleSection.append(createDivWithText("Boards", false));
        titleSection.append(createDivWithText("Misses", false));
        playerSection.append(titleSection);
        let totalHoles = 0;
        let totalBoards = 0;
        let totalThrown = 0;
        for (let gameInfo of player[1].games) {
            for (let frameData of gameInfo[1]) {
                for (let bagStatus of frameData.score) {
                    if (bagStatus === BagStatus.IN) {
                        totalHoles += 1;
                    }
                    else {
                        totalBoards += 1;
                    }
                }
                totalThrown += frameData.bagsPossible;
            }
        }
        let percentageSection = document.createElement("section");
        percentageSection.className = "horizontal_spacing";
        percentageSection.append(createDivWithText(Math.round(((totalHoles + totalBoards) / totalThrown) * 100).toString() + "%", true));
        percentageSection.append(createDivWithText(Math.round((totalHoles / totalThrown) * 100).toString() + "%", true));
        percentageSection.append(createDivWithText(Math.round((totalBoards / totalThrown) * 100).toString() + "%", true));
        percentageSection.append(createDivWithText(Math.round(((totalThrown - (totalHoles + totalBoards)) / totalThrown) * 100).toString() + "%", true));
        playerSection.append(percentageSection);
        let countSection = document.createElement("section");
        countSection.className = "horizontal_spacing";
        countSection.append(createDivWithText(((totalHoles + totalBoards)).toString(), true));
        countSection.append(createDivWithText((totalHoles).toString(), true));
        countSection.append(createDivWithText((totalBoards).toString(), true));
        countSection.append(createDivWithText(((totalThrown - (totalHoles + totalBoards))).toString(), true));
        playerSection.append(countSection);
        playerSection.append(document.createElement("hr"));
        mainContainer.append(playerSection);
    }
};
//# sourceMappingURL=historical_player_stat_display.js.map