import { Vec3, Point3 } from "./vector";
import { Ray } from "./ray";
import { Material } from "./material";

export class HitRecord {
  constructor(
    public p?: Point3,
    public normal?: Vec3, // always points againt hit ray
    public t?: number,
    public frontface?: boolean,
    public material?: Material
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
  }
}

export interface Hittable {
  hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean;
}

export class HittableList implements Hittable {
  constructor(public objects: Hittable[] = []) {}

  public hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean {
    var temprec = new HitRecord();
    var hitSomething = false;
    var closestSoFar = tmax;

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
  }

  public clear() {
    this.objects = [];
  }
}
