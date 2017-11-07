export default class CollisionEvents {
    constructor () {
        this.spriteListeners = new Map();
        this.spriteCollisions = new Map();
    }

    add(sprite, listener) {
        const listeners = this.getSpriteListeners(sprite);
        listeners.push(listener);
        return listener;
    }

    remove(sprite, listener) {
        const listeners = this.getSpriteListeners(sprite);
        this.spriteListeners.set(sprite, listeners.filter(l => l != listener));
    }

    notify(sprite, shapes, oldVelocity, newVelocity, contactNormal) {
        const prevShapes = this.spriteCollisions.has(sprite) ? this.spriteCollisions.get(sprite) : [];
        const newShapes = shapes.filter(shape =>
            !prevShapes.find(prevShape => prevShape === shape)
        );
        this.spriteCollisions.set(sprite, shapes);

        for (const newShape of newShapes) {
            for (const listener of this.getSpriteListeners(sprite)) {
                listener(newShape, oldVelocity, newVelocity, contactNormal);
            }
        } 
    }

    getSpriteListeners(sprite) {
        if (!this.spriteListeners.has(sprite)) {
            this.spriteListeners.set(sprite, []);
        }
        return this.spriteListeners.get(sprite);
    }
}