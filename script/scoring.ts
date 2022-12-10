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
class GameStats {

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