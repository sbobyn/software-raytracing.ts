import { Vec3, Point3 } from "./vector.js";
import { Ray } from "./ray.js";
import { Material } from "./material.js";
import { AABB } from "./aabb.js";

export class HitRecord {
  constructor(
    public p?: Point3,
    public normal?: Vec3, // always points againt hit ray
    public t?: number,
    public frontface?: boolean,
    public material?: Material,
    public u?: number,
    public v?: number
  ) {}

  public setFaceNormal(ray: Ray, outwardNormal: Vec3) {
    // ray points against outward normal    ==> frontface hit
    // ray points with outward normal       ==> backface hit
    this.frontface = ray.dir.dot(outwardNormal) < 0;
    this.normal = this.frontface ? outwardNormal : outwardNormal.negated();
  }

  public copy(other: HitRecord) {
    this.p = other.p;
    this.normal = other.normal;
    this.t = other.t;
    this.frontface = other.frontface;
    this.material = other.material;
    this.u = other.u;
    this.v = other.v;
  }
}

export interface Hittable {
  hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean;

  boundingBox(): AABB;
}

export class HittableList implements Hittable {
  bbox: AABB;

  constructor(public objects: Hittable[] = []) {
    this.bbox = new AABB();
  }

  boundingBox(): AABB {
    return this.bbox;
  }

  public hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean {
    let temprec = new HitRecord();
    let hitSomething = false;
    let closestSoFar = tmax;

    for (const obj of this.objects) {
      if (obj.hit(ray, tmin, closestSoFar, temprec)) {
        hitSomething = true;
        closestSoFar = temprec.t!;
        rec.copy(temprec);
      }
    }
    return hitSomething;
  }

  public add(object: Hittable) {
    this.objects.push(object);
    this.bbox = AABB.fromAABBs(this.bbox, object.boundingBox());
  }

  public clear() {
    this.objects = [];
  }
}
