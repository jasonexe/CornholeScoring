// Sets up any storage if it hasn't been initialized yet
let setupGamePage = function () {
    if (getCurrentGame()) {
        // If there was already a game loaded, go straight to the game page.
        displayGameProgress(getCurrentGame().pastFrames.length);
    }
    updatePlayerSelectionList(/* initialize= */ true);
}

const swapTeamOnePlayers = function () {
    let playerOneIndex = (<HTMLSelectElement>document.getElementById("team_one_player_one")).selectedIndex;
    let playerTwoIndex = (<HTMLSelectElement>document.getElementById("team_one_player_two")).selectedIndex;

    (<HTMLSelectElement>document.getElementById("team_one_player_one")).selectedIndex = playerTwoIndex;
    (<HTMLSelectElement>document.getElementById("team_one_player_two")).selectedIndex = playerOneIndex;
}

const swapTeamTwoPlayers = function () {
    let playerOneIndex = (<HTMLSelectElement>document.getElementById("team_two_player_one")).selectedIndex;
    let playerTwoIndex = (<HTMLSelectElement>document.getElementById("team_two_player_two")).selectedIndex;

    (<HTMLSelectElement>document.getElementById("team_two_player_one")).selectedIndex = playerTwoIndex;
    (<HTMLSelectElement>document.getElementById("team_two_player_two")).selectedIndex = playerOneIndex;
}

// Updates the dropdowns on screen 2, where the user selects which players are in the game.
// Set initialize to true if you want to pre-set the selectors to whatever the previous game was. If initialize is false, then the
// selector options will update without changing the current selection.
const updatePlayerSelectionList = async function (initialize: boolean) {
    let allPlayers: Map<string, CornholePlayer> = await getPlayers();
    let mostRecentGame;
    if ((await getPastGames()).size > 0 && initialize) {
        mostRecentGame = [...(await getPastGames()).entries()].reduce(
            (firstElement, secondElement) => secondElement[0] > firstElement[0] ? secondElement : firstElement);
    } else if (!initialize) {
        // Only do this if the page is not being initialized - if this is called when initialize is true (IE: getPastGames() is null) then
        // we get an error because there's no selected option
        // "mostRecentGame" is a fake game, with players whose names are currently in the selectors
        let teamOnePlayerOne = (<HTMLSelectElement>document.getElementById("team_one_player_one")).selectedOptions[0].value;
        let teamOnePlayerTwo = (<HTMLSelectElement>document.getElementById("team_one_player_two")).selectedOptions[0].value;
        let teamTwoPlayerOne = (<HTMLSelectElement>document.getElementById("team_two_player_one")).selectedOptions[0].value;
        let teamTwoPlayerTwo = (<HTMLSelectElement>document.getElementById("team_two_player_two")).selectedOptions[0].value;
        let fakeGame = new CornholeGame(
            0,
            4,
            [   new CornholePlayer(teamOnePlayerOne, false),
                new CornholePlayer(teamOnePlayerTwo, false)
            ],
            [   new CornholePlayer(teamTwoPlayerOne, false),
                new CornholePlayer(teamTwoPlayerTwo, false)
            ],
            /* registerGame= */ false
        );
        mostRecentGame = [0, fakeGame];
    }

    var sortedPlayers = new Map([...allPlayers.entries()].sort((player1, player2) => {
        // If one is favorite and the other is not, then favorite is higher
        if(player1[1].favorite && !player2[1].favorite) {
            return -1;
        } else if (!player1[1].favorite && player2[1].favorite) {
            return 1;
        }
        // If either both are or are not favorite, then just straight compare the name
        return player1[0] > player2[0] ? 1 : -1;
    }));
    let playerSelectors = Array.from(document.getElementsByClassName("player_options"));
    for (let selectorIndexString in playerSelectors) {
        let selectorIndex = parseInt(selectorIndexString);
        let castSelector = <HTMLSelectElement>playerSelectors[selectorIndex];
        castSelector.innerHTML = "";
        let playerNum = 0;
        for (let playerData of sortedPlayers) {
            if (playerData[1].archived) {
                continue;
            }
            let option = new Option(playerData[0], playerData[0]);
            option.textContent = playerData[0];
            castSelector.add(option);
            if (mostRecentGame) {
                // Assume we have at most 4 selectors
                switch (selectorIndex) {
                    case 0:
                        if (playerData[0] === mostRecentGame[1].leftTeam[0].name) {
                            castSelector.selectedIndex = playerNum;
                        }
                        break;
                    case 1:
                        if (playerData[0] === mostRecentGame[1].leftTeam[1].name) {
                            castSelector.selectedIndex = playerNum;
                        }
                        break;
                    case 2:
                        if (playerData[0] === mostRecentGame[1].rightTeam[0].name) {
                            castSelector.selectedIndex = playerNum;
                        }
                        break;
                    case 3:
                        if (playerData[0] === mostRecentGame[1].rightTeam[1].name) {
                            castSelector.selectedIndex = playerNum;
                        }
                        break;
                    default:
                        // no op, nothing we can do
                        break;
                }
            }
            playerNum += 1;
        }
        if (!mostRecentGame) {
            castSelector.selectedIndex = selectorIndex;
        }
    }

    let removalPlayerSelector = <HTMLSelectElement>document.getElementById("player_to_remove");
    removalPlayerSelector.innerHTML = "";
    for (let playerData of sortedPlayers) {
        if (playerData[1].archived) {
            continue;
        }
        let option = new Option(playerData[0], playerData[0]);
        option.textContent = playerData[0];
        removalPlayerSelector.add(option);
    }
}

