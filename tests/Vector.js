import { expect } from "chai";

import Vector from "../src/tilemap-plus/Vector";

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

    it("should compute vector addition", () => {
        const result = Vector.sum(vector, vector2);
        expect(result.x).to.equal(x + x2);
        expect(result.y).to.equal(y + y2);
    });

    it("should compute vector difference", () => {
        const result = Vector.difference(vector, vector2);
        expect(result.x).to.equal(x - x2);
        expect(result.y).to.equal(y - y2);
    });

    it("should scale", () => {
        const result = Vector.scale(vector, scale);
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
        const result = Vector.dot(vector, vector2);
        expect(result).to.equal(x * x2 + y * y2);
    });

    it("should compute perp dot product", () => {
        const result = Vector.perpDot(vector, vector2);
        expect(result).to.equal(x * y2 - y * x2);
    });

    it("should compute perpendicular vector", () => {
        const perpendicular = vector.perpendicular();
        const dotResult = Vector.dot(vector, perpendicular);
        const perpDotResult = Vector.perpDot(vector, perpendicular);
        expect(dotResult).to.equal(0);
        expect(perpDotResult).to.closeTo(vector.length() * perpendicular.length(), epsilon);
    });
});