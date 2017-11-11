import Vector from "./Vector";
import ConvexPolygon from "./ConvexPolygon";
import Range from "./Range";
import AABB from "./AABB";
import QuadTree from "./QuadTree";

export default class ShapeLayer {
    constructor(objectLayerJson) {
        this.objectLayerJson = objectLayerJson;

        this.shapes = [];
        for (const objectJson of objectLayerJson.objects) {
            if (objectJson.polygon) {
                this.addPolygon(objectJson);
            } else if (objectJson.polyline) {
                // ignore poly line
            } else if (objectJson.ellipse) {
                // ignore ellipse
            } else if (objectJson.gid) {
                // ignore tile
            } else if (objectJson.text) {
                // treat text as rectangle
                this.addRectangle(objectJson);
            } else { // rectangle
                this.addRectangle(objectJson);
            }
        }

        this.quadTree = new QuadTree(this.shapes, 5, 5);        
    }

    addRectangle(objectJson) {
        // convert to convex polygon
        const width = objectJson.width;
        const height = objectJson.height;
        let widthVector = new Vector(width, 0);
        let heightVector = new Vector(0, height);
        // handle box rotation
        const angle = -objectJson.rotation * Math.PI / 180;
        if (angle) {
            widthVector = widthVector.rotated(angle);
            heightVector = heightVector.rotated(angle);
        }
        const polygonJson = {
            x: objectJson.x,
            y: objectJson.y,
            width: objectJson.width,
            height: objectJson.height,
            polygon: [{x: 0, y: 0}, widthVector, widthVector.plus(heightVector), heightVector],
            properties: objectJson.properties || {}
        };
        this.addPolygon(polygonJson);
    }

    addPolygon(objectJson) {
        const vertices = objectJson.polygon.map(
            point => new Vector(objectJson.x + point.x, objectJson.y + point.y)
        );
        const convexPolygons = ConvexPolygon.generateConvexPolygons(vertices);
        for (const convexPolygon of convexPolygons) {
            this.addConvexPolygon(convexPolygon, objectJson.properties || {});
        }
    }

    addConvexPolygon(convexPolygon, properties) {
        const aabb = convexPolygon.aabb;

        const shape = {            
            type: "polygon",
            left: aabb.left,
            top: aabb.top,
            right: aabb.right,
            bottom: aabb.bottom,
            polygon: convexPolygon,
            properties: properties || {},
            collideWidth: function(body) {
                const sprite = body.sprite;
                const spritePosition = new Vector(sprite.x, sprite.y);
                const bodyLeft = body.x;
                const bodyRight = body.x + body.width;
                const bodyTop = body.y;
                const bodyBottom = body.y + body.height;

                let axes;

                let spritePolygon;
                if (body.plus && body.plus.shape) {
                    spritePolygon = body.plus.shape.translated(spritePosition);

                    // sat axes - more complex shape - all edge normals
                    axes = spritePolygon.normals.concat(this.polygon.normals);
                } else {
                    spritePolygon = ConvexPolygon.fromRectangle(bodyLeft, bodyTop, bodyRight, bodyBottom);

                    // sat axes - 2 ortho axis normals and object poly normals
                    // first 2 normals prune search when sprite out of object bounding box
                    axes = [new Vector(1, 0), new Vector(0, 1)].concat(this.polygon.normals);
                }

                let minPenetration = Number.POSITIVE_INFINITY;
                let minNormal;
                for (const axis of axes) {
                    const objectRange = this.polygon.projectOntoAxis(axis);
                    const spriteRange = spritePolygon.projectOntoAxis(axis);
                    const intersection = Range.intersection(objectRange, spriteRange);
                    if (intersection.isEmpty()) {
                        return null;
                    }

                    // intersection.length() not good enough for small objects
                    // need to compute min of two potential penetrations from opposite sides
                    let penetration = Math.min(
                        Math.abs(objectRange.max - spriteRange.min),
                        Math.abs(spriteRange.max - objectRange.min));
                    if (minPenetration > penetration) {
                        minPenetration = penetration;
                        minNormal = axis;
                    }
                }
                
                // ensure normal pointing towards sprite
                const spriteOffset = spritePolygon.centre.minus(this.polygon.centre);
                if (spriteOffset.dot(minNormal) < 0) {
                    minNormal = minNormal.scale(-1);
                }

                const collision = {
                    penetration: minNormal.scale(-minPenetration),
                    normal: minNormal
                };

                return collision;
            }
        };
        this.shapes.push(shape);
    }
}