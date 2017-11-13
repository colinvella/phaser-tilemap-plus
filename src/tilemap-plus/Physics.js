import Vector from "./geometry/Vector";
import ConvexPolygon from "./geometry/ConvexPolygon";
import Range from "./geometry/Range";
import AABB from "./geometry/AABB";
import ShapeLayer from "./geometry/ShapeLayer";

export default class Physics {
    constructor(tilemapJson, events) {
        this.tilemapJson = tilemapJson;
        this.events = events;
    }

    enableObjectLayer(objectLayerName) {
        const objectLayerJson = this.tilemapJson.layers.find(layer => layer.type === "objectgroup" && layer.name === objectLayerName);
        if (!objectLayerJson) {
            throw new Error(`No object layer found with name "${objectLayerName}"`);
        }

        this.shapeLayer = new ShapeLayer(objectLayerJson);
    }

    collideWith(sprite) {
        if (!this.shapeLayer) {
            return;
        }

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
        const candidateShapes = this.shapeLayer.quadTree.candidateShapes(bodyAABB);
        const collidedShapes = [];
        for (const shape of candidateShapes) {
            const collision = shape.collideWidth(body);
            if (!collision) {
                continue;
            }


            // if moving away, no restitution to compute
            const normal = collision.normal;
            const speedNormal = velocity.dot(normal);
            if (speedNormal >= 0) {
                continue;
            }

            const penetration = collision.penetration;
            
            const shapeProperties = shape.properties;

            // handle one way collisions e.g. for pass-through platforms
            const collideOnly = shapeProperties.collideOnly;
            if (collideOnly) {
                const delta = new Vector(body.x - body.prev.x, body.y - body.prev.y);
                const outsideDelta = delta.minus(penetration);
                const wasOutside = outsideDelta.dot(normal) >= -1; 

                if (collideOnly === "down") {
                    if (velocity.y < 0 || normal.y >= 0 || !wasOutside) {
                        continue;
                    }    
                    const foo = 1;
                }    
                if (collideOnly === "up") {
                    if (velocity.y > 0 || normal.y <= 0 || !wasOutside) {
                        continue;
                    }    
                    const foo = 1;
                }    
                if (collideOnly === "right") {
                    if (velocity.x < 0 || normal.x >= 0 || !wasOutside) {
                        continue;
                    }    
                    const foo = 1;
                }    
                if (collideOnly === "left") {
                    if (velocity.x > 0 || normal.x <= 0 || !wasOutside) {
                        continue;
                    }    
                    const foo = 1;
                }    
            }

            
            // accumulate normal from multiple shapes
            body.contactNormal = body.contactNormal.plus(normal);

            // accumulate penetration
            totalPenetration = totalPenetration.plus(penetration);

            // accumulate bounce
            const shapeBounce = shapeProperties.bounce;
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
        this.events.collisions.notify(sprite, collidedShapes, velocity, newVelocity, normal);
    }
}