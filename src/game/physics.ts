import { GameComponent } from "./GameComponent";


const colliders: Array<Collider> = [];

export function update(STEP_SIZE_S: number) {
    // Simulate objects
    for (let col of colliders) {
        if (col.parent.alive && col.parent.speed != 0) {
            const obj = col.parent;
            obj.x += Math.cos(obj.direction) * obj.speed * STEP_SIZE_S;
            obj.y += Math.sin(obj.direction) * obj.speed * STEP_SIZE_S;
        }
    }

    // Resolve Collisions
    for (let i = 0; i < colliders.length - 1; i++) {
        const current = colliders[i].parent;
        if (current.alive) {
            for (let j = i + 1; j < colliders.length; j++) {
                const other = colliders[j].parent;
                if (other.alive && (current.weight != 0 || other.weight != 0)) {
                    const c1 = current.getComponent<RectCollider>(RectCollider) || current.getComponent<CircleCollider>(CircleCollider);
                    const c2 = other.getComponent<RectCollider>(RectCollider) || other.getComponent<CircleCollider>(CircleCollider);
                    const p = c1.intersect(c2);
                    if (p.ms > 0) {
                        const r1 = current.weight / (current.weight + other.weight);
                        const r2 = other.weight / (current.weight + other.weight);
                        current.x += p.x * r1;
                        current.y += p.y * r1;
                        other.x -= p.x * r2;
                        other.y -= p.y * r2;
                    }
                }
            }
        }
    }
}

export abstract class Collider extends GameComponent {
    constructor() {
        super();
        colliders.push(this);
    }

    abstract intersect(other: Collider): Vector;
    update() { };
}

export class CircleCollider extends Collider {
    radius: number;

    constructor(radius: number) {
        super();

        this.radius = radius;
    }

    intersect(other: Collider): Vector {
        if (other instanceof CircleCollider) {
            return pCircleCircle(this, other);
        } else if (other instanceof RectCollider) {
            return pCircleRect(this, other);
        } else {
            throw new TypeError('Unsupported collider type');
        }
    }
}

export class RectCollider extends Collider {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        super();

        this.width = width;
        this.height = height;
    }

    intersect(other: Collider): Vector {
        if (other instanceof RectCollider) {
            return pRectRect(this, other);
        } else if (other instanceof CircleCollider) {
            return pCircleRect(other, this).scale(-1);
        } else {
            throw new TypeError('Unsupported collider type');
        }
    }
}


function pRectRect(r1: RectCollider, r2: RectCollider): Vector {
    const l = (r2.parent.x - r2.width / 2) - (r1.parent.x + r1.width / 2);
    const r = (r2.parent.x + r2.width / 2) - (r1.parent.x - r1.width / 2);
    const t = (r2.parent.y - r2.height / 2) - (r1.parent.y + r1.height / 2);
    const b = (r2.parent.y + r2.height / 2) - (r1.parent.y - r1.height / 2);

    if (l < 0 && r > 0 && t < 0 && b > 0) {
        const pen = [
            { x: l, y: 0, abs: -l },    // To left
            { x: r, y: 0, abs: +r },    // To right
            { x: 0, y: t, abs: -t },    // To top
            { x: 0, y: b, abs: +b },    // To bottom
        ];
        const v = pen.sort((a, b) => a.abs - b.abs)[0];

        return new Vector(v.x, v.y);
    } else {
        return new Vector();
    }
}

function pCircleRect(c1: CircleCollider, r2: RectCollider): Vector {
    const cx = c1.parent.x;
    const cy = c1.parent.y;

    const cl = cx - c1.radius;
    const cr = cx + c1.radius;
    const ct = cy - c1.radius;
    const cb = cy + c1.radius;

    const rl = r2.parent.x - r2.width / 2;
    const rr = r2.parent.x + r2.width / 2;
    const rt = r2.parent.y - r2.height / 2;
    const rb = r2.parent.y + r2.height / 2;

    const l = rl - cr;
    const r = rr - cl;
    const t = rt - cb;
    const b = rb - ct;

    if (l < 0 && r > 0 && t < 0 && b > 0) {
        if (cx < rl && cy < rt) {           // Top-left
            return pCirclePoint(cx, cy, c1.radius, rl, rt);
        } else if (cx > rr && cy < rt) {    // Top-right
            return pCirclePoint(cx, cy, c1.radius, rr, rt);
        } else if (cx < rl && cy > rb) {    // Bottom-left
            return pCirclePoint(cx, cy, c1.radius, rl, rb);
        } else if (cx > rr && cy > rb) {    // Bottom-right
            return pCirclePoint(cx, cy, c1.radius, rr, rb);
        } else {
            const pen = [
                { x: l, y: 0, abs: -l },    // To left
                { x: r, y: 0, abs: +r },    // To right
                { x: 0, y: t, abs: -t },    // To top
                { x: 0, y: b, abs: +b },    // To bottom
            ];
            const v = pen.sort((a, b) => a.abs - b.abs)[0];

            return new Vector(v.x, v.y);
        }
    } else {
        return new Vector();
    }
}

function pCircleCircle(c1: CircleCollider, c2: CircleCollider): Vector {
    const dist = new Vector(c2.parent.x - c1.parent.x, c2.parent.y - c1.parent.y);
    const ps = dist.ms - (c1.radius + c2.radius) ** 2;
    if (ps < 0) {
        const p = Math.sqrt(dist.ms) - (c1.radius + c2.radius);
        return dist.normalize().scale(p);
    } else {
        return new Vector();
    }
}

function pCirclePoint(cx: number, cy: number, radius: number, px: number, py: number): Vector {
    const dist = new Vector(cx - px, cy - py);
    const ps = dist.ms - radius ** 2;
    if (ps < 0) {
        const p = radius - Math.sqrt(dist.ms);
        (window as any).engine.debug(`${dist.x.toFixed(2)}:${dist.y.toFixed(2)} = ${p.toFixed(2)}`);
        return dist.normalize().scale(p);
    } else {
        return new Vector();
    }
}

export class Vector {
    x: number;
    y: number;
    private _ms: number;

    constructor()
    constructor(x, y)
    constructor(other: Vector)
    constructor(xOrVector?: number | Vector, y?: number) {
        if (xOrVector instanceof Vector) {
            this.x = xOrVector.x;
            this.y = xOrVector.y;
            this._ms = xOrVector.ms;
        } else if (typeof xOrVector == 'number' && typeof y == 'number') {
            this.x = xOrVector;
            this.y = y;
            this.calcMagnitude();
        } else {
            this.x = 0;
            this.y = 0;
            this._ms = 0;
        }
    }

    get ms() {
        return this._ms;
    }

    private calcMagnitude() {
        this._ms = this.x ** 2 + this.y ** 2;
    }

    scale(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.calcMagnitude();

        return this;
    }

    normalize() {
        const magnitude = Math.sqrt(this.ms);
        return this.scale(1 / magnitude);
    }

    static subtract(a: Vector, b: Vector): Vector {
        return new Vector(a.x - b.x, a.y - b.y);
    }

    static scaled(v: Vector, scalar: number) {
        const result = new Vector(v);
        return result.scale(scalar);
    }

    static normalized(v: Vector) {
        const result = new Vector(v);
        return result.normalize();
    }
}