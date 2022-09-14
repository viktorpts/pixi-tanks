import { SpriteType } from "./assets";
import { GameObject } from "./GameObject";
import { CircleCollider, RectCollider } from "./physics";


export enum ObjectType {
    Player,
    Barrier,
    Water,
    Shell
};

export function createPlayer(x: number, y: number) {
    const object = new GameObject(x, y, {
        weight: 1,
        sprite: SpriteType.tank
    });
    const collider = new CircleCollider(0.5);
    object.addComponent(collider);

    return object;
}

export function createBarrier(left: number, top: number, width: number, height: number) {
    const x = left + width / 2;
    const y = top + height / 2;
    const object = new GameObject(x, y, {
        weight: 0,
        sprite: SpriteType.barrier
    });
    const collider = new RectCollider(width, height);
    object.addComponent(collider);

    return object;
}

export function createShot(source: GameObject) {
    const object = new GameObject(source.x, source.y, {
        weight: 0,
        sprite: SpriteType.shell
    });
    object.direction = source.direction;
    object.speed = 25;
    const collider = new CircleCollider(0.1);
    object.addComponent(collider);

    return object;
}