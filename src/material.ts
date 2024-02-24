import { Color3 } from "./color.js";
import { HitRecord } from "./hittable.js";
import { Ray } from "./ray.js";
import { Vec3 } from "./vector.js";

export interface Material {
  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
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

export class Diffuse implements Material {
  constructor(private albedo: Color3) {}

  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    // var reflected = Vec3.randomOnHemisphere(rec.normal!); // Uniform distribution
    var reflected = rec.normal!.add(Vec3.randomUnitVector()); // Lambertian distrubtion
    scattered.orig = rec.p!;
    scattered.dir = reflected;
    attenuation.copy(this.albedo);
    return true;
  }
}
