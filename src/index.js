import ThreeViewport from "./three.js";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";

if (WebGL.isWebGL2Available()) {
    new ThreeViewport(document.getElementById('three-viewport')).setup();
} else {
    document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}
