import { AABB } from "./aabb.js";
import { HitRecord, Hittable, HittableList } from "./hittable.js";
import { Interval } from "./interval.js";
import { Ray } from "./ray.js";
import { randomInt } from "./utils.js";

export class BVHNode implements Hittable {
  left: Hittable;
  right: Hittable;
  bbox: AABB;

  constructor(objects: Hittable[], start: number, end: number) {
    let axis = randomInt(3);
    let comparator: (a: Hittable, b: Hittable) => number;
    comparator =
      axis == 0 ? boxXCompare : axis == 1 ? boxYCompare : boxZCompare;

    let objSpan = end - start;

    if (objSpan == 1) {
      this.left = this.right = objects[start];
    } else if (objSpan == 2) {
      if (comparator(objects[start], objects[start + 1]) < 0) {
        this.left = objects[start];
        this.right = objects[start + 1];
      } else {
        this.left = objects[start + 1];
        this.right = objects[start];
      }
    } else {
      objects = objects.slice(start, end).sort(comparator);
      const mid = Math.floor(objects.length / 2);
      this.left = new BVHNode(objects, 0, mid);
      this.right = new BVHNode(objects, mid, objects.length);
    }

    this.bbox = AABB.fromAABBs(
      this.left.boundingBox(),
      this.right.boundingBox()
    );
  }

  static fromHittableList(list: HittableList): BVHNode {
    return new BVHNode(list.objects, 0, list.objects.length);
  }

  hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean {
    if (!this.bbox.hit(ray, new Interval(tmin, tmax))) return false;

    let hitLeft = this.left.hit(ray, tmin, tmax, rec);
    let hitRight = this.right.hit(ray, tmin, hitLeft ? rec.t! : tmax, rec);

    return hitLeft || hitRight;
  }
  
  boundingBox(): AABB {
    return this.bbox;
  }
}

function boxCompare(a: Hittable, b: Hittable, axisIdx: number): boolean {
  return a.boundingBox().axis(axisIdx).min < b.boundingBox().axis(axisIdx).min;
}

function boxXCompare(a: Hittable, b: Hittable): number {
  return boxCompare(a, b, 0) ? -1 : 1;
}

function boxYCompare(a: Hittable, b: Hittable): number {
  return boxCompare(a, b, 1) ? -1 : 1;
}

function boxZCompare(a: Hittable, b: Hittable): number {
  return boxCompare(a, b, 2) ? -1 : 1;
}
