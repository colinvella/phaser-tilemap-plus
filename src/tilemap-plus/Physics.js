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
        
        if (!body.plus) {
            body.plus = {};
        }
        const plus = body.plus;
        plus.contactNormals = [];
        plus.penetrations = [];
        
        if (!plus.contactNormal) {
            plus.contactNormal = new Vector();            
        }
        plus.contactNormal.x = plus.contactNormal.y = 0;
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

            // detect entry into shape from previous position
            const delta = new Vector(body.x - body.prev.x, body.y - body.prev.y);
            const outsideDelta = delta.minus(penetration);
            const wasOutside = outsideDelta.dot(normal) >= -1; 
            if (!wasOutside) {
                continue;
            }
            
            const shapeProperties = shape.properties;

            // handle one way collisions e.g. for pass-through platforms
            const collideOnly = shapeProperties.collideOnly;
            if (collideOnly) {

                if (collideOnly === "down") {
                    if (velocity.y < 0 || normal.y >= 0) {
                        continue;
                    }    
                }    
                if (collideOnly === "up") {
                    if (velocity.y > 0 || normal.y <= 0) {
                        continue;
                    }    
                }    
                if (collideOnly === "right") {
                    if (velocity.x < 0 || normal.x >= 0) {
                        continue;
                    }    
                }    
                if (collideOnly === "left") {
                    if (velocity.x > 0 || normal.x <= 0) {
                        continue;
                    }    
                }    
            }
            
            // accumulate normal from multiple shapes
            plus.contactNormal = plus.contactNormal.plus(normal);
            plus.contactNormals.push(normal);

            // accumulate penetration
            totalPenetration = totalPenetration.plus(penetration);
            plus.penetrations.push(penetration);

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
                
        plus.contactNormal = plus.contactNormal.normalized();
        const contactNormal = plus.contactNormal;

        const speedNormal = velocity.dot(contactNormal);        
            
        // decompose old velocity into normal and tangent components
        const velocityNormal = contactNormal.scale(speedNormal);
        const velocityTangent = velocity.minus(velocityNormal);

        // compute restitution on normal component
        let newVelocityNormal;
        newVelocityNormal = velocityNormal.scale(-bounce);

        // todo: compute friction on tangent component                
        const newVelocityTangent = velocityTangent;
        
        const newVelocity = newVelocityNormal.plus(newVelocityTangent);

        body.velocity.x = newVelocity.x;
        body.velocity.y = newVelocity.y;

        this.updateBlocked(sprite);

        // notify event system
        this.events.collisions.notify(sprite, collidedShapes, velocity, newVelocity, contactNormal);
    }

    updateBlocked (sprite) {
        const body = sprite.body;
        const contactNormal = body.plus.contactNormal;

        body.blocked.up    = body.blocked.up    || contactNormal.y > 0;
        body.blocked.down  = body.blocked.down  || contactNormal.y < 0;
        body.blocked.left  = body.blocked.left  || contactNormal.x > 0;
        body.blocked.right = body.blocked.right || contactNormal.x < 0;
        body.blocked.none  = contactNormal.x == 0 && contactNormal.y == 0;
    }
}