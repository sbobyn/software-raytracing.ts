import { Color3 } from "./color.js";
import { HitRecord } from "./hittable.js";
import { Ray } from "./ray.js";
import { SolidColor, Texture } from "./texture.js";
import { Point3, Vec3 } from "./vector.js";

export interface Material {
  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean;

  emitted(u: number, v: number, p: Point3): Color3;
}

class BaseMaterial implements Material {
  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    throw new Error("Method not implemented.");
  }
  emitted(u: number, v: number, p: Point3): Color3 {
    return new Color3(0, 0, 0); // Default to no light emitted
  }
}

// roughness between 0 and 1
export class Metal extends BaseMaterial {
  constructor(private texture: Texture, private roughness: number = 0) {
    super();
  }
  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    let reflected = inRay.dir.normalized().reflect(rec.normal!);
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

export class Diffuse extends BaseMaterial {
  constructor(
    private texture: Texture,
    private roughness: number = 1,
    private distribution: Distribution = Distribution.Lambertian,
    private absorbtionProbability: number = 0
  ) {
    super();
  }

  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    let reflected: Vec3;
    switch (this.distribution) {
      case Distribution.Uniform:
        reflected = Vec3.randomOnHemisphere(rec.normal!);
        break;
      case Distribution.Lambertian:
        reflected = rec.normal!.add(
          Vec3.randomUnitVector().scale(this.roughness)
        );
        if (reflected.nearEquals(Vec3.ZERO)) reflected = rec.normal!;
        break;
    }
    scattered.orig = rec.p!;
    scattered.dir = reflected;

    let rayAbsorbed: boolean = Math.random() < this.absorbtionProbability;
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

export class Dielectric extends BaseMaterial {
  private ir: number;
  constructor(refractiveIndex: number) {
    super();
    this.ir = refractiveIndex;
  }

  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    attenuation.copy(Color3.WHITE);
    let refractionRatio = rec.frontface! ? 1.0 / this.ir : this.ir;

    let unitDir = inRay.dir.normalized();

    let cosTheta = Math.min(unitDir.negated().dot(rec.normal!), 1);
    let sinTheta = Math.sqrt(1 - cosTheta ** 2);

    let cannotRefract = refractionRatio * sinTheta > 1;

    let direction: Vec3;
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
    let r0 = (1 - refIndex) / (1 + refIndex);
    r0 = r0 * r0;
    return r0 + (1 - r0) * Math.pow(1 - cosTheta, 5);
  }
}

export class DiffuseLight extends BaseMaterial {
  private emit: Texture;

  constructor(a: Texture = new SolidColor(Color3.WHITE)) {
    super();
    this.emit = a;
  }

  scatter(
    inRay: Ray,
    rec: HitRecord,
    attenuation: Color3,
    scattered: Ray
  ): boolean {
    return false;
  }

  emitted(u: number, v: number, p: Point3): Color3 {
    return this.emit.value(u, v, p);
  }
}
