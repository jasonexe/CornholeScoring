let displayGameProgress = function(frameNumber: number) {
    let startGameScreen = document.getElementById("start_game");
    let addPlayerScreen = document.getElementById("add_players");
    let gameProgressScreen = document.getElementById("game_screen");
    startGameScreen.style.display = "none";
    addPlayerScreen.style.display = "none";
    gameProgressScreen.style.display = "block";

    let currentGame = getCurrentGame();
    let teamOneSelector = <HTMLSelectElement> document.getElementById("team_one_players");
    teamOneSelector.innerHTML = "";
    teamOneSelector.add(new Option(currentGame.leftTeam[0].name, currentGame.leftTeam[0].name));
    teamOneSelector.add(new Option(currentGame.leftTeam[1].name, currentGame.leftTeam[1].name));
    teamOneSelector.querySelectorAll('option')[(frameNumber) % 2].selected = true
    let teamTwoSelector = <HTMLSelectElement> document.getElementById("team_two_players");
    teamTwoSelector.innerHTML = "";
    teamTwoSelector.add(new Option(currentGame.rightTeam[0].name, currentGame.rightTeam[0].name));
    teamTwoSelector.add(new Option(currentGame.rightTeam[1].name, currentGame.rightTeam[1].name));
    teamTwoSelector.querySelectorAll('option')[(frameNumber) % 2].selected = true
    updateScoreDisplay();
}

let updateFrameAndCurrentScoreDisplay = function(frameScore: Score, gameScore: Score) {
    let leftFrameScoreDisplay = document.getElementById("left_frame_score");
    let rightFrameScoreDisplay = document.getElementById("right_frame_score");
    let leftGameScoreDisplay = document.getElementById("left_current_score");
    let rightGameScoreDisplay = document.getElementById("right_current_score");

    leftFrameScoreDisplay.innerText = frameScore.leftCalculatedScore.toString();
    rightFrameScoreDisplay.innerText = frameScore.rightCalculatedScore.toString();

    leftGameScoreDisplay.innerText = gameScore.leftCalculatedScore.toString();
    rightGameScoreDisplay.innerText = gameScore.rightCalculatedScore.toString();
}

// Always switches to the unselected one, regardless of what frame we're on
let updateCurrentThrower = function() {
    let teamOneSelector = <HTMLSelectElement> document.getElementById("team_one_players");
    let teamTwoSelector = <HTMLSelectElement> document.getElementById("team_two_players");
    teamOneSelector.querySelectorAll('option')[(teamOneSelector.selectedIndex + 1) % 2].selected = true
    teamTwoSelector.querySelectorAll('option')[(teamTwoSelector.selectedIndex + 1) % 2].selected = true
}

let updatePlayerBagStatusDisplay = function(currentFrame: CornholeFrame) {
    // Left player hole
    let leftPlayerHoleCount = document.getElementById("number_in_left_hole");
    let increment = 0;
    for(let bagStatus of currentFrame.leftScore) {
        if (bagStatus === BagStatus.IN) {
            increment += 1;
        }
    }
    leftPlayerHoleCount.innerHTML = increment.toString();
    // Left player board
    let leftPlayerboardCount = document.getElementById("number_in_left_board");
    increment = 0;
    for(let bagStatus of currentFrame.leftScore) {
        if (bagStatus === BagStatus.ON) {
            increment += 1;
        }
    }
    leftPlayerboardCount.innerHTML = increment.toString();
    // Right player hole
    let rightPlayerHoleCount = document.getElementById("number_in_right_hole");
    increment = 0;
    for(let bagStatus of currentFrame.rightScore) {
        if (bagStatus === BagStatus.IN) {
            increment += 1;
        }
    }
    rightPlayerHoleCount.innerHTML = increment.toString();
    // Right player board
    let rightPlayerboardCount = document.getElementById("number_in_right_board");
    increment = 0;
    for(let bagStatus of currentFrame.rightScore) {
        if (bagStatus === BagStatus.ON) {
            increment += 1;
        }
    }
    rightPlayerboardCount.innerHTML = increment.toString();
}