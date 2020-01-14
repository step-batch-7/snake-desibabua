class Food {
  constructor(colId, rowId) {
    this.colId = colId;
    this.rowId = rowId;
    this.type = randomFoodType();
  }

  get position() {
    return [this.colId, this.rowId];
  }

  get kind() {
    return this.type;
  }
}

const randomFoodType = () => (getRandom(10) > 7 ? 'specialFood' : 'food');
