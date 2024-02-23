import { HitRecord, Hittable } from "./hittable";
import { Ray } from "./ray";
import { Point3, Vec3 } from "./vector";

export class Sphere implements Hittable {
  constructor(public position: Point3, public radius: number) {}

  public hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean {
    var oc: Vec3 = ray.orig.subtract(this.position);
    var a = ray.dir.lengthSquared();
    var half_b = oc.dot(ray.dir);
    var c = oc.lengthSquared() - this.radius * this.radius;
    var discr = half_b * half_b - a * c;

    if (discr < 0) return false;

    var sqrtd = Math.sqrt(discr);
    var root = (-half_b - sqrtd) / a;
    if (root <= tmin || root >= tmax) {
      root = (-half_b + sqrtd) / a;
      if (root <= tmin || root >= tmax) {
        return false;
      }
    }

    rec.t = root;
    rec.p = ray.at(root);
    var outwardNormal = rec.p.subtract(this.position).scale(1 / this.radius);
    rec.setFaceNormal(ray, outwardNormal);

    return true;
  }
}
