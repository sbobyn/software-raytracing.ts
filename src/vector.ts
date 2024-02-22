export class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}

  public plusEquals(other: Vec3) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }

  public add(other: Vec3): Vec3 {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  public subtract(other: Vec3): Vec3 {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  public scale(scalar: number): Vec3 {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public normalized(): Vec3 {
    var length = this.length();
    return this.scale(1.0 / length);
  }

  public dot(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  public cross(other: Vec3): Vec3 {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }
}

export class Point3 extends Vec3 {
  constructor(x: number, y: number, z: number) {
    super(x, y, z);
  }
}
