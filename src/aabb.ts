import { Interval } from "./interval.js";
import { Ray } from "./ray.js";
import { Point3 } from "./vector.js";

export class AABB {
  x: Interval;
  y: Interval;
  z: Interval;

  constructor() {
    this.x = Interval.empty;
    this.y = Interval.empty;
    this.z = Interval.empty;
  }

  static fromPoints(a: Point3, b: Point3): AABB {
    // a and b are extrema of bb
    let aabb = new AABB();
    aabb.x = new Interval(Math.min(a.x, b.x), Math.max(a.x, b.x));
    aabb.y = new Interval(Math.min(a.y, b.y), Math.max(a.y, b.y));
    aabb.z = new Interval(Math.min(a.z, b.z), Math.max(a.z, b.z));
    return aabb;
  }

  static fromAABBs(box1: AABB, box2: AABB): AABB {
    let aabb = new AABB();

    aabb.x = Interval.fromIntervals(box1.x, box2.x);
    aabb.y = Interval.fromIntervals(box1.y, box2.y);
    aabb.z = Interval.fromIntervals(box1.z, box2.z);

    return aabb;
  }

  static fromIntervals(x: Interval, y: Interval, z: Interval): AABB {
    let aabb = new AABB();
    aabb.x = x;
    aabb.y = y;
    aabb.z = z;
    return aabb;
  }

  pad() {
    // Return an AABB that has no side narrower than some delta, padding if necessary.
    const delta = 0.0001;
    let new_x = this.x.size() >= delta ? this.x : this.x.expand(delta);
    let new_y = this.y.size() >= delta ? this.y : this.y.expand(delta);
    let new_z = this.z.size() >= delta ? this.z : this.z.expand(delta);
    return AABB.fromIntervals(new_x, new_y, new_z);
  }

  axis(n: number): Interval {
    if (n == 1) return this.y;
    if (n == 2) return this.z;
    return this.x;
  }

  hit(r: Ray, ray_t: Interval) {
    for (let a = 0; a < 3; a++) {
      let invD = 1.0 / r.dir.idx(a);
      let orig = r.orig.idx(a);

      let t0 = (this.axis(a).min - orig) * invD;
      let t1 = (this.axis(a).max - orig) * invD;

      if (invD < 0) {
        let tmp = t0;
        t0 = t1;
        t1 = tmp;
      }

      if (t0 > ray_t.min) ray_t.min = t0;
      if (t1 < ray_t.max) ray_t.max = t1;

      if (ray_t.max <= ray_t.min) return false;
    }

    return true;
  }
}
