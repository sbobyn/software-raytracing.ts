import { randomInRange } from "./utils.js";

export class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}

  public static readonly ZERO = new Vec3(0, 0, 0);

  public static randomInUnitSphere(): Vec3 {
    let p = new Vec3(
      randomInRange(-1, 1),
      randomInRange(-1, 1),
      randomInRange(-1, 1)
    );
    while (p.lengthSquared() > 1) {
      p.x = randomInRange(-1, 1);
      p.y = randomInRange(-1, 1);
      p.z = randomInRange(-1, 1);
    }
    return p;
  }

  public static randomUnitVector(): Vec3 {
    // uses rejectionh method to avoid distribution bias
    return Vec3.randomInUnitSphere().normalized();
  }

  public static randomOnHemisphere(normal: Vec3): Vec3 {
    let onUnitSphere = Vec3.randomUnitVector();
    if (normal.dot(onUnitSphere) > 0) {
      // already in the hemisphere
      return onUnitSphere;
    } else {
      // in the other hemisphere
      onUnitSphere.x = -onUnitSphere.x;
      onUnitSphere.y = -onUnitSphere.y;
      onUnitSphere.z = -onUnitSphere.z;
      return onUnitSphere;
    }
  }

  public nearEquals(other: Vec3): boolean {
    let eps = 1e-7;
    return (
      Math.abs(this.x - other.x) < eps &&
      Math.abs(this.y - other.y) < eps &&
      Math.abs(this.z - other.z) < eps
    );
  }

  public plusEquals(other: Vec3) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }

  public minusEquals(other: Vec3) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
  }

  public negated(): Vec3 {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  public reflect(N: Vec3): Vec3 {
    return this.subtract(N.scale(2 * this.dot(N)));
  }

  static refract(uv: Vec3, n: Vec3, eta1_over_eta2: number) {
    let cosTheta = Math.min(uv.negated().dot(n), 1);
    let rOutPerp = uv.add(n.scale(cosTheta)).scale(eta1_over_eta2);
    let rOutParallel = n.scale(-Math.sqrt(1 - rOutPerp.lengthSquared()));
    return rOutPerp.add(rOutParallel);
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

  public scaled(scalar: number): Vec3 {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public normalized(): Vec3 {
    let length = this.length();
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

  public copy(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  public idx(i: number): number {
    if (i == 2) return this.z;
    if (i == 1) return this.y;
    return this.x;
  }

  public toString() {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  }
}

export class Point3 extends Vec3 {
  constructor(x: number, y: number, z: number) {
    super(x, y, z);
  }
}
