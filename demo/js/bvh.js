import { AABB } from "./aabb.js";
import { Interval } from "./interval.js";
import { randomInt } from "./utils.js";
var BVHNode = /** @class */ (function () {
    function BVHNode(objects, start, end) {
        var axis = randomInt(3);
        var comparator;
        comparator =
            axis == 0 ? boxXCompare : axis == 1 ? boxYCompare : boxZCompare;
        var objSpan = end - start;
        if (objSpan == 1) {
            this.left = this.right = objects[start];
        }
        else if (objSpan == 2) {
            if (comparator(objects[start], objects[start + 1]) < 0) {
                this.left = objects[start];
                this.right = objects[start + 1];
            }
            else {
                this.left = objects[start + 1];
                this.right = objects[start];
            }
        }
        else {
            objects = objects.slice(start, end).sort(comparator);
            var mid = Math.floor(objects.length / 2);
            this.left = new BVHNode(objects, 0, mid);
            this.right = new BVHNode(objects, mid, objects.length);
        }
        this.bbox = AABB.fromAABBs(this.left.boundingBox(), this.right.boundingBox());
    }
    BVHNode.fromHittableList = function (list) {
        return new BVHNode(list.objects, 0, list.objects.length);
    };
    BVHNode.prototype.hit = function (ray, tmin, tmax, rec) {
        if (!this.bbox.hit(ray, new Interval(tmin, tmax)))
            return false;
        var hitLeft = this.left.hit(ray, tmin, tmax, rec);
        var hitRight = this.right.hit(ray, tmin, hitLeft ? rec.t : tmax, rec);
        return hitLeft || hitRight;
    };
    BVHNode.prototype.boundingBox = function () {
        return this.bbox;
    };
    return BVHNode;
}());
export { BVHNode };
function boxCompare(a, b, axisIdx) {
    return a.boundingBox().axis(axisIdx).min < b.boundingBox().axis(axisIdx).min;
}
function boxXCompare(a, b) {
    return boxCompare(a, b, 0) ? -1 : 1;
}
function boxYCompare(a, b) {
    return boxCompare(a, b, 1) ? -1 : 1;
}
function boxZCompare(a, b) {
    return boxCompare(a, b, 2) ? -1 : 1;
}
