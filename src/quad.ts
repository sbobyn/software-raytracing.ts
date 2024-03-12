import { HitRecord, Hittable } from "./hittable";
import { Material } from "./material";
import { Ray } from "./ray";
import { Point3, Vec3 } from "./vector";

export class Quad implements Hittable {
  // plane contain quad defined by dot(normal, x) = D where x is a point on the plane
  private normal: Vec3;
  private D: number;
  private w: Vec3; // precomputed vector for hit testing
  constructor(
    private Q: Point3,
    private u: Vec3,
    private v: Vec3,
    private material: Material
  ) {
    let n = u.cross(v);
    this.normal = n.normalized();
    this.D = this.normal.dot(Q);
    this.w = n.scale(1 / n.dot(n));
  }

  /*
    1. find the plane that contains that quad,
    2. solve for the intersection of a ray and the quad-containing plane,
    3. determine if the hit point lies inside the quad.
  */
  hit(ray: Ray, tmin: number, tmax: number, rec: HitRecord): boolean {
    // only hit frontface
    // if (this.normal.dot(ray.dir) > 0) return false;

    let denom = this.normal.dot(ray.dir);

    // check if ray parallel to plane
    if (Math.abs(denom) < 1e-8) return false;

    // check if intersection is in hit t inverval
    let root = (this.D - this.normal.dot(ray.orig)) / denom;
    if (root <= tmin || root >= tmax) return false;

    let intersectionPoint = ray.at(root);
    let intersectionVector = intersectionPoint.subtract(this.Q);
    let alpha = this.w.dot(intersectionVector.cross(this.v));
    let beta = this.w.dot(this.u.cross(intersectionVector));

    // check if ray hits the 2d shape
    if (!this.isInterior(alpha, beta, rec)) return false;

    rec.t = root;
    rec.p = intersectionPoint;
    rec.material = this.material;
    rec.setFaceNormal(ray, this.normal);

    return true;
  }

  private isInterior(a: number, b: number, rec: HitRecord) {
    if (a < 0 || 1 < a || b < 0 || 1 < b) return false;

    rec.u = a;
    rec.v = b;
    return true;
  }
}
