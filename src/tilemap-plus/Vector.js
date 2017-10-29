export default class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    equals(vector) {
        return vector && this.x === vector.x && this.y === vector.y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalized() {
        const len = this.length();
        if (len === 0) {
            return new Vector(0, 0)
        } else {
            return new Vector(this.x / len, this.y / len);
        }
    }    

    perpendicular() {
        return new Vector(-this.y, this.x);
    }

    rotated(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector(cos * this.x + sin * this.y, -sin * this.x + cos * this.y);
    }

    plus(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    minus(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    perpDot(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    scale(factor) {
        return new Vector(this.x * factor, this.y * factor);
    }    
}