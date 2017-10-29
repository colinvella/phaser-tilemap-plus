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

    static sum(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static difference(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    static perpDot(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    static scale(v, s) {
        return new Vector(v.x * s, v.y * s);
    }    
}