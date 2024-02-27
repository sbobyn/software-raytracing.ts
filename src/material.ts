import { Color3 } from "./color.js";
import { HitRecord } from "./hittable.js";
import { Ray } from "./ray.js";
import { Texture } from "./texture.js";
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
  constructor(private texture: Texture, private roughness: number = 0) {}
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
    attenuation.copy(this.texture.value(rec.u!, rec.v!, rec.p!));
    return scattered.dir.dot(rec.normal!) > 0;
  }
}

export enum Distribution {
  Uniform,
  Lambertian,
}

export class Diffuse implements Material {
  constructor(
    private texture: Texture,
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
        : this.texture
            .value(rec.u!, rec.v!, rec.p!)
            .scale(1 - this.absorbtionProbability)
    );
    return true;
  }
}

export class Dielectric implements Material {
  private ir: number;
  constructor(refractiveIndex: number) {
    this.ir = refractiveIndex;
  }

  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    attenuation.copy(Color3.WHITE);
    var refractionRatio = rec.frontface! ? 1.0 / this.ir : this.ir;

    var unitDir = inRay.dir.normalized();

    var cosTheta = Math.min(unitDir.negated().dot(rec.normal!), 1);
    var sinTheta = Math.sqrt(1 - cosTheta ** 2);

    var cannotRefract = refractionRatio * sinTheta > 1;

    var direction: Vec3;
    if (
      cannotRefract ||
      Dielectric.reflectance(cosTheta, refractionRatio) > Math.random()
    )
      direction = unitDir.reflect(rec.normal!);
    else direction = Vec3.refract(unitDir, rec.normal!, refractionRatio);

    scattered.orig = rec.p!;
    scattered.dir = direction;
    return true;
  }

  // Schlick's approximation
  // https://en.wikipedia.org/wiki/Schlick%27s_approximation
  private static reflectance(cosTheta: number, refIndex: number): number {
    var r0 = (1 - refIndex) / (1 + refIndex);
    r0 = r0 * r0;
    return r0 + (1 - r0) * Math.pow(1 - cosTheta, 5);
  }
}
