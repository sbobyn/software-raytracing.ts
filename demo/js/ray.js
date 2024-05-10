var Ray = /** @class */ (function () {
    function Ray(orig, dir) {
        this.orig = orig;
        this.dir = dir;
    }
    Ray.prototype.at = function (t) {
        var scaledDir = this.dir.scale(t);
        return this.orig.add(scaledDir);
    };
    return Ray;
}());
export { Ray };
