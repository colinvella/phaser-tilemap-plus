export default class Range {
    constructor() {
        this.makeEmpty();
    }

    extendTo(point) {
        if (this.min > point) {
            this.min = point;
        }
        if (this.max < point) {
            this.max = point;
        }
    }

    containsPoint(point) {
        return this.min <= point && point <= this.max;
    }

    containsRange(range) {
        return this.min <= range.min && this.max > range.max;
    }

    isEmpty() {
        return this.min > this.max;
    }

    makeEmpty() {
        this.min = Number.POSITIVE_INFINITY;
        this.max = Number.NEGATIVE_INFINITY;
    }

    length() {
        if (this.min > this.max) {
            return Number.NaN;
        }
        return this.max - this.min;
    }

    static intersection(r1, r2) {
        const range = new Range();
        range.min = Math.max(r1.min, r2.min);
        range.max = Math.min(r1.max, r2.max);
        if (range.min > range.max) {
            range.makeEmpty();
        }
        return range;
    }

    static bound(r1, r2) {
        const range = new Range();
        range.min = Math.min(r1.min, r2.min);
        range.max = Math.max(r1.max, r2.max);
        return range;
    }
}