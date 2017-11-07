import Vector from "./geometry/Vector";
import ConvexPolygon from "./geometry/ConvexPolygon";
import Range from "./geometry/Range";
import AABB from "./geometry/AABB";
import QuadTree from "./geometry/QuadTree";

export default class Physics {
    constructor(tilemapJson, events) {
        this.tilemapJson = tilemapJson;
        this.events = events;
        this.shapes = [];
        this.quadTree = new QuadTree([], 1, 1);
    }

    enableObjectLayer(objectLayerName) {
        const objectLayerJson = this.tilemapJson.layers.find(layer => layer.type === "objectgroup" && layer.name === objectLayerName);
        if (!objectLayerJson) {
            throw new Error(`No object layer found with name "${objectLayerName}"`);
        }

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
                // ignore text
            } else { // rectangle
                this.addRectangle(objectJson);
            }
        }
        this.quadTree = new QuadTree(this.shapes, 5, 5);        
    }

    collideWith(sprite) {
        const body = sprite.body;
        const gravity = sprite.game.physics.arcade.gravity;
        const gravityVector = new Vector(gravity.x, gravity.y);
        const gravityNormal = gravityVector.normalized();
        const velocity = new Vector(body.velocity.x, body.velocity.y);
        
        if (!body.contactNormal) {
            body.contactNormal = new Vector();            
        }
        body.contactNormal.x = body.contactNormal.y = 0;
        let totalPenetration = new Vector();
        let bounce = 0;

        const bodyAABB = new AABB(body.x - 1, body.y - 1, body.x + body.width + 1, body.y + body.height + 1);
        const candidateShapes = this.quadTree.candidateShapes(bodyAABB);
        const collidedShapes = [];
        for (const shape of candidateShapes) {
            const collision = shape.collideWidth(body);
            if (!collision) {
                continue;
            }

            const penetration = collision.penetration;
            const normal = collision.normal;

            // if moving away, no resitution to compute
            const speedNormal = velocity.dot(normal);
            if (speedNormal >= 0) {
                continue;
            }
            
            // accumulate normal from multiple shapes
            body.contactNormal = body.contactNormal.plus(normal);

            // accumulate penetration
            totalPenetration = totalPenetration.plus(penetration);

            // accumulate bounce
            const properties = shape.properties;
            const shapeBounce = properties.bounce;
            if (shapeBounce) {
                bounce += shapeBounce;
            }

            // track collided shapes for event notification
            collidedShapes.push(shape);
        }

        // resolve penetration
        body.x -= totalPenetration.x;
        body.y -= totalPenetration.y;
                
        body.contactNormal = body.contactNormal.normalized();
        const normal = body.contactNormal;

        const speedNormal = velocity.dot(normal);        
            
        // decompose old velocity into normal and tangent components
        const velocityNormal = normal.scale(speedNormal);
        const velocityTangent = velocity.minus(velocityNormal);

        // compute restitution on normal component
        let newVelocityNormal;
        newVelocityNormal = velocityNormal.scale(-bounce);

        // todo: compute friction on tangent component                
        const newVelocityTangent = velocityTangent;
        
        const newVelocity = newVelocityNormal.plus(newVelocityTangent);

        body.velocity.x = newVelocity.x;
        body.velocity.y = newVelocity.y;

        // notify event system
        this.events.collisions.notify(sprite, collidedShapes, velocity, newVelocity);
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