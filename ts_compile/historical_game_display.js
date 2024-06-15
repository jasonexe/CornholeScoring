var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const SHARING_ID_SEPARATOR = "_";
// This method might be more appropriate in a new file, but I'm lazy
// so just going to put it here. It initializes history.html. All the other
// methods in this file manage game_summary.html
let displayPastGamesSummary = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let mainSection = document.getElementById("past_game_summaries");
        mainSection.innerText = "";
        for (let pastGame of yield getPastGames()) {
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
    });
};
// Stored as a global variable so we don't need to keep getting it
let pastGame;
let playerNames = new Array();
// If we're using URL data, this is populated instead of pulling the player from storage.
let playerGameData;
let displayGameInUrl = function () {
    return __awaiter(this, void 0, void 0, function* () {
        pastGame = yield getGameFromUrl();
        updatePastFrames(pastGame);
        document.getElementById("game_time").innerText = new Date(pastGame.id).toLocaleString();
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
    });
};
let getGameFromUrl = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("gameId")) {
            return yield getGamePromise(parseInt(urlParams.get("gameId")));
        }
        else if (urlParams.has("gameData")) {
            playerGameData = JSON.parse(uncrush(urlParams.get("playerData")), reviver);
            return CornholeGame.fromJson(JSON.parse(uncrush(urlParams.get("gameData")), reviver), false);
        }
        else if (urlParams.has("storedGameId")) {
            // set playerGameData
            return yield getGamePromise(parseInt(urlParams.get("storedGameId").split(SHARING_ID_SEPARATOR)[0]));
        }
    });
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
    return __awaiter(this, void 0, void 0, function* () {
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
            let playerData = yield getPlayerPromise(playerName);
            playerFrames = playerData.games.get(pastGame.id);
        }
        let totalBagsThrown = 0;
        let totalHoles = 0;
        let totalBoards = 0;
        for (let frame of playerFrames) {
            totalBagsThrown += frame.bagsPossible;
            // When pulling from firebase, score might not be present if no bags were thrown in.
            if (!frame.score) {
                continue;
            }
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
        Math.round(((totalHoles * 3 + totalBoards) / (totalBagsThrown * 3)) * 100);
        let totalPercentPoints = Math.round(((totalHoles * 3 + totalBoards) / (totalBagsThrown * 3)) * 100);
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
    });
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
// Import the functions you need from the SDKs you need
// // @ts-ignore Import module
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
// // @ts-ignore Import module
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
// // @ts-ignore Import module
// import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBTnRlaSGfP9Hzk0YhfdwDRmaNSzfrmDy0",
//   authDomain: "scorehole.firebaseapp.com",
//   projectId: "scorehole",
//   storageBucket: "scorehole.appspot.com",
//   messagingSenderId: "30214043784",
//   appId: "1:30214043784:web:f081b1e00f626e469e873d",
//   measurementId: "G-C6Y8B7WYG8",
//   databaseURL: "https://scorehole-default-rtdb.firebaseio.com",
// };
// let test = function() {
//     const app = initializeApp(firebaseConfig);
//     const analytics = getAnalytics(app);
//     const database = getDatabase(app);
// }
//# sourceMappingURL=historical_game_display.js.map