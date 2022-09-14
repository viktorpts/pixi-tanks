import { init } from './engine';
import { start } from './game';


main();

function main() {
    const engine = init();
    start(engine);
}
