import ConvexPolygon from "./geometry/ConvexPolygon";

export default class SpritePlus {
    constructor(sprite) {
        this.sprite = sprite;
    }

    setBodyCapsule(width, height, segments) {
        const sprite = this.sprite;
        if (sprite.body) {
            const body = sprite.body;
            body.plus = body.plus || {};
            const halfWidth = width * 0.5;
            const halfHeight = height * 0.5;
            body.plus.shape = ConvexPolygon.fromCapsule(
                -halfWidth, -halfHeight, +halfWidth, +halfHeight, segments
            );
        } else {
            throw new Error("Enable arcade physics before assigning body shape");
        }
    }
}