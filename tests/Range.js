import { expect } from "chai";

import Range from "../src/tilemap-plus/geometry/Range";

describe("Range", () => {
    let min, max, range, min2, max2, range2, point;

    beforeEach(() => {
        min = Math.random();
        max = Math.random();
        if (min > max) {
            [min, max] = [max, min];
        }
        range = new Range();
        range.min = min;
        range.max = max;
    
        min2 = Math.random();
        max2 = Math.random();
        if (min2 > max2) {
            [min2, max2] = [max2, min2];
        }
        range2 = new Range();
        range2.min = min2;
        range2.max = max2;

        point = Math.random();
    });

    it("should compute interval length", () => {
        expect(range.length()).to.equal(max - min);
    });

    it("should extend to a point", () => {
        range.extendTo(point);
        expect(range.min).to.lte(point);
        expect(range.max).to.gte(point);
    });

    it("should contain a point within min and max", () => {
        expect(range.containsPoint(point)).to.equal(min <= point && point <= max);
    });

    it("should contain a range within min and max", () => {
        expect(range.containsRange(range2)).to.equal(min <= min2 && max2 <= max);
    });

    it("should be empty when min > max", () => {
        range.min = Math.random();
        range.max = Math.random();
        expect(range.isEmpty()).to.equal(range.min > range.max);
    });

    it("should compute intersection", () => {
        const intersection = Range.intersection(range, range2);
        if (max < min2 || min > max2) {
            expect(intersection.length()).to.be.NaN;
        } else {
            const len = Math.min(max, max2) - Math.max(min, min2);
            expect(intersection.length()).to.equal(len);
        }
    });

    it("should compute bound", () => {
        const bound = Range.bound(range, range2);
        expect(bound.min).to.equal(Math.min(min, min2));
        expect(bound.max).to.equal(Math.max(max, max2));
    });
});