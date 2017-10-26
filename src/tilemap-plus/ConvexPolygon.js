import PolyDecomp from "poly-decomp";
import Vector from "./Vector";
import Range from "./Range";

const average = (array) => array.reduce( ( accumulator, value ) => accumulator + value, 0 ) / array.length;

export default class ConvexPolygon {
    constructor(vertices) {
        this.vertices = vertices;
        this.edges = [];
        this.normals = [];
        this.count = this.vertices.length;
        this.centre = new Vector(
            average(vertices.map(v => v.x)),
            average(vertices.map(v => v.y))
        );
        if (this.count > 1) {
            for (let i = 0; i < this.count; i++) {
                let j = (i + 1) % this.count;
                const edge = Vector.difference(vertices[j], vertices[i]);
                this.edges.push(edge);
                // generate outward normals
                let normal = edge.normalized().perpendicular();
                const radius = Vector.difference(vertices[i], this.centre);
                if (Vector.dot(radius, normal) < 0) {
                    normal = Vector.scale(normal, -1);
                }                
                this.normals.push(normal);
            }
        }
    }

    isValid() {
        if (this.count < 4) {
            return true;
        }
        let prevPerpDot = 0;
        for (let i = 0; i < this.count; i++) {
            let j = (i + 1) % this.count;
            const perpDot = Vector.perpDot(this.edges[i], this.edges[j]);
            if (perpDot * prevPerpDot < 0) {
                return false;
            }
            prevPerpDot = perpDot;
        }
        return true;
    }

    projectOntoAxis(axis) {
        const range = new Range();
        for (const vertex of this.vertices) {
            const projection = Vector.dot(vertex, axis);
            range.extendTo(projection);
        }
        return range;
    }

    static fromRectangle(left, top, right, bottom) {
        const vertices = [
            new Vector(left, top),
            new Vector(right, top),
            new Vector(right, bottom),
            new Vector(left, bottom)
        ];
        return new ConvexPolygon(vertices);
    }

    static generateConvexPolygons(vertices) {
        const pdVertices = vertices.map(v => [v.x, v.y]);
        const pdConvexPolygons = PolyDecomp.decomp(pdVertices);
        const convexPolygons = pdConvexPolygons.map(pdConvexPolygon =>
            new ConvexPolygon(pdConvexPolygon.map(pdVertex =>
                new Vector(pdVertex[0], pdVertex[1]))
            )
        );
        return convexPolygons;
    }
}

const cps = ConvexPolygon.generateConvexPolygons([
    new Vector(0, 0),
    new Vector(1, 0),
    new Vector(0.4, 0.4),
    new Vector(0, 1)]);

console.log(cps);