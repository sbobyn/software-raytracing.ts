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
import { Color3 } from "./color.js";
import { SolidColor } from "./texture.js";
import { Vec3 } from "./vector.js";
var BaseMaterial = /** @class */ (function () {
    function BaseMaterial() {
    }
    BaseMaterial.prototype.scatter = function (inRay, rec, attenuation, scattered) {
        throw new Error("Method not implemented.");
    };
    BaseMaterial.prototype.emitted = function (u, v, p) {
        return new Color3(0, 0, 0); // Default to no light emitted
    };
    return BaseMaterial;
}());
// roughness between 0 and 1
var Metal = /** @class */ (function (_super) {
    __extends(Metal, _super);
    function Metal(texture, roughness) {
        if (roughness === void 0) { roughness = 0; }
        var _this = _super.call(this) || this;
        _this.texture = texture;
        _this.roughness = roughness;
        return _this;
    }
    Metal.prototype.scatter = function (inRay, rec, attenuation, scattered) {
        var reflected = inRay.dir.normalized().reflect(rec.normal);
        scattered.orig = rec.p;
        scattered.dir = reflected.add(Vec3.randomUnitVector().scale(this.roughness));
        attenuation.copy(this.texture.value(rec.u, rec.v, rec.p));
        return scattered.dir.dot(rec.normal) > 0;
    };
    return Metal;
}(BaseMaterial));
export { Metal };
export var Distribution;
(function (Distribution) {
    Distribution[Distribution["Uniform"] = 0] = "Uniform";
    Distribution[Distribution["Lambertian"] = 1] = "Lambertian";
})(Distribution || (Distribution = {}));
var Diffuse = /** @class */ (function (_super) {
    __extends(Diffuse, _super);
    function Diffuse(texture, roughness, distribution, absorbtionProbability) {
        if (roughness === void 0) { roughness = 1; }
        if (distribution === void 0) { distribution = Distribution.Lambertian; }
        if (absorbtionProbability === void 0) { absorbtionProbability = 0; }
        var _this = _super.call(this) || this;
        _this.texture = texture;
        _this.roughness = roughness;
        _this.distribution = distribution;
        _this.absorbtionProbability = absorbtionProbability;
        return _this;
    }
    Diffuse.prototype.scatter = function (inRay, rec, attenuation, scattered) {
        var reflected;
        switch (this.distribution) {
            case Distribution.Uniform:
                reflected = Vec3.randomOnHemisphere(rec.normal);
                break;
            case Distribution.Lambertian:
                reflected = rec.normal.add(Vec3.randomUnitVector().scale(this.roughness));
                if (reflected.nearEquals(Vec3.ZERO))
                    reflected = rec.normal;
                break;
        }
        scattered.orig = rec.p;
        scattered.dir = reflected;
        var rayAbsorbed = Math.random() < this.absorbtionProbability;
        attenuation.copy(rayAbsorbed
            ? Color3.BLACK
            : this.texture
                .value(rec.u, rec.v, rec.p)
                .scale(1 - this.absorbtionProbability));
        return true;
    };
    return Diffuse;
}(BaseMaterial));
export { Diffuse };
var Dielectric = /** @class */ (function (_super) {
    __extends(Dielectric, _super);
    function Dielectric(refractiveIndex) {
        var _this = _super.call(this) || this;
        _this.ir = refractiveIndex;
        return _this;
    }
    Dielectric.prototype.scatter = function (inRay, rec, attenuation, scattered) {
        attenuation.copy(Color3.WHITE);
        var refractionRatio = rec.frontface ? 1.0 / this.ir : this.ir;
        var unitDir = inRay.dir.normalized();
        var cosTheta = Math.min(unitDir.negated().dot(rec.normal), 1);
        var sinTheta = Math.sqrt(1 - Math.pow(cosTheta, 2));
        var cannotRefract = refractionRatio * sinTheta > 1;
        var direction;
        if (cannotRefract ||
            Dielectric.reflectance(cosTheta, refractionRatio) > Math.random())
            direction = unitDir.reflect(rec.normal);
        else
            direction = Vec3.refract(unitDir, rec.normal, refractionRatio);
        scattered.orig = rec.p;
        scattered.dir = direction;
        return true;
    };
    // Schlick's approximation
    // https://en.wikipedia.org/wiki/Schlick%27s_approximation
    Dielectric.reflectance = function (cosTheta, refIndex) {
        var r0 = (1 - refIndex) / (1 + refIndex);
        r0 = r0 * r0;
        return r0 + (1 - r0) * Math.pow(1 - cosTheta, 5);
    };
    return Dielectric;
}(BaseMaterial));
export { Dielectric };
var DiffuseLight = /** @class */ (function (_super) {
    __extends(DiffuseLight, _super);
    function DiffuseLight(a) {
        if (a === void 0) { a = new SolidColor(Color3.WHITE); }
        var _this = _super.call(this) || this;
        _this.emit = a;
        return _this;
    }
    DiffuseLight.prototype.scatter = function (inRay, rec, attenuation, scattered) {
        return false;
    };
    DiffuseLight.prototype.emitted = function (u, v, p) {
        return this.emit.value(u, v, p);
    };
    return DiffuseLight;
}(BaseMaterial));
export { DiffuseLight };
