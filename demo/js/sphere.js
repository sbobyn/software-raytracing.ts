import { AABB } from "./aabb.js";
import { Vec3 } from "./vector.js";
var Sphere = /** @class */ (function () {
    function Sphere(position, radius, material) {
        this.position = position;
        this.radius = radius;
        this.material = material;
        var rvec = new Vec3(radius, radius, radius);
        this.bbox = AABB.fromPoints(position.subtract(rvec), position.add(rvec));
    }
    Sphere.prototype.boundingBox = function () {
        return this.bbox;
    };
    Sphere.prototype.hit = function (ray, tmin, tmax, rec) {
        var oc = ray.orig.subtract(this.position);
        var a = ray.dir.lengthSquared();
        var half_b = oc.dot(ray.dir);
        var c = oc.lengthSquared() - this.radius * this.radius;
        var discr = half_b * half_b - a * c;
        if (discr < 0)
            return false;
        var sqrtd = Math.sqrt(discr);
        var root = (-half_b - sqrtd) / a;
        if (root <= tmin || root >= tmax) {
            root = (-half_b + sqrtd) / a;
            if (root <= tmin || root >= tmax) {
                return false;
            }
        }
        rec.t = root;
        rec.p = ray.at(root);
        var outwardNormal = rec.p.subtract(this.position).scale(1 / this.radius);
        rec.setFaceNormal(ray, outwardNormal);
        rec.material = this.material;
        this.setUV(rec);
        return true;
    };
    Sphere.prototype.setUV = function (rec) {
        var p = rec.normal;
        var theta = Math.acos(-p.y);
        var phi = Math.atan2(-p.z, p.x) + Math.PI;
        rec.u = phi / (2 * Math.PI);
        rec.v = theta / Math.PI;
    };
    return Sphere;
}());
export { Sphere };