let displayGameProgress = function (frameNumber: number) {
    let addPlayerScreen = document.getElementById("add_players");
    let gameProgressScreen = document.getElementById("game_screen");
    addPlayerScreen.style.display = "none";
    gameProgressScreen.style.display = "block";

    let currentGame = getCurrentGame();
    let teamOneSelector = <HTMLSelectElement>document.getElementById("team_one_players");
    teamOneSelector.innerHTML = "";
    teamOneSelector.add(new Option(currentGame.leftTeam[0].name, currentGame.leftTeam[0].name));
    teamOneSelector.add(new Option(currentGame.leftTeam[1].name, currentGame.leftTeam[1].name));
    teamOneSelector.querySelectorAll('option')[(frameNumber) % 2].selected = true
    let teamTwoSelector = <HTMLSelectElement>document.getElementById("team_two_players");
    teamTwoSelector.innerHTML = "";
    teamTwoSelector.add(new Option(currentGame.rightTeam[0].name, currentGame.rightTeam[0].name));
    teamTwoSelector.add(new Option(currentGame.rightTeam[1].name, currentGame.rightTeam[1].name));
    teamTwoSelector.querySelectorAll('option')[(frameNumber) % 2].selected = true
    let frameNumberDisplay = document.getElementById("frame_number");
    frameNumberDisplay.innerText = frameNumber.toString();
    updateScoreDisplay(currentGame);
    updatePastFrames(currentGame);
}

let updateFrameAndCurrentScoreDisplay = function (frameScore: Score, gameScore: Score) {
    let leftFrameScoreDisplay = document.getElementById("left_frame_score");
    let rightFrameScoreDisplay = document.getElementById("right_frame_score");
    let leftGameScoreDisplay = document.getElementById("left_current_score");
    let rightGameScoreDisplay = document.getElementById("right_current_score");

    leftFrameScoreDisplay.innerText = frameScore.leftCalculatedScore.toString();
    rightFrameScoreDisplay.innerText = frameScore.rightCalculatedScore.toString();

    leftGameScoreDisplay.innerText = gameScore.leftCalculatedScore.toString();
    rightGameScoreDisplay.innerText = gameScore.rightCalculatedScore.toString();
}

