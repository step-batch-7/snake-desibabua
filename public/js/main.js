const NUM_OF_COLS = 100;
const NUM_OF_ROWS = 60;

const GRID_ID = 'grid';

const getGrid = () => document.getElementById(GRID_ID);
const getCellId = (colId, rowId) => colId + '_' + rowId;

const getCell = (colId, rowId) =>
  document.getElementById(getCellId(colId, rowId));

const gameOver = () => {
  const gridBoard = document.getElementById('grid');
  gridBoard.style = 'opacity:0';
};

const createCell = function(grid, colId, rowId) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.id = getCellId(colId, rowId);
  grid.appendChild(cell);
};

const createGrids = function() {
  const grid = getGrid();
  for (let y = 0; y < NUM_OF_ROWS; y++) {
    for (let x = 0; x < NUM_OF_COLS; x++) {
      createCell(grid, x, y);
    }
  }
};

const eraseTail = function(snake) {
  let [colId, rowId] = snake.previousTail;
  const cell = getCell(colId, rowId);
  cell.classList.remove(snake.species);
};

const drawSnake = function(snake) {
  snake.location.forEach(([colId, rowId]) => {
    const cell = getCell(colId, rowId);
    cell.classList.add(snake.species);
  });
};

const eraseFood = function(food) {
  let [colId, rowId] = food.position;
  const cell = getCell(colId, rowId);
  cell.classList.remove('food');
  if (food.isSpecialFood) cell.classList.remove('special');
};

const drawFood = function(food) {
  let [colId, rowId] = food.position;
  const cell = getCell(colId, rowId);
  cell.classList.add('food');
  if (food.isSpecialFood) cell.classList.add('special');
};

const displayScore = function(newScore) {
  const score = document.getElementById('score');
  score.innerText = newScore.currentScore;
};

const handleKeyPress = snake => {
  snake.turnLeft();
};

const moveAndDrawSnake = function(snake) {
  snake.move();
  eraseTail(snake);
  drawSnake(snake);
};

const attachEventListeners = snake => {
  document.body.onkeydown = handleKeyPress.bind(null, snake);
};

const initSnake = () =>
  new Snake(
    [
      [40, 25],
      [41, 25],
      [42, 25]
    ],
    new Direction(EAST),
    'snake'
  );

const initGhostSnake = () =>
  new Snake(
    [
      [40, 30],
      [41, 30],
      [42, 30]
    ],
    new Direction(SOUTH),
    'ghost'
  );

const setUp = function(game) {
  attachEventListeners(game.snake);
  createGrids();
  drawSnake(game.snake);
  drawSnake(game.ghostSnake);
  drawFood(game.food);
};

const animateSnakes = game => {
  moveAndDrawSnake(game.snake);
  moveAndDrawSnake(game.ghostSnake);
};

const randomlyTurnSnake = game => {
  let x = Math.random() * 100;
  if (x > 70) {
    game.ghostSnake.turnLeft();
  }
};

const updateGame = function(game) {
  if (game.isGameOver) {
    gameOver();
    return;
  }
  animateSnakes(game)
  eraseFood(game.food);
  game.updateStatus();
  displayScore(game.score);
  drawFood(game.food);
};

const getGame = function() {
  const snake = initSnake();
  const ghostSnake = initGhostSnake();
  const food = new Food(20, 20);
  const score = new Score(0);
  return new Game(snake, ghostSnake, food, score);
};

const main = function() {
  const game = getGame();
  setUp(game);

  setInterval(randomlyTurnSnake, 500, game);
  setInterval(updateGame, 50, game);
};
