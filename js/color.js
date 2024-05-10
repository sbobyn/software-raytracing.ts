import { randomInRange } from "./utils.js";
var Color3 = /** @class */ (function () {
    function Color3(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Color3.prototype.copy = function (other) {
        this.r = other.r;
        this.g = other.g;
        this.b = other.b;
    };
    Color3.random = function (min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return new Color3(randomInRange(min, max), randomInRange(min, max), randomInRange(min, max));
    };
    Color3.prototype.mul = function (other) {
        return new Color3(this.r * other.r, this.g * other.g, this.b * other.b);
    };
    Color3.prototype.add = function (other) {
        return new Color3(this.r + other.r, this.g + other.g, this.b + other.b);
    };
    Color3.prototype.plusEquals = function (other) {
        this.r += other.r;
        this.g += other.g;
        this.b += other.b;
    };
    Color3.prototype.scale = function (t) {
        return new Color3(t * this.r, t * this.g, t * this.b);
    };
    Color3.prototype.scaled = function (scalar) {
        this.r *= scalar;
        this.g *= scalar;
        this.b *= scalar;
        return this;
    };
    Color3.BLACK = new Color3(0, 0, 0);
    Color3.WHITE = new Color3(1, 1, 1);
    Color3.SKY_BLUE = new Color3(0.5, 0.7, 1);
    Color3.RED = new Color3(1, 0, 0);
    Color3.CYAN = new Color3(0, 1, 1);
    Color3.YELLOW = new Color3(1, 1, 0);
    return Color3;
}());
export { Color3 };
