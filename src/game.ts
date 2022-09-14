import { Engine } from "./engine";
import { SpriteType } from "./game/assets";
import { createBarrier, createPlayer, createShot } from "./game/factory";
import { GameObject } from "./game/GameObject";
import { RectCollider, update as updatePhysics } from "./game/physics";

const ACCELERATION = 20;
const MAX_SPEED = 10;
const TURN_RATE = 3;
const FRICTION = 40;
const TANK_SIZE = 15;
const DASH_SPEED = 20;
const DASH_TIME = 0.25;
const DASH_COOLDOWN = 5;
const SHOT_SPEED = 25;


export function start(engine: Engine) {
    (window as any).engine = engine;
    /* TEST */

    /*
    const v = new Vector(1, 0);
    console.log(v.normalize().scale(2));
    
    const r1 = new RectCollider(0, 0, 1, 1);
    const r2 = new RectCollider(1, 0, 1, 1);
    console.log(r1.intersect(r2));
    r2.x = 0.75;
    console.log(r1.intersect(r2));
    r2.x = 0.5;
    console.log(r1.intersect(r2));
    */

    /* END TEST */

    const controls = {};
    window.addEventListener('keydown', event => {
        controls[event.code] = true;
    });
    window.addEventListener('keyup', event => {
        controls[event.code] = false;
    });
    const abilities = {
        cooldown: 0,
        dash: 0
    };

    const player = createPlayer(1.5, 1.5);

    const obstacles: Array<GameObject> = [
        // Boundary
        createBarrier(-1, -1, 32, 1),
        createBarrier(-1, 30, 32, 1),
        createBarrier(-1, 0, 1, 30),
        createBarrier(30, 0, 1, 30),

        // Top-left spawn
        createBarrier(0, 3, 3, 1),
        createBarrier(5, 1, 1, 4),

        // Top-right spawn
        createBarrier(27, 3, 3, 1),
        createBarrier(24, 1, 1, 4),

        // Bottom-left spawn
        createBarrier(0, 26, 3, 1),
        createBarrier(5, 25, 1, 4),

        // Bottom-right spawn
        createBarrier(27, 26, 3, 1),
        createBarrier(24, 25, 1, 4),

        // Left nook
        createBarrier(2, 13, 3, 1),
        createBarrier(2, 16, 3, 1),
        createBarrier(4, 14, 1, 2),

        // Right nook
        createBarrier(25, 13, 3, 1),
        createBarrier(25, 16, 3, 1),
        createBarrier(25, 14, 1, 2),

        // Arena
        createBarrier(4, 7, 6, 1),
        createBarrier(4, 8, 1, 3),
        createBarrier(20, 7, 6, 1),
        createBarrier(25, 8, 1, 3),
        createBarrier(4, 22, 6, 1),
        createBarrier(4, 19, 1, 3),
        createBarrier(20, 22, 6, 1),
        createBarrier(25, 19, 1, 3),
    ];

    const water: Array<GameObject> = [
        createBarrier(13, 0, 4, 12),
        createBarrier(13, 18, 4, 12),
    ];

    const objects: Array<GameObject> = [
        player,
        ...obstacles,
        ...water
    ];

    engine.addTile('grass', 0, 0, 30, 30);
    engine.addTile('sand', 11, 0, 8, 30);
    engine.addTile('sand', 10, 10, 10, 10);
    engine.addTile('sand', 9, 12, 12, 6);
    engine.addTile('pave', 12, 12, 6, 6);

    obstacles
        .map(o => ({ x: o.x, y: o.y, collider: o.getComponent<RectCollider>(RectCollider) }))
        .forEach(c => engine.addBlock('crete', c.x - c.collider.width / 2, c.y - c.collider.height / 2, c.collider.width, c.collider.height));
    water
        .map(o => ({ x: o.x, y: o.y, collider: o.getComponent<RectCollider>(RectCollider) }))
        .forEach(c => engine.addBlock('water', c.x - c.collider.width / 2, c.y - c.collider.height / 2, c.collider.width, c.collider.height));

    engine.bindActor(player);
    engine.registerMain(tick);

    return {
        player,
        tick,
    }

    function tick(STEP_SIZE_S) {
        // Movement
        if (controls['ArrowUp']) {
            player.speed += ACCELERATION * STEP_SIZE_S;
        } else if (controls['ArrowDown']) {
            player.speed -= ACCELERATION * STEP_SIZE_S;
        } else if (player.speed > 0) {
            player.speed = Math.max(player.speed - FRICTION * STEP_SIZE_S, 0);
        } else if (player.speed < 0) {
            player.speed = Math.min(player.speed + FRICTION * STEP_SIZE_S, 0);
        }

        if (Math.abs(player.speed) > MAX_SPEED && abilities.dash < DASH_COOLDOWN - DASH_TIME) {
            player.speed = MAX_SPEED * Math.sign(player.speed);
        }

        // Turning
        if (controls['ArrowLeft']) {
            player.direction -= TURN_RATE * STEP_SIZE_S;
        } else if (controls['ArrowRight']) {
            player.direction += TURN_RATE * STEP_SIZE_S;
        }

        // Shooting
        if (controls['Space'] && abilities.cooldown == 0) {
            abilities.cooldown = 1;
            const shot = createShot(player);
            engine.addObject(shot);
        } else if (abilities.cooldown > 0) {
            abilities.cooldown = Math.max(abilities.cooldown - STEP_SIZE_S, 0);
        }

        // Dashing
        if (controls['ShiftLeft'] && abilities.dash == 0) {
            abilities.dash = DASH_COOLDOWN;
            player.speed = DASH_SPEED;
        } else if (abilities.dash > 0) {
            abilities.dash = Math.max(abilities.dash - STEP_SIZE_S, 0);
        }

        updatePhysics(STEP_SIZE_S);

        // engine.debug(`Fire: ${abilities.cooldown.toFixed(1)}\nDash: ${abilities.dash.toFixed(1)}`);
    }
}