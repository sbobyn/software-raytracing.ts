export class Interval {
  min: number;
  max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  static fromIntervals(a: Interval, b: Interval): Interval {
    return new Interval(Math.min(a.min, b.min), Math.max(a.max, b.max));
  }

  size(): number {
    return this.max - this.min;
  }

  expand(delta: number): Interval {
    this.min -= delta;
    this.max += delta;
    return this;
  }

  contains(x: number): boolean {
    return this.min <= x && x <= this.max;
  }

  surrounds(x: number): boolean {
    return this.min < x && x < this.max;
  }

  public static readonly empty = new Interval(Infinity, -Infinity);
  public static readonly universe = new Interval(-Infinity, Infinity);
}
