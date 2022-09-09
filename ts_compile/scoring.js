var TeamSide;
(function (TeamSide) {
    TeamSide[TeamSide["LEFT"] = 0] = "LEFT";
    TeamSide[TeamSide["RIGHT"] = 1] = "RIGHT";
})(TeamSide || (TeamSide = {}));
class CornholeGame {
    constructor(numberOfBags, leftTeam, rightTeam) {
        this.id = Date.now();
        this.pastFrames = new Array();
        this.currentScore = new Score();
        this.leftTeam = leftTeam;
        this.rightTeam = rightTeam;
        this.numberOfBags = numberOfBags;
        this.currentFrame = new CornholeFrame(0, numberOfBags);
    }
    submitFrame() {
        this.pastFrames.push(this.currentFrame);
        this.currentScore.appendScore(this.currentFrame.getFrameScore());
        let playerTurn = this.pastFrames.length % 2;
        this.leftTeam[playerTurn].games[this.id].push(new IndividualFrame(this.currentFrame, TeamSide.LEFT));
        this.rightTeam[playerTurn].games[this.id].push(new IndividualFrame(this.currentFrame, TeamSide.RIGHT));
        this.currentFrame = new CornholeFrame(this.pastFrames.length, this.numberOfBags);
    }
}
class Score {
    constructor() {
        // Total score after subtraction
        this.leftCalculatedScore = 0;
        // Raw score
        this.leftRawScore = 0;
        // Total score after subtraction
        this.rightCalculatedScore = 0;
        // Raw score
        this.rightRawScore = 0;
    }
    appendScore(partialScore) {
        this.leftCalculatedScore += partialScore.leftCalculatedScore;
        this.rightCalculatedScore += partialScore.rightCalculatedScore;
        this.leftRawScore += partialScore.leftRawScore;
        this.rightRawScore += partialScore.rightRawScore;
    }
}
class CornholePlayer {
    constructor(name) {
        this.games = new Map();
        this.name = name;
    }
    registerGame(gameId) {
        this.games[gameId] = new Array();
    }
    getGameStats(gameId) {
        return new GameStats();
    }
}
// The status of a bag in a given frame, in = 3 points, on = 1 point. Don't store off explicitly
var BagStatus;
(function (BagStatus) {
    BagStatus[BagStatus["IN"] = 3] = "IN";
    BagStatus[BagStatus["ON"] = 1] = "ON";
})(BagStatus || (BagStatus = {}));
class CornholeFrame {
    constructor(frameSequence, bagsPossible) {
        // Playing for the team displayed on the left
        this.leftScore = new Array();
        // Playing for the team displayed on the right
        this.rightScore = new Array();
        this.frameSequence = frameSequence;
        this.bagsPossible = bagsPossible;
    }
    addBagResult(teamSide, bagStatus) {
        if (teamSide === TeamSide.LEFT) {
            // Don't increment if we've already reached the highest possible bag number
            if (this.leftScore.length > this.bagsPossible) {
                return;
            }
            this.leftScore.push(bagStatus);
        }
        else {
            if (this.rightScore.length > this.bagsPossible) {
                return;
            }
            this.rightScore.push(bagStatus);
        }
    }
    removeBagResult(teamSide, bagStatus) {
        if (teamSide === TeamSide.LEFT) {
            let indexOfBag = this.leftScore.findIndex((bagStatus) => { return bagStatus; });
            if (indexOfBag !== -1) {
                this.leftScore.splice(indexOfBag, 1);
            }
        }
        if (teamSide === TeamSide.RIGHT) {
            let indexOfBag = this.rightScore.findIndex((bagStatus) => { return bagStatus; });
            if (indexOfBag !== -1) {
                this.rightScore.splice(indexOfBag, 1);
            }
        }
    }
    getFrameScore() {
        let score = new Score();
        let leftTotal = 0;
        let rightTotal = 0;
        for (let bagStatus of this.leftScore) {
            leftTotal += bagStatus.valueOf();
        }
        for (let bagStatus of this.rightScore) {
            rightTotal += bagStatus.valueOf();
        }
        score.leftRawScore = leftTotal;
        score.rightRawScore = rightTotal;
        if (leftTotal > rightTotal) {
            score.leftCalculatedScore = leftTotal - rightTotal;
        }
        else {
            // Even if they are exactly equal, calculated score just ends up as 0
            score.rightCalculatedScore = rightTotal - leftTotal;
        }
        return score;
    }
}
// Statistics about the game constructed from an array of IndividualFrames
class GameStats {
}
// Frame for keeping stats for an individual
class IndividualFrame {
    constructor(teamFrame, playerSide) {
        // Playing for the team displayed on the left
        this.score = new Array();
        this.frameSequence = teamFrame.frameSequence;
        this.score = playerSide === TeamSide.LEFT ? teamFrame.leftScore : teamFrame.rightScore;
        this.bagsPossible = teamFrame.bagsPossible;
    }
}
//# sourceMappingURL=scoring.js.map