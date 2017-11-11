import Vector from "./Vector";

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

    centre() {
        return new Vector((this.left + this.right) * 0.5, (this.top + this.bottom) * 0.5);
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
        const result =
            this.left <= aabb.right &&
            this.right >= aabb.left &&
            this.top <= aabb.bottom &&
            this.bottom >= aabb.top;
        return result;
    }

    translated(offset) {
        return new AABB(
            this.left + offset.x,
            this.top + offset.y,
            this.right + offset.x,
            this.bottom + offset.y
        );
    }

    static fromPoints(points) {
        let left = Number.POSITIVE_INFINITY,
            top = Number.POSITIVE_INFINITY,
            right = Number.NEGATIVE_INFINITY,
            bottom = Number.NEGATIVE_INFINITY;

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

    static fromAABBs(aabbs) {
        let left = Number.POSITIVE_INFINITY,
            top = Number.POSITIVE_INFINITY,
            right = Number.NEGATIVE_INFINITY,
            bottom = Number.NEGATIVE_INFINITY;

        if (Array.isArray(aabbs)) {
            left = Math.min(...aabbs.map(aabb => aabb.left));
            top = Math.min(...aabbs.map(aabb => aabb.top));
            right = Math.max(...aabbs.map(aabb => aabb.right));
            bottom = Math.max(...aabbs.map(aabb => aabb.bottom));
        } else {
            left = Math.min(left, aabb.left);
            top = Math.min(top, aabb.top);
            right = Math.max(right, aabb.right);
            bottom = Math.max(bottom, aabb.bottom);
        }

        return new AABB(left, top, right, bottom);
    }
}

