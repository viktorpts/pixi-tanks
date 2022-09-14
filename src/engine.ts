import * as PIXI from 'pixi.js';
import { SpriteType } from './game/assets';
import { GameObject } from './game/GameObject';


const STEP_SIZE = 1000 / 50;
const STEP_SIZE_S = 1 / 50;
const GRID_SIZE = 32;

export function init(): Engine {
    const app = new PIXI.Application({ width: 1200, height: 800 });
    document.querySelector('main').appendChild(app.view);

    const textures = {
        sand: PIXI.Texture.from('./assets/sand.png'),
        grass: PIXI.Texture.from('./assets/grass.png'),
        pave: PIXI.Texture.from('./assets/pave.png'),
        crete: PIXI.Texture.from('./assets/crete.png'),
        water: PIXI.Texture.from('./assets/water.png'),
    };

    Object.values(textures).forEach(t => t.baseTexture.setResolution(0.5));

    const viewport = new PIXI.Container();
    const background = new PIXI.Container();
    const actors = new PIXI.Container();
    const foreground = new PIXI.Container();
    viewport.addChild(background);
    viewport.addChild(actors);
    viewport.addChild(foreground);

    const grid = new PIXI.Graphics();
    grid.lineStyle({ color: 0xffffff, width: 1, alpha: 0.25 });
    for (let x = 0; x <= 30; x++) {
        grid.moveTo(x * GRID_SIZE, 0);
        grid.lineTo(x * GRID_SIZE, 30 * GRID_SIZE);
    }
    for (let y = 0; y <= 30; y++) {
        grid.moveTo(0, y * GRID_SIZE);
        grid.lineTo(30 * GRID_SIZE, y * GRID_SIZE);
    }
    background.addChild(grid);

    const blocks = new PIXI.Graphics();
    foreground.addChild(blocks);

    const tank = new PIXI.Container();
    const turrent = PIXI.Sprite.from('./assets/tank-body.png');
    const tracks = PIXI.Sprite.from('./assets/tracks0.png');
    tank.addChild(tracks);
    tank.addChild(turrent);

    tank.scale = { x: 2, y: 2 };
    tank.pivot = { x: 15 / 2, y: 17 / 2 };
    actors.addChild(tank);

    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        fill: ['#ffffff'], // gradient
    });
    const basicText = new PIXI.Text('', style);
    basicText.x = 10;
    basicText.y = 10;

    app.stage.addChild(viewport);
    app.stage.addChild(basicText);

    let delta = 0.0;

    let main: Function = (stepSize: number) => { };
    const trackedObjects = new Map<GameObject, PIXI.Container>();
    let actor: GameObject = null;

    app.ticker.add(() => {
        delta += app.ticker.deltaMS;

        while (delta >= STEP_SIZE) {
            delta -= STEP_SIZE;
            main(STEP_SIZE_S);
        }

        for (let [ref, entry] of trackedObjects) {
            entry.x = ref.x * GRID_SIZE;
            entry.y = ref.y * GRID_SIZE;
            entry.rotation = ref.direction;
        }

        if (actor) {
            tank.x = actor.x * GRID_SIZE;
            tank.y = actor.y * GRID_SIZE;
            tank.rotation = actor.direction;
        }

        // Viewport target
        const target = { x: 600 - tank.x, y: 400 - tank.y };
        const current = {
            x: viewport.transform.position.x,
            y: viewport.transform.position.y,
        };
        const offset = {
            x: target.x - current.x,
            y: target.y - current.y
        };
        current.x += offset.x / 50;
        current.y += offset.y / 50;

        viewport.setTransform(current.x, current.y);

        // basicText.text = `Speed: ${actor.speed}\nDash: ${actor.dash.toFixed(1)}`;
    });

    return {
        registerMain(callback) {
            main = callback;
        },
        bindActor(ref: GameObject) {
            actor = ref;
        },
        addObject(ref: GameObject) {
            if (ref.sprite == SpriteType.shell) {
                const sprite = PIXI.Sprite.from('./assets/shell.png');
                sprite.scale = { x: 2, y: 2 };

                trackedObjects.set(ref, sprite);
                actors.addChild(sprite);
            } else {
                /*
                const sprite = new PIXI.Graphics();
                const body = ref.collider as RectCollider;

                sprite.beginFill(0xffffff, 1);
                sprite.drawRect(-body.width / 2, -body.height / 2, body.width, body.height);
                trackedObjects.set(ref, sprite);
                actors.addChild(sprite);
                */
            }
        },
        addTile(type: string, left: number, top: number, width: number, height: number) {
            grid.beginTextureFill({
                texture: textures[type],
                alpha: 1
            });
            grid.drawRect(left * GRID_SIZE, top * GRID_SIZE, width * GRID_SIZE, height * GRID_SIZE);
        },
        addBlock(type: string, left: number, top: number, width: number, height: number) {
            const target = type == 'water' ? grid : blocks;
            target.beginTextureFill({
                texture: textures[type],
                alpha: 1
            });
            target.drawRect(left * GRID_SIZE, top * GRID_SIZE, width * GRID_SIZE, height * GRID_SIZE);
        },
        debug(text: string) {
            basicText.text = text;
        }
    }
}

export declare type Engine = {
    registerMain(callback: Function): void;
    bindActor(ref: GameObject): void;
    addObject(ref: GameObject): void;
    addTile(type: string, left: number, top: number, width: number, height: number): void;
    addBlock(type: string, left: number, top: number, width: number, height: number): void;
    debug(text: string): void;
}