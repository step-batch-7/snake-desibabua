class Score {
  constructor(initialScore) {
    this.score = initialScore;
  }

  updateScore(increment) {
    this.score += increment;
  }

  get currentScore() {
    return this.score;
  }
}