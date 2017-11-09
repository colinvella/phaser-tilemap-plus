import Vector from ".././geometry/Vector";
import ConvexPolygon from ".././geometry/ConvexPolygon";
import Range from ".././geometry/Range";
import AABB from ".././geometry/AABB";
import ShapeLayer from ".././geometry/ShapeLayer";

export default class RegionEvents {
    constructor(tilemapJson) {
        this.tilemapJson = tilemapJson;
        this.spriteStates = new Map();
    }

    enableObjectLayer(objectLayerName) {
        const objectLayerJson = this.tilemapJson.layers.find(layer => layer.type === "objectgroup" && layer.name === objectLayerName);
        if (!objectLayerJson) {
            throw new Error(`No object layer found with name "${objectLayerName}"`);
        }

        this.shapeLayer = new ShapeLayer(objectLayerJson);
    }

    onEnterAdd(sprite, listener) {
        const spriteState = this.getSpriteState(sprite);
        spriteState.enterListeners.push(listener);
        return listener;
    }

    onEnterRemove(sprite, listener) {
        const spriteState = this.getSpriteState(sprite);
        spriteState.enterListeners = spriteState.enterListeners.filter(lst => lst != listener);
    }

    onLeaveAdd(sprite, listener) {
        const spriteState = this.getSpriteState(sprite);
        spriteState.leaveListeners.push(listener);
        return listener;
    }

    onLeaveRemove(sprite, listener) {
        const spriteState = this.getSpriteState(sprite);
        spriteState.leaveListeners = spriteState.leaveListeners.filter(lst => lst != listener);
    }

    triggerWith(sprite) {
        if (!this.shapeLayer) {
            return;
        }

        const body = sprite.body;        
        const bodyAABB = new AABB(body.x - 1, body.y - 1, body.x + body.width + 1, body.y + body.height + 1);
        const candidateShapes = this.shapeLayer.quadTree.candidateShapes(bodyAABB);
        const collidedShapes = [];
        for (const shape of candidateShapes) {
            const collision = shape.collideWidth(body);
            if (!collision) {
                continue;
            }

            // track collided shapes for event notification
            collidedShapes.push(shape);
        }


        // notify
        this.notify(sprite, collidedShapes);
    }

    notify(sprite, shapes) {
        const spriteState = this.getSpriteState(sprite);
        const prevShapes = spriteState.collisions;

        // new shapes are entry events
        const enterShapes = shapes.filter(shape =>
            !prevShapes.find(prevShape => prevShape === shape)
        );

        // removed shapes are leave events
        const leaveShapes = prevShapes.filter(prevShape =>
            !shapes.find(shape => shape === prevShape)
        );

        // replace list
        spriteState.collisions = shapes;

        // broadcast enter events
        for (const enterShape of enterShapes) {
            for (const listener of spriteState.enterListeners) {
                listener(enterShape);
            }
        }

        // broadcast leave events
        for (const leaveShape of leaveShapes) {
            for (const listener of spriteState.leaveListeners) {
                listener(leaveShape);
            }
        } 
    }

    getSpriteState(sprite) {
        if (!this.spriteStates.has(sprite)) {
            this.spriteStates.set(sprite, {
                collisions: [],
                enterListeners: [],
                leaveListeners: [] }
            );
        }
        return this.spriteStates.get(sprite);
    }
}