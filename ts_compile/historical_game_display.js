// This method might be more appropriate in a new file, but I'm lazy
// so just going to put it here. It initializes history.html. All the other
// methods in this file manage game_summary.html
let displayPastGamesSummary = function () {
    let mainSection = document.getElementById("past_game_summaries");
    mainSection.innerText = "";
    for (let pastGame of getPastGames()) {
        let encapsulatingLink = document.createElement("a");
        encapsulatingLink.href = "game_summary.html?gameId=" + pastGame[1].id;
        encapsulatingLink.className = "no_style";
        let parentSection = document.createElement("section");
        parentSection.className = "bordered_section";
        let firstPlayerNameSection = document.createElement("section");
        firstPlayerNameSection.className = "horizontal_spacing";
        firstPlayerNameSection.append(createCapitalizedDivWithText(pastGame[1].leftTeam[0].name, /* bold= */ false));
        firstPlayerNameSection.append(createCapitalizedDivWithText(pastGame[1].rightTeam[0].name, /* bold= */ false));
        parentSection.append(firstPlayerNameSection);
        let secondPlayerNameSection = document.createElement("section");
        secondPlayerNameSection.className = "horizontal_spacing";
        secondPlayerNameSection.append(createCapitalizedDivWithText(pastGame[1].leftTeam[1].name, /* bold= */ false));
        secondPlayerNameSection.append(createCapitalizedDivWithText(pastGame[1].rightTeam[1].name, /* bold= */ false));
        parentSection.append(secondPlayerNameSection);
        let scoreSection = document.createElement("section");
        scoreSection.className = "horizontal_spacing";
        scoreSection.append(createHeader3WithText(pastGame[1].currentScore.leftCalculatedScore.toString()));
        scoreSection.append(createHeader3WithText(pastGame[1].currentScore.rightCalculatedScore.toString()));
        parentSection.append(scoreSection);
        parentSection.append(createDivWithText(new Date(pastGame[0]).toLocaleString(), false));
        encapsulatingLink.append(parentSection);
        mainSection.prepend(encapsulatingLink);
    }
};
// Stored as a global variable so we don't need to keep getting it
let pastGame;
let displayGameInUrl = function () {
    pastGame = getPastGame(getGameIdFromUrl());
    updatePastFrames(pastGame);
};
let getGameIdFromUrl = function () {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("gameId"));
};
let displayFrames = function () {
    // updatePastFrames(pastGame);
    let pastFrameSection = document.getElementById("past_frames");
    pastFrameSection.style.display = "block";
    let playerPerformanceSection = document.getElementById("player_performance");
    playerPerformanceSection.style.display = "none";
};
let displayPlayerPerformance = function (playerName) {
    let pastFrameSection = document.getElementById("past_frames");
    pastFrameSection.style.display = "none";
    let playerPerformanceSection = document.getElementById("player_performance");
    playerPerformanceSection.style.display = "block";
    let playerData = getPlayer(playerName);
    let playerFrames = playerData.games.get(getGameIdFromUrl());
    let totalBagsThrown = 0;
    let totalHoles = 0;
    let totalBoards = 0;
    for (let frame of playerFrames) {
        totalBagsThrown += frame.bagsPossible;
        for (let status of frame.score) {
            if (status === BagStatus.IN) {
                totalHoles += 1;
            }
            else {
                totalBoards += 1;
            }
        }
    }
    playerPerformanceSection.innerText = "";
    let percentageHeader = createHeader3WithText("Percentages");
    playerPerformanceSection.append(percentageHeader);
    playerPerformanceSection.append(getSectionLabels(/* includeThrown= */ false));
    let totalPercentPoints = Math.round(((totalHoles + totalBoards) / totalBagsThrown) * 100);
    let totalPercentHoles = Math.round((totalHoles / totalBagsThrown) * 100);
    let totalPercentBoards = Math.round((totalBoards / totalBagsThrown) * 100);
    playerPerformanceSection.append(getNumberSection([totalPercentPoints,
        totalPercentHoles,
        totalPercentBoards], 
    /* includePercentage= */ true));
    playerPerformanceSection.append(document.createElement("hr"));
    playerPerformanceSection.append(createHeader3WithText("Count"));
    playerPerformanceSection.append(getSectionLabels(/* includeThrown= */ true));
    playerPerformanceSection.append(getNumberSection([totalHoles + totalBoards,
        totalHoles,
        totalBoards,
        totalBagsThrown], false));
    playerPerformanceSection.append(document.createElement("hr"));
    playerPerformanceSection.append(createHeader3WithText("Score"));
    playerPerformanceSection.append(getSectionLabels(/* includeThrown= */ false));
    playerPerformanceSection.append(getNumberSection([(totalHoles * 3) + totalBoards,
        totalHoles * 3,
        totalBoards], false));
    playerPerformanceSection.append(document.createElement("hr"));
    playerPerformanceSection.append(document.createElement("hr"));
    console.log(playerFrames);
};
let getSectionLabels = function (includeThrown) {
    let sectionLabels = document.createElement("section");
    sectionLabels.className = "horizontal_spacing";
    sectionLabels.append(createDivWithText("Total", /* bold= */ false));
    sectionLabels.append(createDivWithText("Holes", /* bold= */ false));
    sectionLabels.append(createDivWithText("Boards", /* bold= */ false));
    if (includeThrown) {
        sectionLabels.append(createDivWithText("Thrown", /* bold= */ false));
    }
    return sectionLabels;
};
let getNumberSection = function (numbers, includePercentage) {
    let numberSection = document.createElement("section");
    numberSection.className = "horizontal_spacing";
    for (let number of numbers) {
        let display = createDivWithText(number.toString() + (includePercentage ? "%" : ""), 
        /* bold= */ true);
        numberSection.append(display);
    }
    return numberSection;
};
//# sourceMappingURL=historical_game_display.js.map