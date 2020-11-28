Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

class Pixel {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.color = c;
  }
}