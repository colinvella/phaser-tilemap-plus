import { expect } from "chai";

import Vector from "../src/tilemap-plus/geometry/Vector";
import AABB from "../src/tilemap-plus/geometry/AABB";

describe("AABB", () => {
    beforeEach(() => {
    });

    it("should be empty when created", () => {
        const aabb = new AABB();
        expect(aabb.isEmpty()).to.be.true;
    });

    it("should enclose a single point", () => {
        const point = new Vector(Math.random(), Math.random());
        const aabb = AABB.fromPoints(point);
        expect(aabb.containsPoint(point)).to.be.true;
        expect(aabb.left).to.be.equal(point.x);
        expect(aabb.right).to.be.equal(point.x);
        expect(aabb.top).to.be.equal(point.y);
        expect(aabb.bottom).to.be.equal(point.y);
        expect(aabb.width()).to.be.equal(0);
        expect(aabb.height()).to.be.equal(0);
    });
    it("should enclose a set of points tightly", () => {
        const points = [...Array(10).keys()].map(index => new Vector(Math.random(), Math.random()));
        const aabb = AABB.fromPoints(points);
        const xMin = Math.min(...points.map(point => point.x));
        const yMin = Math.min(...points.map(point => point.y));
        const xMax = Math.max(...points.map(point => point.x));
        const yMax = Math.max(...points.map(point => point.y));
        expect(aabb.left).to.be.equal(xMin);
        expect(aabb.top).to.be.equal(yMin);
        expect(aabb.right).to.be.equal(xMax);
        expect(aabb.bottom).to.be.equal(yMax);
    });    
});