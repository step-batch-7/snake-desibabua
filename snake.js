const EAST = 0;
const NORTH = 1;
const WEST = 2;
const SOUTH = 3;

class Direction {
  constructor(initialHeading) {
    this.heading = initialHeading;
    this.deltas = {};
    this.deltas[EAST] = [1, 0];
    this.deltas[WEST] = [-1, 0];
    this.deltas[NORTH] = [0, -1];
    this.deltas[SOUTH] = [0, 1];
  }

  get delta() {
    return this.deltas[this.heading];
  }

  turnLeft() {
    this.heading = (this.heading + 1) % 4;
  }
}

class Snake {
  constructor(positions, direction, type) {
    this.positions = positions.slice();
    this.direction = direction;
    this.type = type;
    this.previousTail = [0, 0];
  }

  get location() {
    return this.positions.slice();
  }

  get head() {
    const snakeLocation = this.location
    return snakeLocation[snakeLocation.length - 1]
  }

  get runningDirection() {
    return this.direction.heading
  }

  get species() {
    return this.type;
  }

  turnLeft() {
    this.direction.turnLeft();
  }

  move() {
    const [headX, headY] = this.positions[this.positions.length - 1];
    this.previousTail = this.positions.shift();

    const [deltaX, deltaY] = this.direction.delta;

    this.positions.push([headX + deltaX, headY + deltaY]);
  }

  develop(food) {
    if(food.kind == "food")
    this.positions.unshift(this.previousTail);
  }

  isOnRow(row) {
    const [, snakeCurrentRow] = this.head;
    return snakeCurrentRow == row
  }

  isOnCol(col) {
    const [snakeCurrentCol] = this.head;
    return snakeCurrentCol == col
  }

  isDirection(dir) {
    return this.runningDirection == dir
  }

  isOnFood(food) {
    const [foodY, foodX] = food.position
    const [snakeY, snakeX] = this.head
    return snakeY == foodY && snakeX == foodX
  }

  isOnLocations(locations) {
    return locations.some(([col, row]) => this.isOnCol(col) && this.isOnRow(row))
  }
}
