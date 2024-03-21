import { randomInRange } from "./utils.js";

export class Color3 {
  constructor(public r: number, public g: number, public b: number) {}

  public copy(other: Color3) {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
  }

  public static random(min: number = 0, max: number = 1): Color3 {
    return new Color3(
      randomInRange(min, max),
      randomInRange(min, max),
      randomInRange(min, max)
    );
  }

  public mul(other: Color3): Color3 {
    return new Color3(this.r * other.r, this.g * other.g, this.b * other.b);
  }

  public add(other: Color3): Color3 {
    return new Color3(this.r + other.r, this.g + other.g, this.b + other.b);
  }

  public plusEquals(other: Color3) {
    this.r += other.r;
    this.g += other.g;
    this.b += other.b;
  }

  public scale(t: number): Color3 {
    return new Color3(t * this.r, t * this.g, t * this.b);
  }

  public scaled(scalar: number): Color3 {
    this.r *= scalar;
    this.g *= scalar;
    this.b *= scalar;
    return this;
  }

  public static readonly BLACK = new Color3(0, 0, 0);
  public static readonly WHITE = new Color3(1, 1, 1);
  public static readonly SKY_BLUE = new Color3(0.5, 0.7, 1);
  public static readonly RED = new Color3(1, 0, 0);
  public static readonly CYAN = new Color3(0, 1, 1);
}
