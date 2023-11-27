const MAX_SPEED = 4;
const SPEED_DECREMENT = 0.5;

module.exports = class {
  constructor(id) {
    this.id = id;
    this.hue = Math.round(Math.random() * 360);
    this.name = null;
    this.screenWidth = null;
    this.screenHeight = null;
  }

  // Sets the initial data for the player in the game world
  // These variables will change on each respawn
  init(x, y) {
    //console.log(playerData);
    this.x = x;
    this.y = y;
    this.target = {
      x: 0,
      y: 0,
    };

    this.speed = 3;
  }

  // Sets data from client needed for server side operations
  clientData(playerData) {
    this.name = playerData.name;
    this.screenWidth = playerData.screenWidth;
    this.screenHeight = playerData.screenHeight;
  }

  move() {
    //console.log(newTarget);

    //var dist = Math.hypot(newTarget.y, newTarget.x);
    const deg = Math.atan2(this.target.y, this.target.x);
    console.log(deg);

    if (this.speed > MAX_SPEED) {
      this.speed -= SPEED_DECREMENT;
    }

    const deltaY = this.speed * Math.sin(deg);
    const deltaX = this.speed * Math.cos(deg);

    //console.log(deltaY);

    //if (!deltaY.isNaN()) {
      this.y += deltaY;
    //}

    //if (!deltaX.isNaN()) {
      this.x += deltaX;
    //}
  }
};
