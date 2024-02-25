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

// roughness between 0 and 1
export class Metal implements Material {
  constructor(private albedo: Color3, private roughness: number = 0) {}
  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    var reflected = inRay.dir.normalized().reflect(rec.normal!);
    scattered.orig = rec.p!;
    scattered.dir = reflected.add(
      Vec3.randomUnitVector().scale(this.roughness)
    );
    attenuation.copy(this.albedo);
    return scattered.dir.dot(rec.normal!) > 0;
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
    private distribution: Distribution = Distribution.Lambertian,
    private absorbtionProbability: number = 0
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
        if (reflected.nearEquals(Vec3.ZERO)) reflected = rec.normal!;
    }
    scattered.orig = rec.p!;
    scattered.dir = reflected;

    var rayAbsorbed: boolean = Math.random() < this.absorbtionProbability;
    attenuation.copy(
      rayAbsorbed
        ? Color3.BLACK
        : this.albedo.scale(1 - this.absorbtionProbability)
    );
    return true;
  }
}
