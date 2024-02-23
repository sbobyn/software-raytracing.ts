import { Color3 } from "./color";
import { HitRecord } from "./hittable";
import { Ray } from "./ray";

export interface Material {
  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scatttered: Ray
  ): boolean;
}

export class Metal implements Material {
  constructor(private albedo: Color3) {}
  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    var reflected = inRay.dir.normalized().reflect(rec.normal!);
    scattered.orig = rec.p!;
    scattered.dir = reflected;
    attenuation.copy(this.albedo);
    return true;
  }
}
