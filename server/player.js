// const MAX_SPEED = 4;
// const SPEED_DECREMENT = 0.5;

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30 + 70); // Saturation between 70 and 100
  const lightness = Math.floor(Math.random() * 20 + 80); // Lightness between 80 and 100
  return `hsla(${hue}, ${saturation}%, ${lightness}%, 1`;
};

module.exports = class {
  constructor(id) {
    this.id = id;
    this.hue = Math.round(Math.random() * 360);
    this.name = null;
    this.screenWidth = null;
    this.screenHeight = null;
    this.color = getRandomPastelColor();
  }

  // Sets the initial data for the player in the game world
  // These variables will change on each respawn
  init(x, y) {
    // console.log(playerData);
    this.x = x;
    this.y = y;
    this.target = {
      x: 0,
      y: 0,
    };

    this.speed = 10;
  }

  // Sets data from client needed for server side operations
  clientData(playerData) {
    this.name = playerData.name;
    this.screenWidth = playerData.screenWidth;
    this.screenHeight = playerData.screenHeight;
  }

  move() {
    // console.log(newTarget);

    // var dist = Math.hypot(newTarget.y, newTarget.x);

    // There may be undefined or NaN errors if somehow
    // entering this function without variables in the target
    if (this.target.x) {
      const deg = Math.atan2(this.target.y, this.target.x);

      /* if (this.speed > MAX_SPEED) {
        this.speed -= SPEED_DECREMENT;
      } */

      const deltaY = this.speed * Math.sin(deg);
      const deltaX = this.speed * Math.cos(deg);

      if (!Number.isNaN(deltaY) && !Number.isNaN(deltaX)) {
        this.y += deltaY;
        this.x += deltaX;
      }
    }
  }
};
