import { expect } from "chai";

import Vector from "../src/tilemap-plus/geometry/Vector";

describe("Vector", () => {
    const epsilon = 0.001;
    let x, y, vector, x2, y2, vector2, scale;

    beforeEach(() => {
        x = Math.random();
        y = Math.random();
        vector = new Vector(x, y);
    
        x2 = Math.random();
        y2 = Math.random();
        vector2 = new Vector(x2, y2);

        scale = Math.random();
    });

    it("should assign X and Y components in constructor", () => {
        expect(vector.x).to.equal(x);
        expect(vector.y).to.equal(y);
    });

    it("should clone", () => {
        const clone = vector.clone();
        expect(clone).to.not.equal(vector);
        expect(clone.x).to.equal(x);
        expect(clone.y).to.equal(y);
    });

    it("should compare based on x and y properties", () => {
        const otherObject = { x, y };
        expect(vector.equals(otherObject)).to.be.true;
    });

    it("should compute vector addition", () => {
        const result = vector.plus(vector2);
        expect(result.x).to.equal(x + x2);
        expect(result.y).to.equal(y + y2);
    });

    it("should compute vector difference", () => {
        const result = vector.minus(vector2);
        expect(result.x).to.equal(x - x2);
        expect(result.y).to.equal(y - y2);
    });

    it("should scale", () => {
        const result = vector.scale(scale);
        expect(result.x).to.equal(x * scale);
        expect(result.y).to.equal(y * scale);
    });

    it("should compute magnitude correctly from X and Y", () => {
        expect(vector.length()).to.equal(Math.sqrt(x * x + y * y));
    });

    it("should compute normalized vector", () => {
        const normal = vector.normalized();
        expect(normal.length()).to.closeTo(vector.length() > 0 ? 1 : 0, epsilon);
    });

    it("should compute dot product", () => {
        const result = vector.dot(vector2);
        expect(result).to.equal(x * x2 + y * y2);
    });

    it("should compute perp dot product", () => {
        const result = vector.perpDot(vector2);
        expect(result).to.equal(x * y2 - y * x2);
    });

    it("should compute perpendicular vector", () => {
        const perpendicular = vector.perpendicular();
        const dotResult = vector.dot(perpendicular);
        const perpDotResult = vector.perpDot(perpendicular);
        expect(dotResult).to.equal(0);
        expect(perpDotResult).to.closeTo(vector.length() * perpendicular.length(), epsilon);
    });

    it("should compute rotated vector", () => {
        const angle = Math.random();
        const rotated = vector.rotated(angle);
        expect(vector.length()).to.closeTo(rotated.length(), epsilon);
    });
});