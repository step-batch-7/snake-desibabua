const getRandom = (limit) => Math.round(Math.random() * limit)

class Game {
  constructor(snake, ghostSnake, food, initialScore) {
    this.snake = snake;
    this.ghostSnake = ghostSnake;
    this.food = food;
    this.score = initialScore
  }
  generateNewFood() {
    this.food = new Food(getRandom(100), getRandom(60))
  }

  isFoodEaten(snake) {
    return snake.isOnFood(this.food)
  }

  increaseSnakeSize() {
    this.snake.develop();
  }

  updateScore() {
    this.score += 5
  }

  get currentScore() {
    return this.score;
  }

  hasTouchedBoundary(snake) {
    const isTopTouched = snake.isOnRow(0) && snake.isDirection(NORTH)
    const isBottomTouched = snake.isOnRow(59) && snake.isDirection(SOUTH)
    const isLeftTouched = snake.isOnCol(0) && snake.isDirection(WEST)
    const isRightTouched = snake.isOnCol(99) && snake.isDirection(EAST)
    return isTopTouched || isBottomTouched || isRightTouched || isLeftTouched
  }

  hasSnakeTouchedOwnBody() {
    return this.snake.isOnLocations(this.snake.location.slice(0, -1))
  }

  hasSnakeTouchedGhostBody() {
    return this.snake.isOnLocations(this.ghostSnake.location)
  }

  get isGameOver() {
    return this.hasTouchedBoundary(this.snake) || this.hasSnakeTouchedOwnBody() || this.hasSnakeTouchedGhostBody()
  }
}