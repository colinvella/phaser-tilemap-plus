import { expect } from "chai";

import Vector from "../src/tilemap-plus/Vector";
import ConvexPolygon from "../src/tilemap-plus/ConvexPolygon";

describe("ConvexPolygon", () => {
    const epsilon = 0.001;
    
    beforeEach(() => {
    });

    it("should build an n-sided convex polygon with correct edges and normals", () => {
        const sideCount = Math.floor(Math.random() * 100);
        const indices = [...Array(sideCount).keys()]; 
        const angles = indices.map(index => Math.random() * Math.PI * 2);
        angles.sort();
        const vertices = angles.map(angle => new Vector(Math.cos(angle), Math.sin(angle)));
        const convexPolygon = new ConvexPolygon(vertices);
        expect(convexPolygon.vertices.length, `expected ${sideCount} vertices`).to.equal(sideCount);            
        expect(convexPolygon.edges.length, `expected ${sideCount} edges`).to.equal(sideCount);            
        expect(convexPolygon.normals.length, `expected ${sideCount} normals`).to.equal(sideCount);            

        const randomSideIndex = Math.floor(Math.random() * sideCount);
        const vertex1 = vertices[randomSideIndex];
        const vertex2 = vertices[(randomSideIndex + 1) % sideCount];
        const edge = vertex2.minus(vertex1);
        const sampledEdge = convexPolygon.edges[randomSideIndex];
        const sampledNormal = convexPolygon.normals[randomSideIndex];
        expect(sampledEdge.equals(edge), `expected correct computation on edge sample`).to.be.true;
        expect(sampledNormal.length(), `expected normal magnitude on normal sample`).to.closeTo(1, epsilon);
        expect(Vector.dot(sampledEdge, sampledNormal), `expected sampled normal perpendicular to edge`).to.closeTo(0, epsilon);
    });

    it("should build polygon from rectangle definition", () => {
        const left = Math.random();
        const top = Math.random();
        const right = Math.random();
        const bottom = Math.random();
        const width = Math.abs(right - left);
        const height = Math.abs(bottom - top);
        if ((right < left) || (bottom < top)) {
            expect(() => ConvexPolygon.fromRectangle(left, top, right, bottom)).to.throw(Error);
        } else {
            const convexPolygon = ConvexPolygon.fromRectangle(left, top, right, bottom);
            expect(convexPolygon.vertices.length, "4 vertices").to.equal(4);            

            const horizontalProjection = convexPolygon.projectOntoAxis(new Vector(1, 0));
            const verticalProjection = convexPolygon.projectOntoAxis(new Vector(0, 1));

            expect(horizontalProjection.length(), "correct polygon width").to.be.equal(width);
            expect(verticalProjection.length() ,"correct polygon height").to.be.equal(height);
        }
    });
});