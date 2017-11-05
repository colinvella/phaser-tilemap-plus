import { expect } from "chai";

import Vector from "../src/tilemap-plus/geometry/Vector";
import AABB from "../src/tilemap-plus/geometry/AABB";
import QuadTree from "../src/tilemap-plus/geometry/QuadTree";

const recursiveCount = (quadTree) => {
    let count = quadTree.shapes.length;

    if (quadTree.topLeftNode) {
        count += recursiveCount(quadTree.topLeftNode);
    }

    if (quadTree.topRightNode) {
        count += recursiveCount(quadTree.topRightNode);
    }

    if (quadTree.bottomLeftNode) {
        count += recursiveCount(quadTree.bottomLeftNode);
    }

    if (quadTree.bottomRightNode) {
        count += recursiveCount(quadTree.topLebottomRightNodeftNode);
    }

    return count;
}

describe("QuadTree", () => {
    let shapes = [];
    for (let i = 0; i < 4; i++) {
        shapes.push({
            polygon: {
                aabb: new AABB(-Math.random(), -Math.random(), Math.random(), Math.random()) 
            }
        });
    }
    let quadTree;

    beforeEach(() => {
        shapes = [];
        for (let i = 0; i < 4; i++) {
            shapes.push({
                polygon: {
                    aabb: new AABB(-Math.random(), -Math.random(), Math.random(), Math.random()) 
                }
            });
        }
        quadTree = new QuadTree(shapes, 10, 4);
    });  

    it("account for all shapes", () => {
        expect(shapes.length).to.equal(recursiveCount(quadTree));
    });
});