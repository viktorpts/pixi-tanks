import { Type } from "./Type";
import { SpriteType } from "./assets";
import { GameComponent } from "./GameComponent";


export class GameObject {
    private _x: number;
    private _y: number;
    direction: number;
    speed: number;
    weight: number;
    sprite: SpriteType;
    alive: boolean = true;

    private _components: Array<GameComponent> = [];
    private _componentIndex: Map<Type<GameComponent>, Array<GameComponent>> = new Map();

    constructor(x: number, y: number, options: { weight?: number, sprite?: SpriteType }) {
        this._x = x;
        this._y = y;
        this.direction = 0;
        this.speed = 0;
        this.weight = options.weight;
        this.sprite = options.sprite;
    }

    get x() {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    addComponent(component: GameComponent) {
        component.parent = this;
        this._components.push(component);
        if (this._componentIndex.get(component.constructor as Type<GameComponent>) == undefined) {
            this._componentIndex.set(component.constructor as Type<GameComponent>, []);
        }
        this._componentIndex.get(component.constructor as Type<GameComponent>).push(component);
    }

    getComponent<T extends GameComponent>(type: Type<T>): T {
        const matches = this._componentIndex.get(type);
        if (matches) {
            return matches[0] as T;
        } else {
            return null;
        }
    }
    
    getComponents<T extends GameComponent>(type: Type<T>): Array<T> {
        return this._componentIndex.get(type) as Array<T>;
    }

    update() {
        if (this.alive) {
            for (let component of this._components) {
                component.update();
            }
        }
    }
}
