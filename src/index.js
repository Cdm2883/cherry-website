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

    const test1 = document.createElement('div');
    test1.style.width = '10%';
    test1.style.height = '10%';
    test1.style.background = 'red';
    test1.style.pointerEvents = 'fill';
    layer.add(test1, { x: 0, y: 0, z: 0 });

    const test2 = document.createElement('div');
    test2.style.width = '5%';
    test2.style.height = '5%';
    test2.style.background = 'green';
    test2.style.pointerEvents = 'fill';
    layer.add(test2, { x: 0, y: 0, z: 1 });
} else {
    document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}
