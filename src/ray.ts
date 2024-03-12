import { Vec3, Point3 } from "./vector";

export class Ray {
  constructor(public orig: Point3, public dir: Vec3) {}

  public at(t: number): Point3 {
    let scaledDir: Vec3 = this.dir.scale(t);
    return this.orig.add(scaledDir);
  }
}
