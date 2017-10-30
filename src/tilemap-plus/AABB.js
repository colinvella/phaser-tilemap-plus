export default class AABB {
    constructor(left, top, right, bottom) {
        this.left = left === undefined ? Number.POSITIVE_INFINITY : left;
        this.right = right === undefined ? Number.NEGATIVE_INFINITY : right;
        this.top = top === undefined ? Number.POSITIVE_INFINITY : top;
        this.bottom = bottom === undefined ? Number.NEGATIVE_INFINITY : bottom;
    }

    isEmpty() {
        return this.left > this.right || this.top > this.bottom;
    }

    width() {
        const width = this.right - this.left;
        return width >= 0 ? width : NaN;
    }

    height() {
        const height = this.bottom - this.top;
        return height >= 0 ? height : NaN;
    }

    containsPoint(point) {
        return this.left <= point.x && point.x <= this.right
            && this.top <= point.y && point.y <= this.bottom;
    }

    containsPoints(points) {
        for (const point of points) {
            if (!this.containsPoint(point)) {
                return false;
            }
        }
        return true;
    }

    intersects(aabb) {
        return
            this.left <= aabb.right &&
            this.right >= aabb.left &&
            this.top <= aabb.bottom &&
            this.bottom >= aabb.top;
    }

    static fromPoints(points) {
        let left, top, right, bottom;
        if (Array.isArray(points)) {
            left = Math.min(...points.map(point => point.x));
            top = Math.min(...points.map(point => point.y));
            right = Math.max(...points.map(point => point.x));
            bottom = Math.max(...points.map(point => point.y));
        } else {
            left = points.x;
            top = points.y;
            right = points.x;
            bottom = points.y;
        }
        return new AABB(left, top, right, bottom);
    }
}

