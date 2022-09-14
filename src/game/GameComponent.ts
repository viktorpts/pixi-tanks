import { GameObject } from "./GameObject";


export abstract class GameComponent {
    parent: GameObject;

    abstract update(): void;
}
