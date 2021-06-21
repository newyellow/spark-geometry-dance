const Reactive = require('Reactive');
const Diagnostics = require('Diagnostics');

class NYPoint {
    constructor (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    magnitude () {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }

    toSparkPoint () {
        return Reactive.point(this.x, this.y, this.z);
    }

    log () {
        Diagnostics.log(`${this.x}, ${this.y}, ${this.z}`);
    }



    static distance (a, b) {
        return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2) + Math.pow(a.z-b.z, 2));
    }

    static multiply (a, num) {
        return new NYPoint(a.x * num, a.y * num, a.z * num);
    }

    static average (a, b) {
        return new NYPoint((a.x+b.x)/2.0, (a.y+b.y)/2.0, (a.z+b.z)/2.0);
    }

    static add (a, b) {
        return new NYPoint(a.x+b.x, a.y+b.y, a.z+b.z);
    }

    static sub (a, b) {
        return new NYPoint(a.x-b.x, a.y-b.y, a.z-b.z);
    }

    static dot (a, b) {
        return (a.x * b.x + a.y * b.y + a.z * b.z)/(a.magnitude() * b.magnitude());
    }
}

export {NYPoint};
