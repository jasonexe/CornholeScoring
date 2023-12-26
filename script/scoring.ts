enum TeamSide {
    LEFT,
    RIGHT,
}

class Score {
    // Total score after subtraction
    leftCalculatedScore: number = 0;
    // Raw score
    leftRawScore: number = 0;
    // Total score after subtraction
    rightCalculatedScore: number = 0;
    // Raw score
    rightRawScore: number = 0;

    appendScore(partialScore: Score): Score {
        this.leftCalculatedScore += partialScore.leftCalculatedScore;
        this.rightCalculatedScore += partialScore.rightCalculatedScore;
        this.leftRawScore += partialScore.leftRawScore;
        this.rightRawScore += partialScore.rightRawScore;
        return this;
    }

    removeScore(partialScore: Score): Score {
        this.leftCalculatedScore -= partialScore.leftCalculatedScore;
        this.rightCalculatedScore -= partialScore.rightCalculatedScore;
        this.leftRawScore -= partialScore.leftRawScore;
        this.rightRawScore -= partialScore.rightRawScore;
        return this;
    }

    static fromJson(jsonScore: Score) {
        let funcScore = new Score();
        if (jsonScore.leftCalculatedScore) {
            funcScore.leftCalculatedScore = jsonScore.leftCalculatedScore;
        }
        if (jsonScore.leftRawScore) {
            funcScore.leftRawScore = jsonScore.leftRawScore;
        }
        if (jsonScore.rightCalculatedScore) {
            funcScore.rightCalculatedScore = jsonScore.rightCalculatedScore;
        }
        if (jsonScore.rightRawScore) {
            funcScore.rightRawScore = jsonScore.rightRawScore;
        }
        return funcScore;
    }
}

// The status of a bag in a given frame, in = 3 points, on = 1 point. Don't store off explicitly
enum BagStatus {
    IN = 3,
    ON = 1,
}

class CornholeFrame {
    // How far into the game is this frame
    frameSequence: number;
    // Playing for the team displayed on the left
    leftScore = new Array<BagStatus>();
    // Playing for the team displayed on the right
    rightScore = new Array<BagStatus>();
    // Number of bags per player per frame. This way we don't need to explicitly record every bag.
    bagsPossible: number;

    constructor(frameSequence: number, bagsPossible: number) {
        this.frameSequence = frameSequence;
        this.bagsPossible = bagsPossible;
    }

    static fromJson(jsonFrame: CornholeFrame) {
        let fullFrame = new CornholeFrame(jsonFrame.frameSequence, jsonFrame.bagsPossible);
        if (jsonFrame.leftScore) {
            fullFrame.leftScore = jsonFrame.leftScore;
        }
        if (jsonFrame.rightScore) {
            fullFrame.rightScore = jsonFrame.rightScore;
        }
        return fullFrame;
    }

    addBagResult(teamSide: TeamSide, bagStatus: BagStatus) {
        if (teamSide === TeamSide.LEFT) {
            // Don't increment if we've already reached the highest possible bag number
            if (this.leftScore.length >= this.bagsPossible) {
                return;
            }
            this.leftScore.push(bagStatus);
        } else {
            if (this.rightScore.length >= this.bagsPossible) {
                return;
            }
            this.rightScore.push(bagStatus);
        }
    }

    removeBagResult(teamSide: TeamSide, bagStatus: BagStatus) {
        if (teamSide === TeamSide.LEFT) {
            let indexOfBag = this.leftScore.findIndex((arrayStatus) => { return arrayStatus === bagStatus });
            if (indexOfBag !== -1) {
                this.leftScore.splice(indexOfBag, 1);
            }
        }
        if (teamSide === TeamSide.RIGHT) {
            let indexOfBag = this.rightScore.findIndex((arrayStatus) => { return arrayStatus === bagStatus });
            if (indexOfBag !== -1) {
                this.rightScore.splice(indexOfBag, 1);
            }
        }
    }

    getFrameScore(): Score {
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
        } else {
            // Even if they are exactly equal, calculated score just ends up as 0
            score.rightCalculatedScore = rightTotal - leftTotal;
        }

        return score;
    }
}

