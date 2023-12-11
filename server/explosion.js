const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30 + 50); // Saturation between 50 and 80
  const lightness = Math.floor(Math.random() * 20 + 40); // Lightness between 40 and 60
  return `hsla(${hue}, ${saturation}%, ${lightness}%, `;
};

module.exports = class {
  constructor() {
    this.x = Math.random() * 5000;
    this.y = Math.random() * 5000;
    this.size = 0;
    this.maxSize = Math.random() * 150 + 80; // 80 - 230
    this.growDuration = Math.random() * 4 + 2; // 2 - 6 seconds
    this.fadeDuration = Math.random() * 1 + 0.25; // .25 - 1.25 seconds
    this.growing = true;
    this.opacity = 1;
    this.color = getRandomPastelColor();
  }

  update(deltaTime) {
    if (this.growing) {
      this.size += (deltaTime / this.growDuration) * this.maxSize;
      if (this.size >= this.maxSize) {
        this.size = this.maxSize;
        this.growing = false;
      }
    } else {
      this.opacity -= deltaTime / this.fadeDuration;
      if (this.opacity <= 0) {
        this.opacity = 0;
        return true; // Explosion has finished
      }
    }
    return false;
  }
};
