import { Vec3 } from "./vector.js";
import { randomInt } from "./utils.js";
var Perlin = /** @class */ (function () {
    function Perlin() {
        this.pointCount = 256;
        this.randvecs = [];
        for (var i = 0; i < this.pointCount; i++) {
            this.randvecs.push(Vec3.randomUnitVector());
        }
        this.permX = new Float32Array(this.pointCount);
        this.permY = new Float32Array(this.pointCount);
        this.permZ = new Float32Array(this.pointCount);
        this.generatePermutation(this.permX, this.pointCount);
        this.generatePermutation(this.permY, this.pointCount);
        this.generatePermutation(this.permZ, this.pointCount);
    }
    Perlin.prototype.turb = function (p, depth) {
        if (depth === void 0) { depth = 7; }
        var accum = 0.0;
        var tempP = p.copy();
        var weight = 1.0;
        for (var i = 0; i < depth; i++) {
            accum += weight * this.noise(tempP);
            weight *= 0.5;
            tempP.scaled(2);
        }
        return Math.abs(accum);
    };
    Perlin.prototype.noise = function (p) {
        var u = p.x - Math.floor(p.x);
        var v = p.y - Math.floor(p.y);
        var w = p.z - Math.floor(p.z);
        u = u * u * (3 - 2 * u);
        v = v * v * (3 - 2 * v);
        w = w * w * (3 - 2 * w);
        var i = Math.floor(p.x);
        var j = Math.floor(p.y);
        var k = Math.floor(p.z);
        var c = [
            [
                [Vec3.ZERO, Vec3.ZERO],
                [Vec3.ZERO, Vec3.ZERO],
            ],
            [
                [Vec3.ZERO, Vec3.ZERO],
                [Vec3.ZERO, Vec3.ZERO],
            ],
        ];
        for (var di = 0; di < 2; di++)
            for (var dj = 0; dj < 2; dj++)
                for (var dk = 0; dk < 2; dk++)
                    c[di][dj][dk] =
                        this.randvecs[this.permX[(i + di) & 255] ^
                            this.permY[(j + dj) & 255] ^
                            this.permZ[(k + dk) & 255]];
        return this.perlinInterp(c, u, v, w);
    };
    Perlin.prototype.perlinInterp = function (c, u, v, w) {
        var uu = u * u * (3 - 2 * u);
        var vv = v * v * (3 - 2 * v);
        var ww = w * w * (3 - 2 * w);
        var accum = 0.0;
        for (var i = 0; i < 2; i++)
            for (var j = 0; j < 2; j++)
                for (var k = 0; k < 2; k++) {
                    var weightv = new Vec3(u - i, v - j, w - k);
                    accum +=
                        (i * uu + (1 - i) * (1 - uu)) *
                            (j * vv + (1 - j) * (1 - vv)) *
                            (k * ww + (1 - k) * (1 - ww)) *
                            c[i][j][k].dot(weightv);
                }
        return accum;
    };
    Perlin.prototype.generatePermutation = function (arr, n) {
        for (var i = 0; i < n; i++)
            arr[i] = i;
        for (var i = n - 1; i > 0; i--) {
            var target = randomInt(i);
            // swap positions
            var tmp = arr[i];
            arr[i] = arr[target];
            arr[target] = tmp;
        }
    };
    return Perlin;
}());
export { Perlin };
