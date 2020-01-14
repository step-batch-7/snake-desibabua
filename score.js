class Score {
  constructor(initialScore) {
    this.score = initialScore;
  }

  updateScore(food) {
    if (food.kind == "specialFood") {
      this.score += 5
    }
    this.score += 5;
  }

  get currentScore() {
    return this.score;
  }
}