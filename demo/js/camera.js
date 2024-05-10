import { Point3, Vec3 } from "./vector.js";
import { Ray } from "./ray.js";
import { Color3 } from "./color.js";
import { HitRecord } from "./hittable.js";
import { degreesToRadians } from "./utils.js";
var Camera = /** @class */ (function () {
    function Camera(vfov, aspectRatio, focalLength) {
        if (vfov === void 0) { vfov = 90; }
        this.background = Color3.SKY_BLUE;
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
    Camera.prototype.updateFOV = function (newValue) {
        this.vfov = newValue;
        this.setViewPort();
    };
    Camera.prototype.updateAspectRatio = function (newValue) {
        this.aspectRatio = newValue;
        this.setViewPort();
    };
    Camera.prototype.setViewPort = function () {
        var theta = degreesToRadians(this.vfov);
        var h = Math.tan(theta / 2);
        this.viewportHeight = 2 * h * this.focalLength;
        this.viewportWidth = this.viewportHeight * this.aspectRatio;
    };
    Camera.prototype.rayColor = function (ray, scene, depth) {
        if (depth < 0)
            return Color3.BLACK;
        var rec = new HitRecord();
        if (!scene.hit(ray, 1e-8, Infinity, rec))
            return this.background;
        var scattered = new Ray(rec.p, new Vec3(0, 0, 0)); // placeholder dir
        var attenuation = Color3.BLACK; // placeholder
        var colorFromEmission = rec.material.emitted(rec.u, rec.v, rec.p);
        if (!rec.material.scatter(ray, rec, attenuation, scattered))
            return colorFromEmission;
        var colorFromScatter = attenuation.mul(this.rayColor(scattered, scene, depth - 1));
        return colorFromEmission.add(colorFromScatter);
    };
    Camera.prototype.lookAt = function (pos) {
        // new basis vectors
        this.w = this.lookfrom.subtract(pos).normalized(); // right-handed coords ==> camera looks down -z
        this.u = this.vup.cross(this.w).normalized();
        this.v = this.w.cross(this.u);
        this.lookdir = this.w.scale(-1.0);
    };
    return Camera;
}());
export { Camera };
