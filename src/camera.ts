import { Point3, Vec3 } from "./vector.js";
import { Ray } from "./ray.js";
import { Color3 } from "./color.js";
import { HitRecord, Hittable } from "./hittable.js";
import { degreesToRadians } from "./utils.js";

export class Camera {
  public lookfrom: Point3;
  public lookdir: Vec3;
  public vup: Vec3;
  public u: Vec3;
  public v: Vec3;
  public w: Vec3;

  public viewportWidth: number;
  public viewportHeight: number;
  public moveSpeed: number;

  private vfov: number;
  private aspectRatio: number;
  public focalLength: number; // TODO make this private

  constructor(vfov: number = 90, aspectRatio: number, focalLength: number) {
    this.lookfrom = new Point3(0, 0, 0);
    this.lookdir = new Point3(0, 0, -1); // looking down -z axis
    this.vup = new Vec3(0, 1, 0);

    // initial camera coordinate frame
    this.u = new Vec3(1, 0, 0);
    this.v = new Vec3(0, 1, 0);
    this.w = new Vec3(0, 0, 1);

    this.moveSpeed = 5;

    this.vfov = vfov;
    this.aspectRatio = aspectRatio;
    this.focalLength = focalLength;
    var theta = degreesToRadians(this.vfov);
    var h = Math.tan(theta / 2);
    this.viewportHeight = 2 * h * this.focalLength;
    this.viewportWidth = this.viewportHeight * this.aspectRatio;
  }

  public updateFOV(newValue: number) {
    this.vfov = newValue;
    this.setViewPort();
  }

  public updateAspectRatio(newValue: number) {
    this.aspectRatio = newValue;
    this.setViewPort();
  }

  public setViewPort() {
    var theta = degreesToRadians(this.vfov);
    var h = Math.tan(theta / 2);
    this.viewportHeight = 2 * h * this.focalLength;
    this.viewportWidth = this.viewportHeight * this.aspectRatio;
  }

  public rayColor(ray: Ray, scene: Hittable, depth: number): Color3 {
    if (depth < 0) return Color3.BLACK;

    var rec = new HitRecord();
    if (scene.hit(ray, 1e-8, Infinity, rec)) {
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