// Statistics about the game constructed from an array of IndividualFrames
class GameStatsForPlayer {
    playerName: string;
    gameTime: EpochTimeStamp;
    // Just store all possible interesting stats here
    cornholes: number = 0;
    totalFrames: number = 0;
    holePercentage: number = 0;
    boardPercentage: number = 0;
    averagePerFrame: number = 0;
    // If they got all cornholes, this is 100%
    potentialPointPercentage: number = 0;
    // Average of this player - average of their opponent
    comparedToOpponent: number = 0;
    playerWon: boolean = false;

    constructor(game: CornholeGame, playerName: string) {
        // Calculate all the statistics from the game for the given player
        this.gameTime = game.id
        this.playerName = playerName;
        let teamSide: TeamSide;
        let playerOrder = game.leftTeam.findIndex((player) => player.name === playerName); // Set to 0 or 1, depending if they went 1st or second for their team.
        if (playerOrder >= 0) {
            teamSide = TeamSide.LEFT;
            this.playerWon = game.currentScore.leftCalculatedScore >= 21;
        } else {
            playerOrder = game.rightTeam.findIndex((player) => player.name === playerName)
            teamSide = TeamSide.RIGHT;
            this.playerWon = game.currentScore.rightCalculatedScore >= 21;
        }
        let mainPlayerSummary = this.getSummary(game.pastFrames, teamSide, playerOrder);
        this.holePercentage = mainPlayerSummary.getHolePercentage();
        this.boardPercentage = mainPlayerSummary.getBoardPercentage();
        this.potentialPointPercentage = mainPlayerSummary.getPotentialPointPercentage();
        this.totalFrames = mainPlayerSummary.getTotalThrown() / 4;

        let averageScorePerFrame = ((mainPlayerSummary.numHoles * 3 + mainPlayerSummary.numBoards) / (mainPlayerSummary.numFrames));
        this.averagePerFrame = (Math.round((averageScorePerFrame + Number.EPSILON) * 100) / 100);
    }

    getSummary(frames: CornholeFrame[], teamSide: TeamSide, playerOrder: number): GameSummary {
        let summary = new GameSummary();
        frames = frames.filter((element, index) => {
            return index % 2 === playerOrder;
        })
        for (let frame of frames) {
            summary.incrementNumFrames();
            let numHoles = 0;
            switch (teamSide) {
                case TeamSide.LEFT:
                    for (let bagStatus of frame.leftScore) {
                        summary.incrementStatus(bagStatus);
                        if (bagStatus === BagStatus.IN) {
                            numHoles += 1;
                        }
                    }
                    break;
                case TeamSide.RIGHT:
                    for (let bagStatus of frame.leftScore) {
                        summary.incrementStatus(bagStatus);
                        if (bagStatus === BagStatus.IN) {
                            numHoles += 1;
                        }
                    }
                    break;
            }
            if (numHoles === 4) {
                this.cornholes += 1;
            }
        }
        return summary;
    }
}

class GameSummary {
    numBoards: number = 0;
    numHoles: number = 0;
    numFrames: number = 0;

    getTotalThrown() {
        return this.numBoards + this.numHoles + this.getNumMisses();
    }

    getNumMisses() {
        return this.numFrames * 4 - (this.numBoards + this.numHoles)
    }

    getBoardPercentage() {
        return Math.round(((this.numBoards) / (this.getTotalThrown())) * 100);
    }

    getHolePercentage() {
        return Math.round(((this.numHoles) / (this.getTotalThrown())) * 100);
    }

    getPotentialPointPercentage() {
        return Math.round(((this.numHoles * 3 + this.numBoards) / (this.getTotalThrown() * 3)) * 100)
    }

    incrementNumFrames() {
        this.numFrames += 1;
    }

    incrementStatus(bagStatus: BagStatus) {
        switch (bagStatus) {
            case BagStatus.IN:
                this.numHoles += 1;
                break;
            case BagStatus.ON:
                this.numBoards += 1;
                break;
        }
    }
}

// Frame for keeping stats for an individual
class IndividualFrame {
    // How far into the game is this frame
    frameSequence: number;
    // Playing for the team displayed on the left
    score = new Array<BagStatus>();
    // Number of bags per player per frame. This way we don't need to explicitly record every bag.
    bagsPossible: number;
    constructor(teamFrame: CornholeFrame, playerSide: TeamSide) {
        this.frameSequence = teamFrame.frameSequence;
        this.score = playerSide === TeamSide.LEFT ? teamFrame.leftScore : teamFrame.rightScore;
        this.bagsPossible = teamFrame.bagsPossible;
    }
}