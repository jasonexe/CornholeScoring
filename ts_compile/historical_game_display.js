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
let generateSharingUrl = function () {
    let crushedGameData = encodeURIComponent(crush(JSON.stringify(pastGame, replacer)));
    let playerGameData = new Map();
    for (let playerName of playerNames) {
        playerGameData.set(playerName, getPlayer(playerName).games.get(pastGame.id));
    }
    let crushedPlayerFrames = encodeURIComponent(crush(JSON.stringify(playerGameData, replacer)));
    navigator.clipboard.writeText("scorehole.com/game_summary.html?gameData=" + crushedGameData + "&playerData=" + crushedPlayerFrames);
    alert("URL copied to clipboard");
};
// Stored as a global variable so we don't need to keep getting it
let pastGame;
let playerNames = new Array();
// If we're using URL data, this is populated instead of pulling the player from storage.
let playerGameData;
let displayGameInUrl = function () {
    pastGame = getGameFromUrl();
    updatePastFrames(pastGame);
    let leftFinalScoreDisplay = document.getElementById("left_final_score");
    let rightFinalScoreDisplay = document.getElementById("right_final_score");
    leftFinalScoreDisplay.innerText = pastGame.currentScore.leftCalculatedScore.toString();
    rightFinalScoreDisplay.innerText = pastGame.currentScore.rightCalculatedScore.toString();
    let buttonSection = document.getElementById("button_options");
    let frameButton = document.createElement("button");
    frameButton.id = "frame_button";
    frameButton.innerText = "Frames";
    frameButton.style.backgroundColor = "lightgreen";
    frameButton.onclick = displayFrames;
    let firstPlayerButton = document.createElement("button");
    let firstPlayerName = pastGame.leftTeam[0].name;
    firstPlayerButton.className = "capitalize";
    firstPlayerButton.innerText = firstPlayerName;
    firstPlayerButton.id = firstPlayerName;
    playerNames.push(firstPlayerName);
    firstPlayerButton.onclick = function () { displayPlayerPerformance(firstPlayerName); };
    let secondPlayerButton = document.createElement("button");
    let secondPlayerName = pastGame.leftTeam[1].name;
    secondPlayerButton.className = "capitalize";
    secondPlayerButton.innerText = secondPlayerName;
    secondPlayerButton.id = secondPlayerName;
    playerNames.push(secondPlayerName);
    secondPlayerButton.onclick = function () { displayPlayerPerformance(secondPlayerName); };
    let thirdPlayerButton = document.createElement("button");
    let thirdPlayerName = pastGame.rightTeam[0].name;
    thirdPlayerButton.className = "capitalize";
    thirdPlayerButton.innerText = thirdPlayerName;
    thirdPlayerButton.id = thirdPlayerName;
    playerNames.push(thirdPlayerName);
    thirdPlayerButton.onclick = function () { displayPlayerPerformance(thirdPlayerName); };
    let fourthPlayerButton = document.createElement("button");
    let fourthPlayerName = pastGame.rightTeam[1].name;
    fourthPlayerButton.className = "capitalize";
    fourthPlayerButton.innerText = fourthPlayerName;
    fourthPlayerButton.id = fourthPlayerName;
    playerNames.push(fourthPlayerName);
    fourthPlayerButton.onclick = function () { displayPlayerPerformance(fourthPlayerName); };
    buttonSection.append(frameButton);
    buttonSection.append(firstPlayerButton);
    buttonSection.append(secondPlayerButton);
    buttonSection.append(thirdPlayerButton);
    buttonSection.append(fourthPlayerButton);
};
let getGameFromUrl = function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("gameId")) {
        return getPastGame(parseInt(urlParams.get("gameId")));
    }
    else if (urlParams.has("gameData")) {
        playerGameData = JSON.parse(uncrush(urlParams.get("playerData")), reviver);
        return CornholeGame.fromJson(JSON.parse(uncrush(urlParams.get("gameData")), reviver));
    }
};
let displayFrames = function () {
    let pastFrameSection = document.getElementById("past_frames");
    pastFrameSection.style.display = "block";
    let playerPerformanceSection = document.getElementById("player_performance");
    playerPerformanceSection.style.display = "none";
    for (let playerButtonId of playerNames) {
        document.getElementById(playerButtonId).style.backgroundColor = "buttonface";
    }
    document.getElementById("frame_button").style.backgroundColor = "lightgreen";
};
let displayPlayerPerformance = function (playerName) {
    document.getElementById("frame_button").style.backgroundColor = "buttonface";
    for (let playerButtonId of playerNames) {
        if (playerButtonId === playerName) {
            document.getElementById(playerButtonId).style.backgroundColor = "lightgreen";
        }
        else {
            document.getElementById(playerButtonId).style.backgroundColor = "buttonface";
        }
    }
    let pastFrameSection = document.getElementById("past_frames");
    pastFrameSection.style.display = "none";
    let playerPerformanceSection = document.getElementById("player_performance");
    playerPerformanceSection.style.display = "block";
    let playerFrames;
    if (playerGameData) {
        playerFrames = playerGameData.get(playerName);
    }
    else {
        let playerData = getPlayer(playerName);
        playerFrames = playerData.games.get(pastGame.id);
    }
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
    playerPerformanceSection.append(getSectionLabels());
    let totalPercentPoints = Math.round(((totalHoles + totalBoards) / totalBagsThrown) * 100);
    let totalPercentHoles = Math.round((totalHoles / totalBagsThrown) * 100);
    let totalPercentBoards = Math.round((totalBoards / totalBagsThrown) * 100);
    playerPerformanceSection.append(getNumberSection([totalPercentPoints,
        totalPercentHoles,
        totalPercentBoards], 
    /* includePercentage= */ true));
    playerPerformanceSection.append(document.createElement("hr"));
    playerPerformanceSection.append(createHeader3WithText("Count"));
    playerPerformanceSection.append(getSectionLabels(EXTRA_SECTIONS.THROWN));
    playerPerformanceSection.append(getNumberSection([totalHoles + totalBoards,
        totalHoles,
        totalBoards,
        totalBagsThrown], false));
    playerPerformanceSection.append(document.createElement("hr"));
    playerPerformanceSection.append(createHeader3WithText("Score"));
    playerPerformanceSection.append(getSectionLabels(EXTRA_SECTIONS.AVERAGE_PER_FRAME));
    playerPerformanceSection.append(getNumberSection([
        (totalHoles * 3) + totalBoards,
        ((totalHoles * 3) + totalBoards) / playerFrames.length,
        totalHoles * 3,
        totalBoards
    ], false));
    playerPerformanceSection.append(document.createElement("hr"));
    playerPerformanceSection.append(document.createElement("hr"));
};
var EXTRA_SECTIONS;
(function (EXTRA_SECTIONS) {
    // THROWN will be included as the last label
    EXTRA_SECTIONS[EXTRA_SECTIONS["THROWN"] = 0] = "THROWN";
    // AVERAGE PER FRAME is included as the second label
    EXTRA_SECTIONS[EXTRA_SECTIONS["AVERAGE_PER_FRAME"] = 1] = "AVERAGE_PER_FRAME";
})(EXTRA_SECTIONS || (EXTRA_SECTIONS = {}));
let getSectionLabels = function (...extraSections) {
    let sectionLabels = document.createElement("section");
    sectionLabels.className = "horizontal_spacing";
    sectionLabels.append(createDivWithText("Total", /* bold= */ false));
    if (extraSections.includes(EXTRA_SECTIONS.AVERAGE_PER_FRAME)) {
        sectionLabels.append(createDivWithText("Avg/Frame", /* bold= */ false));
    }
    sectionLabels.append(createDivWithText("Holes", /* bold= */ false));
    sectionLabels.append(createDivWithText("Boards", /* bold= */ false));
    if (extraSections.includes(EXTRA_SECTIONS.THROWN)) {
        sectionLabels.append(createDivWithText("Thrown", /* bold= */ false));
    }
    return sectionLabels;
};
let getNumberSection = function (numbers, includePercentage) {
    let numberSection = document.createElement("section");
    numberSection.className = "horizontal_spacing";
    for (let number of numbers) {
        let display = createDivWithText((Math.round((number + Number.EPSILON) * 100) / 100).toString() + (includePercentage ? "%" : ""), 
        /* bold= */ true);
        numberSection.append(display);
    }
    return numberSection;
};
//# sourceMappingURL=historical_game_display.js.map