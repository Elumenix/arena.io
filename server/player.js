const MAX_SPEED = 4;
const SPEED_DECREMENT = 0.5;

exports.Player = class {
  constructor(id) {
    this.id = id;
    this.hue = Math.round(Math.random() * 360);
    this.name = null;
    this.screenWidth = null;
    this.screenHeight = null;
  }

  // Sets the initial data for the player in the game world
  init(position) {
    this.x = position.x;
    this.y = position.y;
    this.target = {
      x: 0,
      y: 0,
    };

    this.speed = 0;
  }

  // Sets data from client needed for server side operations
  clientData(playerData) {
    this.name = playerData.name;
    this.screenWidth = playerData.screenWidth;
    this.screenHeight = playerData.screenHeight;
  }

  move() {
    // var dist = Math.hypot(this.target.y, this.target.x);
    const deg = Math.atan2(this.target.y, this.target.x);

    if (this.speed > MAX_SPEED) {
      this.speed -= SPEED_DECREMENT;
    }

    const deltaY = this.speed * Math.sin(deg);
    const deltaX = this.speed * Math.cos(deg);

    if (!isNaN(deltaY)) {
      this.y += deltaY;
    }

    if (!isNaN(deltaX)) {
      this.x += deltaX;
    }
  }
};
