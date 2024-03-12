import { HitRecord, Hittable } from "./hittable";
import { Material } from "./material";
import { Ray } from "./ray";
import { Point3, Vec3 } from "./vector";

export class Sphere implements Hittable {
  constructor(
    public position: Point3,
    public radius: number,
    public material: Material
  ) {}

  public hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean {
    let oc: Vec3 = ray.orig.subtract(this.position);
    let a = ray.dir.lengthSquared();
    let half_b = oc.dot(ray.dir);
    let c = oc.lengthSquared() - this.radius * this.radius;
    let discr = half_b * half_b - a * c;

    if (discr < 0) return false;

    let sqrtd = Math.sqrt(discr);
    let root = (-half_b - sqrtd) / a;
    if (root <= tmin || root >= tmax) {
      root = (-half_b + sqrtd) / a;
      if (root <= tmin || root >= tmax) {
        return false;
      }
    }

    rec.t = root;
    rec.p = ray.at(root);
    let outwardNormal = rec.p.subtract(this.position).scale(1 / this.radius);
    rec.setFaceNormal(ray, outwardNormal);
    rec.material = this.material;
    this.setUV(rec);

    return true;
  }

  private setUV(rec: HitRecord) {
    let p: Point3 = rec.normal!;
    let theta = Math.acos(-p.y);
    let phi = Math.atan2(-p.z, p.x) + Math.PI;
    rec.u = phi / (2 * Math.PI);
    rec.v = theta / Math.PI;
  }
}