let updatePastFrames = function (game: CornholeGame) {
    let frameNumberDisplay = document.getElementById("frame_number");
    frameNumberDisplay.innerText = game.currentFrame.frameSequence.toString();
    let pastFrameSection = document.getElementById("past_frames");
    pastFrameSection.innerHTML = "";
    pastFrameSection.style.display = "block";
    let frameScoreObject = new Score();
    for (let pastFrameIndex in game.pastFrames) {
        let pastFrame = game.pastFrames[pastFrameIndex];
        frameScoreObject = frameScoreObject.appendScore(pastFrame.getFrameScore());
        pastFrameSection.prepend(createPastHoleInsertionsDisplay(pastFrame));
        pastFrameSection.prepend(createPastBoardShotsDisplay(pastFrame));
        pastFrameSection.prepend(createPastFrameScoreDisplay(pastFrame.getFrameScore()));
        pastFrameSection.prepend(createPastTotalScoreDisplay(frameScoreObject));
        pastFrameSection.prepend(createPlayerDisplay(game, parseInt(pastFrameIndex)));
        pastFrameSection.prepend(document.createElement("hr"));
    }
    let pastFrameHeader = document.createElement("h1");
    pastFrameHeader.innerText = "Past Frames";
    pastFrameSection.prepend(pastFrameHeader);
}

let createPastHoleInsertionsDisplay = function (frame: CornholeFrame): HTMLDivElement {
    let totalScoreDiv = document.createElement("div");
    totalScoreDiv.className = "horizontal_spacing";
    let leftHoles = 0;
    let rightHoles = 0;
    for (let bagStatus of frame.leftScore) {
        if (bagStatus === BagStatus.IN) {
            leftHoles += 1;
        }
    }
    for (let bagStatus of frame.rightScore) {
        if (bagStatus === BagStatus.IN) {
            rightHoles += 1;
        }
    }
    totalScoreDiv.appendChild(createHeader3WithText(leftHoles.toString()));
    totalScoreDiv.appendChild(createDividerElement());
    totalScoreDiv.appendChild(createHeader3WithText("Holes"));
    totalScoreDiv.appendChild(createDividerElement());
    totalScoreDiv.appendChild(createHeader3WithText(rightHoles.toString()));
    return totalScoreDiv;
}

let createPastBoardShotsDisplay = function (frame: CornholeFrame): HTMLDivElement {
    let totalScoreDiv = document.createElement("div");
    totalScoreDiv.className = "horizontal_spacing";
    let leftBoards = 0;
    let rightBoards = 0;
    for (let bagStatus of frame.leftScore) {
        if (bagStatus === BagStatus.ON) {
            leftBoards += 1;
        }
    }
    for (let bagStatus of frame.rightScore) {
        if (bagStatus === BagStatus.ON) {
            rightBoards += 1;
        }
    }
    totalScoreDiv.appendChild(createHeader3WithText(leftBoards.toString()));
    totalScoreDiv.appendChild(createDividerElement());
    totalScoreDiv.appendChild(createHeader3WithText("Boards"));
    totalScoreDiv.appendChild(createDividerElement());
    totalScoreDiv.appendChild(createHeader3WithText(rightBoards.toString()));
    return totalScoreDiv;
}

let createPlayerDisplay = function (game: CornholeGame, frameNumber: number) {
    let playerDisplayDiv = document.createElement("div");
    playerDisplayDiv.className = "horizontal_spacing";
    let leftNameDisplay = createHeader3WithText(game.leftTeam[frameNumber % 2].name);
    leftNameDisplay.className = "capitalize";
    playerDisplayDiv.appendChild(leftNameDisplay);
    playerDisplayDiv.appendChild(createDividerElement());
    playerDisplayDiv.appendChild(createHeader3WithText("Player"));
    playerDisplayDiv.appendChild(createDividerElement());
    let rightNameDisplay = createHeader3WithText(game.rightTeam[frameNumber % 2].name);
    rightNameDisplay.className = "capitalize";
    playerDisplayDiv.appendChild(rightNameDisplay);
    return playerDisplayDiv;
}

