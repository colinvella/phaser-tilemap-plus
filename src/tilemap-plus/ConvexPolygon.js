import PolyDecomp from "poly-decomp";
import Vector from "./Vector";
import AABB from "./AABB";
import Range from "./Range";

const average = (array) => array.reduce( ( accumulator, value ) => accumulator + value, 0 ) / array.length;

const validateBounds = (left, top, right, bottom) => {
    if (left > right) {
        throw new Error("Right must be greater than Left");
    }
    if (top > bottom) {
        throw new Error("Bottom must be greater than Top");
    }
};

export default class ConvexPolygon {
    constructor(vertices) {
        this.vertices = vertices;
        this.recompute();
    }

    recompute() {
        const vertices = this.vertices;
        this.aabb = AABB.fromPoints(vertices);
        this.edges = [];
        this.normals = [];
        this.count = vertices.length;
        this.centre = new Vector(
            average(vertices.map(v => v.x)),
            average(vertices.map(v => v.y))
        );
        
        if (this.count > 1) {
            for (let i = 0; i < this.count; i++) {
                let j = (i + 1) % this.count;
                const edge = vertices[j].minus(vertices[i]);
                this.edges.push(edge);
                // generate outward normals
                let normal = edge.normalized().perpendicular();
                const radius = vertices[i].minus(this.centre);
                if (radius.dot(normal) < 0) {
                    normal = normal.scale(-1);
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
            const perpDot = this.edges[i].perpDot(this.edges[j]);
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
            const projection = vertex.dot(axis);
            range.extendTo(projection);
        }
        return range;
    }

    rotated(angle) {
        const rotatedVertices = [];
        for (const vertex of this.vertices) {
            const vertexOffset = new Vector(vertex.x, vertex.y).minus(this.centre);
            const rotatedOffset = vertexOffset.rotated(angle);
            const rotatedVertex = this.centre.plus(rotatedOffset);
            rotatedVertices.push(rotatedVertex);
        }
        return new ConvexPolygon(rotatedVertices);
    }

    translated(offset) {
        const translatedVertices = this.vertices.map(vertex => vertex.plus(offset));
        return new ConvexPolygon(translatedVertices);
    }

    static fromRectangle(left, top, right, bottom) {
        validateBounds(left, top, right, bottom);

        const vertices = [
            new Vector(left, top),
            new Vector(right, top),
            new Vector(right, bottom),
            new Vector(left, bottom)
        ];
        return new ConvexPolygon(vertices);
    }

    static fromCapsule(left, top, right, bottom, capSegments) {
        if (capSegments < 3) {
            throw new Error("Specify at least 3 cap segments");
        }
        validateBounds(left, top, right, bottom);
        const width = right - left;
        const height = bottom - top;        
        if (height < width) {
            throw new Error("Capsule height must be larger than width");
        }
        const capRadius = width * 0.5;
        const capAngles = [...Array(capSegments).keys()].map(index => -index * Math.PI / capSegments);

        const centreX = (left + right) * 0.5;
        const capVertices = capAngles.map(angle => new Vector(Math.cos(angle), Math.sin(angle)).scale(capRadius));
        const topCapFocus = new Vector(centreX, top + capRadius);
        let vertices = capVertices.map(capVertex => topCapFocus.plus(capVertex));
        vertices.push(new Vector(left, topCapFocus.y));
        const bottomCapFocus = new Vector(centreX, bottom - capRadius);
        vertices = vertices.concat(capVertices.map(capVertex => bottomCapFocus.minus(capVertex)));
        vertices.push(new Vector(right, bottomCapFocus.y));

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
