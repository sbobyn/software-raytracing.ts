var Interval = /** @class */ (function () {
    function Interval(min, max) {
        this.min = min;
        this.max = max;
    }
    Interval.fromIntervals = function (a, b) {
        return new Interval(Math.min(a.min, b.min), Math.max(a.max, b.max));
    };
    Interval.prototype.size = function () {
        return this.max - this.min;
    };
    Interval.prototype.expand = function (delta) {
        this.min -= delta;
        this.max += delta;
        return this;
    };
    Interval.prototype.contains = function (x) {
        return this.min <= x && x <= this.max;
    };
    Interval.prototype.surrounds = function (x) {
        return this.min < x && x < this.max;
    };
    Interval.empty = new Interval(Infinity, -Infinity);
    Interval.universe = new Interval(-Infinity, Infinity);
    return Interval;
}());
export { Interval };
