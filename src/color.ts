export class Color3 {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public add(other: Color3) {
    return new Color3(this.r + other.r, this.g + other.g, this.b + other.b);
  }

  public scale(t: number) {
    return new Color3(t * this.r, t * this.g, t * this.b);
  }

  public static readonly WHITE = new Color3(1, 1, 1);
  public static readonly SKY_BLUE = new Color3(0.5, 0.7, 1);
}
