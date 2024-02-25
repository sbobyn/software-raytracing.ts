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

export enum Distribution {
  Uniform,
  Lambertian,
}

export class Diffuse implements Material {
  constructor(
    private albedo: Color3,
    private roughness: number = 1,
    private distribution: Distribution = Distribution.Lambertian
  ) {}

  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    var reflected: Vec3;
    switch (this.distribution) {
      case Distribution.Uniform:
        reflected = Vec3.randomOnHemisphere(rec.normal!);
      case Distribution.Lambertian:
        reflected = rec.normal!.add(
          Vec3.randomUnitVector().scale(this.roughness)
        );
    }
    scattered.orig = rec.p!;
    scattered.dir = reflected;
    attenuation.copy(this.albedo);
    return true;
  }
}
