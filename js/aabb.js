import { Interval } from "./interval.js";
var AABB = /** @class */ (function () {
    function AABB() {
        this.x = Interval.empty;
        this.y = Interval.empty;
        this.z = Interval.empty;
    }
    AABB.fromPoints = function (a, b) {
        // a and b are extrema of bb
        var aabb = new AABB();
        aabb.x = new Interval(Math.min(a.x, b.x), Math.max(a.x, b.x));
        aabb.y = new Interval(Math.min(a.y, b.y), Math.max(a.y, b.y));
        aabb.z = new Interval(Math.min(a.z, b.z), Math.max(a.z, b.z));
        return aabb;
    };
    AABB.fromAABBs = function (box1, box2) {
        var aabb = new AABB();
        aabb.x = Interval.fromIntervals(box1.x, box2.x);
        aabb.y = Interval.fromIntervals(box1.y, box2.y);
        aabb.z = Interval.fromIntervals(box1.z, box2.z);
        return aabb;
    };
    AABB.fromIntervals = function (x, y, z) {
        var aabb = new AABB();
        aabb.x = x;
        aabb.y = y;
        aabb.z = z;
        return aabb;
    };
    AABB.prototype.pad = function () {
        // Return an AABB that has no side narrower than some delta, padding if necessary.
        var delta = 0.0001;
        var new_x = this.x.size() >= delta ? this.x : this.x.expand(delta);
        var new_y = this.y.size() >= delta ? this.y : this.y.expand(delta);
        var new_z = this.z.size() >= delta ? this.z : this.z.expand(delta);
        return AABB.fromIntervals(new_x, new_y, new_z);
    };
    AABB.prototype.axis = function (n) {
        if (n == 1)
            return this.y;
        if (n == 2)
            return this.z;
        return this.x;
    };
    AABB.prototype.hit = function (r, ray_t) {
        for (var a = 0; a < 3; a++) {
            var invD = 1.0 / r.dir.idx(a);
            var orig = r.orig.idx(a);
            var t0 = (this.axis(a).min - orig) * invD;
            var t1 = (this.axis(a).max - orig) * invD;
            if (invD < 0) {
                var tmp = t0;
                t0 = t1;
                t1 = tmp;
            }
            if (t0 > ray_t.min)
                ray_t.min = t0;
            if (t1 < ray_t.max)
                ray_t.max = t1;
            if (ray_t.max <= ray_t.min)
                return false;
        }
        return true;
    };
    return AABB;
}());
export { AABB };
