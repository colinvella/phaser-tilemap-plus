import Vector from "./Vector";
import AABB from "./AABB";

export default class QuadTree {
    constructor(shapes, maxLevel, maxShapes) {
        this.maxLevel = maxLevel;
        this.maxShapes = maxShapes;
        if (shapes.length < maxShapes || maxLevel <= 1) {
            this.shapes = shapes;
        } else {
            const shapesAABB = AABB.fromAABBs(shapes.map(shape => shape.polygon.aabb));
            const pivot = shapesAABB.centre() 
            this.pivot = pivot;
            let straddling = [], topLeft = [], topRight = [], bottomLeft = [], bottomRight = [];
            // this node contains all shapes straddling pivot axes
            for (const shape of shapes) {
                const aabb = shape.polygon.aabb;
                if (aabb.right < pivot.x && aabb.bottom < pivot.y) {
                    topLeft.push(shape);
                } else if (aabb.left > pivot.x && aabb.bottom < pivot.y) {
                    topRight.push(shape);
                } else if (aabb.right < pivot.x && aabb.top > pivot.y) {
                    bottomLeft.push(shape);
                } else if (aabb.left > pivot.x && aabb.top > pivot.y) {
                    bottomRight.push(shape);
                } else {
                    straddling.push(shape);
                }
            }

            this.shapes = straddling;

            if (topLeft.length > 0) {
                this.topLeftNode = new QuadTree(topLeft, maxLevel - 1, maxShapes);
            }

            if (topRight.length > 0) {
                this.topRightNode = new QuadTree(topRight, maxLevel - 1, maxShapes);
            }

            if (bottomLeft.length > 0) {
                this.bottomLeftNode = new QuadTree(bottomLeft, maxLevel - 1, maxShapes);
            }

            if (bottomRight.length > 0) {
                this.bottomRightNode = new QuadTree(bottomRight, maxLevel - 1, maxShapes);
            }
        }
    }

    candidateShapes(aabb) {
        // check straddling
        let result = this.shapes.filter(shape => shape.polygon.aabb.intersects(aabb));

        const pivot = this.pivot;
        
        // nothing else to check if leaf node
        if (!pivot) {
            return result;
        }

        const topLeftNode = this.topLeftNode;
        if (topLeftNode && aabb.left <= pivot.x && aabb.top <= pivot.y) {
            // if aabb intersects top left node and it exists, recurse
            result = result.concat(topLeftNode.candidateShapes(aabb));
        }

        const topRightNode = this.topRightNode;
        if (topRightNode && aabb.right >= pivot.x && aabb.top <= pivot.y) {
            // if aabb intersects top right node and it exists, recurse
            result = result.concat(topRightNode.candidateShapes(aabb));
        }

        const bottomLeftNode = this.bottomLeftNode;
        if (bottomLeftNode && aabb.left <= pivot.x && aabb.bottom >= pivot.y) {
            // if aabb intersects bottom left node and it exists, recurse
            result = result.concat(bottomLeftNode.candidateShapes(aabb));
        }

        const bottomRightNode = this.bottomRightNode;
        if (bottomRightNode && aabb.right >= pivot.x && aabb.bottom >= pivot.y) {
            // if aabb intersects bottom right node and it exists, recurse
            result = result.concat(bottomRightNode.candidateShapes(aabb));
        }

        return result;
    }
}