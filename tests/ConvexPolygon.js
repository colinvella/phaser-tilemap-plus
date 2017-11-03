import { expect } from "chai";

import Vector from "../src/tilemap-plus/geometry/Vector";
import ConvexPolygon from "../src/tilemap-plus/geometry/ConvexPolygon";

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
        expect(sampledEdge.dot(sampledNormal), `expected sampled normal perpendicular to edge`).to.closeTo(0, epsilon);
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

    it("should build a capsule approximation with the given cap segment count", () => {
        // need to refine this test
        const left = 20;
        const top = 20;
        const right = 40;
        const bottom = 80;
        const capSegments = 8;
        const capsule = ConvexPolygon.fromCapsule(left, top, right, bottom, capSegments);

        expect(capsule.edges.length, `expected ${2 + capSegments * 2} edges`).to.equal(2 + capSegments * 2);                    
    });

    it("should create a translated copy of itself", () => {
        let left = Math.random();
        let top = Math.random();
        let right = Math.random();
        let bottom = Math.random();
        if (left > right) {
            [left, right] = [right, left];
        }
        if (top > bottom) {
            [top, bottom] = [bottom, top];
        }
        const box1 = ConvexPolygon.fromRectangle(left, top, right, bottom);
        const offset = new Vector(Math.random(), Math.random());
        const box2 = box1.translated(offset);

        const rangeBox1X = box1.projectOntoAxis(new Vector(1, 0));
        const rangeBox2X = box2.projectOntoAxis(new Vector(1, 0));
        expect(rangeBox2X.max - rangeBox1X.max, `expected correct horizontal translation`).to.equal(offset.x);                    

        const rangeBox1Y = box1.projectOntoAxis(new Vector(0, 1));
        const rangeBox2Y = box2.projectOntoAxis(new Vector(0, 1));
        expect(rangeBox2Y.max - rangeBox1Y.max, `expected correct horizontal translation`).to.equal(offset.y);                    
    });
});