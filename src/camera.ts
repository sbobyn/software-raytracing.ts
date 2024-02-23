import { Point3, Vec3 } from "./vector.js";
import { Ray } from "./ray.js";
import { Color3 } from "./color.js";
import { HitRecord, Hittable } from "./hittable.js";

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export class Camera {
  public lookfrom: Point3;
  public lookdir: Vec3;
  public vup: Vec3;
  public u: Vec3;
  public v: Vec3;
  public w: Vec3;
  public focalLength: number;
  public vfov: number; // vertical field of view
  public aspectRatio: number;
  public moveSpeed: number;

  constructor(vfov: number = 90, aspectRatio: number = 16 / 9) {
    this.lookfrom = new Point3(0, 0, 0);
    this.lookdir = new Point3(0, 0, -1); // looking down -z axis
    this.vup = new Vec3(0, 1, 0);

    // initial camera coordinate frame
    this.u = new Vec3(1, 0, 0);
    this.v = new Vec3(0, 1, 0);
    this.w = new Vec3(0, 0, 1);

    this.focalLength = 1.0;
    this.vfov = degreesToRadians(vfov);
    this.aspectRatio = aspectRatio;

    this.moveSpeed = 2;
  }

  public rayColor(ray: Ray, scene: Hittable, depth: number): Color3 {
    if (depth < 0) return Color3.BLACK;

    var rec = new HitRecord();
    if (scene.hit(ray, 0.001, Infinity, rec)) {
      var scattered = new Ray(rec.p!, new Vec3(0, 0, 0)); // placeholder dir
      var attenuation = Color3.BLACK; // placeholder
      if (rec.material!.scatter(ray, rec, attenuation, scattered))
        return attenuation.mul(this.rayColor(scattered, scene, depth - 1));
      return Color3.BLACK;
    }

    var unitDir = ray.dir.normalized();
    var a: number = 0.5 * (unitDir.y + 1);
    return Color3.WHITE.scale(1 - a).add(Color3.SKY_BLUE.scale(a));
  }

  public lookAt(pos: Point3) {
    // new basis vectors
    this.w = this.lookfrom.subtract(pos).normalized(); // right-handed coords ==> camera looks down -z
    this.u = this.vup.cross(this.w).normalized();
    this.v = this.w.cross(this.u);
    this.lookdir = this.w.scale(-1.0);
  }
}
