import { AABB } from "./aabb.js";
var HitRecord = /** @class */ (function () {
    function HitRecord(p, normal, // always points againt hit ray
    t, frontface, material, u, v) {
        this.p = p;
        this.normal = normal;
        this.t = t;
        this.frontface = frontface;
        this.material = material;
        this.u = u;
        this.v = v;
    }
    HitRecord.prototype.setFaceNormal = function (ray, outwardNormal) {
        // ray points against outward normal    ==> frontface hit
        // ray points with outward normal       ==> backface hit
        this.frontface = ray.dir.dot(outwardNormal) < 0;
        this.normal = this.frontface ? outwardNormal : outwardNormal.negated();
    };
    HitRecord.prototype.copy = function (other) {
        this.p = other.p;
        this.normal = other.normal;
        this.t = other.t;
        this.frontface = other.frontface;
        this.material = other.material;
        this.u = other.u;
        this.v = other.v;
    };
    return HitRecord;
}());
export { HitRecord };
var HittableList = /** @class */ (function () {
    function HittableList(objects) {
        if (objects === void 0) { objects = []; }
        this.objects = objects;
        this.bbox = new AABB();
    }
    HittableList.prototype.boundingBox = function () {
        return this.bbox;
    };
    HittableList.prototype.hit = function (ray, tmin, tmax, rec) {
        var temprec = new HitRecord();
        var hitSomething = false;
        var closestSoFar = tmax;
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.hit(ray, tmin, closestSoFar, temprec)) {
                hitSomething = true;
                closestSoFar = temprec.t;
                rec.copy(temprec);
            }
        }
        return hitSomething;
    };
    HittableList.prototype.add = function (object) {
        this.objects.push(object);
        this.bbox = AABB.fromAABBs(this.bbox, object.boundingBox());
    };
    HittableList.prototype.clear = function () {
        this.objects = [];
    };
    return HittableList;
}());
export { HittableList };
