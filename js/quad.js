import { AABB } from "./aabb.js";
var Quad = /** @class */ (function () {
    function Quad(Q, u, v, material) {
        this.Q = Q;
        this.u = u;
        this.v = v;
        this.material = material;
        var n = u.cross(v);
        this.normal = n.normalized();
        this.D = this.normal.dot(Q);
        this.w = n.scale(1 / n.dot(n));
        this.bbox = AABB.fromPoints(Q, Q.add(u).add(v)).pad();
    }
    Quad.prototype.boundingBox = function () {
        return this.bbox;
    };
    /*
      1. find the plane that contains that quad,
      2. solve for the intersection of a ray and the quad-containing plane,
      3. determine if the hit point lies inside the quad.
    */
    Quad.prototype.hit = function (ray, tmin, tmax, rec) {
        // only hit frontface
        // if (this.normal.dot(ray.dir) < 0) return false;
        var denom = this.normal.dot(ray.dir);
        // check if ray parallel to plane
        if (Math.abs(denom) < 1e-8)
            return false;
        // check if intersection is in hit t inverval
        var root = (this.D - this.normal.dot(ray.orig)) / denom;
        if (root <= tmin || root >= tmax)
            return false;
        var intersectionPoint = ray.at(root);
        var intersectionVector = intersectionPoint.subtract(this.Q);
        var alpha = this.w.dot(intersectionVector.cross(this.v));
        var beta = this.w.dot(this.u.cross(intersectionVector));
        // check if ray hits the 2d shape
        if (!this.isInterior(alpha, beta, rec))
            return false;
        rec.t = root;
        rec.p = intersectionPoint;
        rec.material = this.material;
        rec.setFaceNormal(ray, this.normal);
        return true;
    };
    Quad.prototype.isInterior = function (a, b, rec) {
        if (a < 0 || 1 < a || b < 0 || 1 < b)
            return false;
        rec.u = a;
        rec.v = b;
        return true;
    };
    return Quad;
}());
export { Quad };
