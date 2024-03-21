import { Point3, Vec3 } from "./vector.js";
import { randomInt } from "./utils.js";

export class Perlin {
  private readonly pointCount: number;
  private randvecs: Vec3[];
  private permX: Float32Array;
  private permY: Float32Array;
  private permZ: Float32Array;

  constructor() {
    this.pointCount = 256;
    this.randvecs = [];

    for (let i = 0; i < this.pointCount; i++) {
      this.randvecs.push(Vec3.randomUnitVector());
    }

    this.permX = new Float32Array(this.pointCount);
    this.permY = new Float32Array(this.pointCount);
    this.permZ = new Float32Array(this.pointCount);

    this.generatePermutation(this.permX, this.pointCount);
    this.generatePermutation(this.permY, this.pointCount);
    this.generatePermutation(this.permZ, this.pointCount);
  }

  turb(p: Point3, depth: number = 7): number {
    let accum = 0.0;
    let tempP = p.copy();
    let weight = 1.0;

    for (let i = 0; i < depth; i++) {
      accum += weight * this.noise(tempP);
      weight *= 0.5;
      tempP.scaled(2);
    }

    return Math.abs(accum);
  }

  noise(p: Point3): number {
    let u = p.x - Math.floor(p.x);
    let v = p.y - Math.floor(p.y);
    let w = p.z - Math.floor(p.z);

    u = u * u * (3 - 2 * u);
    v = v * v * (3 - 2 * v);
    w = w * w * (3 - 2 * w);

    const i = Math.floor(p.x);
    const j = Math.floor(p.y);
    const k = Math.floor(p.z);

    let c = [
      [
        [Vec3.ZERO, Vec3.ZERO],
        [Vec3.ZERO, Vec3.ZERO],
      ],
      [
        [Vec3.ZERO, Vec3.ZERO],
        [Vec3.ZERO, Vec3.ZERO],
      ],
    ];

    for (let di = 0; di < 2; di++)
      for (let dj = 0; dj < 2; dj++)
        for (let dk = 0; dk < 2; dk++)
          c[di][dj][dk] =
            this.randvecs[
              this.permX[(i + di) & 255] ^
                this.permY[(j + dj) & 255] ^
                this.permZ[(k + dk) & 255]
            ];

    return this.perlinInterp(c, u, v, w);
  }

  private perlinInterp(c: Vec3[][][], u: number, v: number, w: number): number {
    let uu = u * u * (3 - 2 * u);
    let vv = v * v * (3 - 2 * v);
    let ww = w * w * (3 - 2 * w);
    let accum = 0.0;

    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        for (let k = 0; k < 2; k++) {
          let weightv = new Vec3(u - i, v - j, w - k);
          accum +=
            (i * uu + (1 - i) * (1 - uu)) *
            (j * vv + (1 - j) * (1 - vv)) *
            (k * ww + (1 - k) * (1 - ww)) *
            c[i][j][k].dot(weightv);
        }

    return accum;
  }

  private generatePermutation(arr: Float32Array, n: number) {
    for (let i = 0; i < n; i++) arr[i] = i;
    for (let i = n - 1; i > 0; i--) {
      let target = randomInt(i);
      // swap positions
      let tmp = arr[i];
      arr[i] = arr[target];
      arr[target] = tmp;
    }
  }
}
