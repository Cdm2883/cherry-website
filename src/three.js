import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default class ThreeViewport {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 64);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }
    resize() {
        const { innerWidth: width, innerHeight: height } = window;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.composer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        if (this.bloomPass) this.composer.removePass(this.bloomPass);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            // 1.5, 0.4, 0.85
            // .1, 0.4, 0.99
            // .2, 0.4, 0.1
            .12, 0.4, 0.1
            // .2, 0.5, 0.2
        );
        this.composer.addPass(this.bloomPass);
    }

    setup() {
        const loader = new GLTFLoader();
        loader.load("assets/models/website_viewport_1.glb", data => {
            const scene = data.scene;
            this.scene.add(scene);
        });
        loader.load("assets/models/website_viewport_2.glb", data => {
            const scene = data.scene;
            scene.position.set(0, 0, 64);
            this.scene.add(scene);
        });

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
        this.scene.add(ambientLight);
        {
            // const fog = 0x8b4fff;
            const fog = 0xffc3d3;
            // const fog = 0x654c52;
            this.scene.fog = new THREE.FogExp2(fog, 0.02);
            // this.scene.fog = new THREE.Fog(fog, 0.9, 64);
            this.scene.background = new THREE.Color(fog);
        }

        const LightColors = {
            Torch: 0xfef4c5,
            EndRod: 0xe4f8fc,
            Lantern: 0xfcfcd2,
            SeaLantern: 0xd1ded6,
            EnchantingTable: 0xa11de6,
            JackOLantern: 0xeced98,
        };
        const lights = [
            [ -28.488, -10.795, -18.502, LightColors.Lantern, 1 ],
            [ -28.488, -10.795, -14.502, LightColors.Lantern, 8, undefined, 2 ],
            [ -28.488, -10.795, -15.502, LightColors.Lantern, 8, undefined, 2 ],
            [ -31.488, -11.795, -11.502, LightColors.Lantern, 1 ],
            [ -29.489, -11.292, -6.774, LightColors.Torch, 1 ],
            [ -25.546, -12.574, -7.592, LightColors.JackOLantern ],
            [ -30.546, -12.574, -7.592, LightColors.JackOLantern ],
            [ -26.489, -11.292, -6.774, LightColors.Torch, 1 ],
            [ -29.488, -13.460, -4.502, LightColors.EndRod, 1, undefined, 2 ],
            [ -27.489, -12.795, 0.497, LightColors.Lantern ],
            [ -21.488, -13.795, -2.502, LightColors.Lantern ],
            [ -19.488, -8.795, 1.497, LightColors.Lantern ],
            [ -18.488, -7.795, -5.502, LightColors.Lantern ],
            [ -17.488, -12.795, 3.497, LightColors.Lantern ],
            [ -8.488, -10.795, -1.502, LightColors.Lantern ],
            [ -8.488, -13.795, 4.497, LightColors.Lantern ],
            [ -9.488, -8.795, -6.502, LightColors.Lantern ],
            [ -6.488, -10.795, 2.497, LightColors.Lantern ],
            [ -9.488, -12.595, -6.502, LightColors.SeaLantern ],
            [ -16.488, -13.795, 6.497, LightColors.Lantern ],
            [ -15.488, -13.795, 11.497, LightColors.EnchantingTable ],
            [ -22.488, -12.795, 13.497, LightColors.Lantern ],
            [ -27.488, -12.795, 20.497, LightColors.Lantern ],
            [ -20.488, -12.795, 23.497, LightColors.Lantern ],
            // === BIG TREE ===
            [ -29.488, -12.795, 36.497, LightColors.Lantern ],
            [ -17.488, -12.795, 42.497, LightColors.Lantern ],
            [ -15.488, -13.595, 48.497, LightColors.EndRod ],
            [ -5.488, -11.795, 46.497, LightColors.Lantern ],
            [ -26.488, -10.795, 54.497, LightColors.Lantern ],
            [ -28.488, -12.795, 57.497, LightColors.Lantern ],
            [ -20.488, -10.795, 60.497, LightColors.Lantern ],
            [ -27.488, -10.795, 65.497, LightColors.Lantern ],
            [ -20.488, -10.795, 68.497, LightColors.Lantern ],
            [ -26.488, -10.795, 73.497, LightColors.Lantern ],
            [ -20.488, -10.795, 78.497, LightColors.Lantern ],
            // [ , LightColors.Lantern ],
        ];
        for (const [ x, y, z, color, intensity = 8, distance = 0, decay = 1 ] of lights) {
            const light = new THREE.PointLight(color, intensity, distance, decay);
            light.position.set(x, y, z);
            this.scene.add(light);
            const helper = new THREE.PointLightHelper(light);
            this.scene.add(helper);
        }

        this.camera.position.set(-34, -12, -0.1);
        this.camera.rotation.set(0, THREE.MathUtils.degToRad(270), 0);

        this.scene.add(new THREE.CameraHelper(this.camera));
        // this.camera.position.z += -3;

        this.controller();
        this.animate();
    }

    controller() {
        this.targetZ = this.camera.position.z;
        this.currentZ = this.camera.position.z;
        this.damping = 0.1;
        this.isDragging = false;

        window.addEventListener('wheel', event => this.targetZ += event.deltaY * 0.01);
        this.canvas.addEventListener('mousedown', () => this.isDragging = true);
        this.canvas.addEventListener('mousemove', event => this.isDragging && (this.targetZ -= event.movementX * 0.01));
        window.addEventListener('mouseup', () => this.isDragging = false);

        this.canvas.addEventListener('touchstart', event => this.previousX = event.touches[0].clientX);
        this.canvas.addEventListener('touchmove', event => {
            const currentX = event.touches[0].clientX;
            if (this.previousX) this.targetZ += (this.previousX - currentX) * 0.02;
            this.previousX = currentX;
        });
        window.addEventListener('touchend', () => this.previousX = null);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const computedZ = this.currentZ + (this.targetZ - this.currentZ) * this.damping;
        if (-17 <= computedZ && computedZ <= 64 * 2 - 60) this.camera.position.z = this.currentZ = computedZ;

        this.composer.render();
    }
}

// function mappingFormMc(x, y, z) {
//     // [ -27.489, -12.795, 0.497 ] -> [ 8846, 72, 7507 ]
//     return [ x - 8873.489, y - 84.795, z - 7506.503 ];
// }
