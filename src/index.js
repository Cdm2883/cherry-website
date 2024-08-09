import WorldViewport from "./world-viewport.js";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
import Pseudo3DLayer from "./pseudo-3d-layer.js";

if (WebGL.isWebGL2Available()) {
    const canvas = document.getElementById('three-viewport');
    const world = new WorldViewport(canvas);
    world.setup();
    console.log(world);

    const container = document.getElementById('pseudo-3d-layer');
    const layer = new Pseudo3DLayer(container);
    layer.bind(world);
    console.log(layer);

    {
        const test = document.createElement('div');
        test.style.width = '10%';
        test.style.height = '10%';
        test.style.background = 'red';
        test.style.pointerEvents = 'fill';
        layer.add(test, { x: 0, y: 0, z: 0 });
    }
    {
        const test = document.createElement('div');
        test.style.width = '5%';
        test.style.height = '5%';
        test.style.background = 'green';
        test.style.pointerEvents = 'fill';
        layer.add(test, { x: 0, y: 0, z: 1 });
    }
    {
        const test = document.createElement('div');
        test.style.width = '1%';
        test.style.height = '1%';
        test.style.background = 'blue';
        test.style.pointerEvents = 'fill';
        layer.add(test, { x: 4 * Pseudo3DLayer.PixelToBlockMultiple, y: 2 * Pseudo3DLayer.PixelToBlockMultiple, z: 2 });
    }
} else {
    document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}
