import { Color3 } from "./color.js";
import { Perlin } from "./perlin.js";
var SolidColor = /** @class */ (function () {
    function SolidColor(color) {
        this.color = color;
    }
    SolidColor.prototype.value = function (u, v, point) {
        return this.color;
    };
    return SolidColor;
}());
export { SolidColor };
var CheckerTextureXYZ = /** @class */ (function () {
    function CheckerTextureXYZ(c1, c2, scale) {
        this.c1 = c1;
        this.c2 = c2;
        this.invScale = 1 / scale;
    }
    CheckerTextureXYZ.prototype.value = function (u, v, point) {
        var xi = Math.floor(this.invScale * point.x);
        var yi = Math.floor(this.invScale * point.y);
        var zi = Math.floor(this.invScale * point.z);
        var isEven = (xi + yi + zi) % 2 == 0;
        return isEven ? this.c1 : this.c2;
    };
    return CheckerTextureXYZ;
}());
export { CheckerTextureXYZ };
var CheckerTextureUV = /** @class */ (function () {
    function CheckerTextureUV() {
    }
    CheckerTextureUV.prototype.value = function (u, v, point) {
        throw new Error("Method not implemented.");
    };
    return CheckerTextureUV;
}());
export { CheckerTextureUV };
var ImageTexture = /** @class */ (function () {
    function ImageTexture(filename) {
        this.width = 0;
        this.height = 0;
        this.buffer = null;
        this.load(filename);
    }
    ImageTexture.prototype.load = function (filename) {
        var _this = this;
        var image = new Image();
        image.onload = function () {
            _this.width = image.width;
            _this.height = image.height;
            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = _this.width;
            tempCanvas.height = _this.height;
            var tempContext = tempCanvas.getContext("2d");
            tempContext.drawImage(image, 0, 0, _this.width, _this.height);
            _this.buffer = tempContext.getImageData(0, 0, _this.width, _this.height).data;
        };
        image.src = filename;
    };
    ImageTexture.prototype.value = function (u, v, point) {
        if (this.buffer) {
            u = Math.abs((u * this.width) % this.width) >> 0;
            v = Math.abs(((1 - v) * this.height) % this.height) >> 0;
            var idx = (u + v * this.width) * 4;
            var r = this.buffer[idx];
            var g = this.buffer[idx + 1];
            var b = this.buffer[idx + 2];
            return new Color3(r / 255.0, g / 255.0, b / 255.0);
        }
        else {
            return Color3.CYAN; // for debugging
        }
    };
    return ImageTexture;
}());
export default ImageTexture;
var NoiseTexture = /** @class */ (function () {
    function NoiseTexture(scale) {
        this.noise = new Perlin();
        this.scale = scale;
    }
    NoiseTexture.prototype.value = function (u, v, point) {
        var s = point.scale(this.scale);
        return Color3.WHITE.scale(0.5 * (1.0 + Math.sin(s.z + 10 * this.noise.turb(s))));
    };
    return NoiseTexture;
}());
export { NoiseTexture };
