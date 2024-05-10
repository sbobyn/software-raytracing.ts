var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { randomInRange } from "./utils.js";
var Vec3 = /** @class */ (function () {
    function Vec3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vec3.randomInUnitSphere = function () {
        var p = new Vec3(randomInRange(-1, 1), randomInRange(-1, 1), randomInRange(-1, 1));
        while (p.lengthSquared() > 1) {
            p.x = randomInRange(-1, 1);
            p.y = randomInRange(-1, 1);
            p.z = randomInRange(-1, 1);
        }
        return p;
    };
    Vec3.randomUnitVector = function () {
        // uses rejectionh method to avoid distribution bias
        return Vec3.randomInUnitSphere().normalized();
    };
    Vec3.randomOnHemisphere = function (normal) {
        var onUnitSphere = Vec3.randomUnitVector();
        if (normal.dot(onUnitSphere) > 0) {
            // already in the hemisphere
            return onUnitSphere;
        }
        else {
            // in the other hemisphere
            onUnitSphere.x = -onUnitSphere.x;
            onUnitSphere.y = -onUnitSphere.y;
            onUnitSphere.z = -onUnitSphere.z;
            return onUnitSphere;
        }
    };
    Vec3.prototype.nearEquals = function (other) {
        var eps = 1e-7;
        return (Math.abs(this.x - other.x) < eps &&
            Math.abs(this.y - other.y) < eps &&
            Math.abs(this.z - other.z) < eps);
    };
    Vec3.prototype.plusEquals = function (other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    };
    Vec3.prototype.minusEquals = function (other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
    };
    Vec3.prototype.negated = function () {
        return new Vec3(-this.x, -this.y, -this.z);
    };
    Vec3.prototype.reflect = function (N) {
        return this.subtract(N.scale(2 * this.dot(N)));
    };
    Vec3.refract = function (uv, n, eta1_over_eta2) {
        var cosTheta = Math.min(uv.negated().dot(n), 1);
        var rOutPerp = uv.add(n.scale(cosTheta)).scale(eta1_over_eta2);
        var rOutParallel = n.scale(-Math.sqrt(1 - rOutPerp.lengthSquared()));
        return rOutPerp.add(rOutParallel);
    };
    Vec3.prototype.add = function (other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    };
    Vec3.prototype.subtract = function (other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    };
    Vec3.prototype.scale = function (scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    };
    Vec3.prototype.scaled = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    };
    Vec3.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    Vec3.prototype.lengthSquared = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    };
    Vec3.prototype.normalized = function () {
        var length = this.length();
        return this.scale(1.0 / length);
    };
    Vec3.prototype.dot = function (other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    };
    Vec3.prototype.cross = function (other) {
        return new Vec3(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x);
    };
    Vec3.prototype.copy = function () {
        return new Vec3(this.x, this.y, this.z);
    };
    Vec3.prototype.idx = function (i) {
        if (i == 2)
            return this.z;
        if (i == 1)
            return this.y;
        return this.x;
    };
    Vec3.ZERO = new Vec3(0, 0, 0);
    return Vec3;
}());
export { Vec3 };
var Point3 = /** @class */ (function (_super) {
    __extends(Point3, _super);
    function Point3(x, y, z) {
        return _super.call(this, x, y, z) || this;
    }
    return Point3;
}(Vec3));
export { Point3 };