let createPastTotalScoreDisplay = function (totalScoreObject: Score): HTMLDivElement {
    let totalScoreDiv = document.createElement("div");
    totalScoreDiv.className = "horizontal_spacing";
    totalScoreDiv.appendChild(createHeader3WithText(totalScoreObject.leftCalculatedScore.toString()));
    totalScoreDiv.appendChild(createDividerElement());
    totalScoreDiv.appendChild(createHeader3WithText("Total Score"));
    totalScoreDiv.appendChild(createDividerElement());
    totalScoreDiv.appendChild(createHeader3WithText(totalScoreObject.rightCalculatedScore.toString()));
    return totalScoreDiv;
}

let createPastFrameScoreDisplay = function (frameScoreObject: Score): HTMLDivElement {
    let frameScoreDiv = document.createElement("div");
    frameScoreDiv.className = "horizontal_spacing";
    frameScoreDiv.appendChild(createHeader3WithText(frameScoreObject.leftCalculatedScore.toString()));
    frameScoreDiv.appendChild(createDividerElement());
    frameScoreDiv.appendChild(createHeader3WithText("Frame Score"));
    frameScoreDiv.appendChild(createDividerElement());
    frameScoreDiv.appendChild(createHeader3WithText(frameScoreObject.rightCalculatedScore.toString()));
    return frameScoreDiv;
}

let createDividerElement = function (): HTMLSpanElement {
    let divider = document.createElement("span");
    divider.className = "divider";
    return divider;
}

let createHeader3WithText = function (text: string) {
    let headerElement = document.createElement("h3");
    headerElement.innerText = text;
    return headerElement;
}

let createDivWithText = function (text: string, bold: boolean) {
    let divElement = document.createElement("div");
    divElement.innerHTML = text;
    if (bold) {
        divElement.className = "bold";
    }
    return divElement;
}

// If bold = true, creates a <th> instead of <td>
let createTableDataWithText = function (text: string, bold: boolean) {
    let elementType = bold ? "th" : "td";
    let columnElement = document.createElement(elementType);
    columnElement.innerHTML = text;
    return columnElement;
}

let createCapitalizedDivWithText = function (text: string, bold: boolean) {
    let divElement = document.createElement("div");
    divElement.innerText = text;
    if (bold) {
        divElement.className = "bold";
    }
    divElement.classList.add("capitalize");
    return divElement;
}

// Always switches to the unselected one, regardless of what frame we're on
let updateCurrentThrower = function () {
    let teamOneSelector = <HTMLSelectElement>document.getElementById("team_one_players");
    let teamTwoSelector = <HTMLSelectElement>document.getElementById("team_two_players");
    teamOneSelector.querySelectorAll('option')[(teamOneSelector.selectedIndex + 1) % 2].selected = true
    teamTwoSelector.querySelectorAll('option')[(teamTwoSelector.selectedIndex + 1) % 2].selected = true
}

let updatePlayerBagStatusDisplay = function (currentFrame: CornholeFrame) {
    // Left player hole
    let leftPlayerHoleCount = document.getElementById("number_in_left_hole");
    let increment = 0;
    for (let bagStatus of currentFrame.leftScore) {
        if (bagStatus === BagStatus.IN) {
            increment += 1;
        }
    }
    leftPlayerHoleCount.innerHTML = increment.toString();
    // Left player board
    let leftPlayerboardCount = document.getElementById("number_in_left_board");
    increment = 0;
    for (let bagStatus of currentFrame.leftScore) {
        if (bagStatus === BagStatus.ON) {
            increment += 1;
        }
    }
    leftPlayerboardCount.innerHTML = increment.toString();
    // Right player hole
    let rightPlayerHoleCount = document.getElementById("number_in_right_hole");
    increment = 0;
    for (let bagStatus of currentFrame.rightScore) {
        if (bagStatus === BagStatus.IN) {
            increment += 1;
        }
    }
    rightPlayerHoleCount.innerHTML = increment.toString();
    // Right player board
    let rightPlayerboardCount = document.getElementById("number_in_right_board");
    increment = 0;
    for (let bagStatus of currentFrame.rightScore) {
        if (bagStatus === BagStatus.ON) {
            increment += 1;
        }
    }
    rightPlayerboardCount.innerHTML = increment.toString();
}
