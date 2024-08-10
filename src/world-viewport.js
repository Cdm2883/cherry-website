import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const motionBlurShader = {
    uniforms: {
        tDiffuse: { value: null },
        velocity: { value: new THREE.Vector2(0, 0) }, // 摄像机速度
        blurAmount: { value: 0.5 }, // 模糊强度
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform vec2 velocity;
        uniform float blurAmount;
        varying vec2 vUv;

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec2 offset = velocity * blurAmount * 0.01;
            vec4 blurredColor = texture2D(tDiffuse, vUv + offset);
            blurredColor += texture2D(tDiffuse, vUv - offset);
            gl_FragColor = mix(color, blurredColor, 0.5);
        }
    `,
};

export default class WorldViewport {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 64);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(this.motionBlurPass = new ShaderPass(motionBlurShader));
        {
            this.previousCameraPosition = new THREE.Vector3();
            this.velocity = new THREE.Vector2();
        }
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

        {
            const floorGeometry = new THREE.BoxGeometry(9.1, 1, 9.2);
            const floorMaterial = new THREE.MeshBasicMaterial( { color: 0x686587 } );
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.set(-22.017, -15.498, 18.078);
            this.scene.add(floor);
        }

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
        this.scene.add(ambientLight);
        {
            // const fog = 0xffc3d3;  // pink
            const fog = 0x171843;  // dark blue
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
            // === HOUSE ===
            [ -11.488, -4.795, 66.497, LightColors.Lantern ],
            [ -12.488, -4.795, 67.497, LightColors.Lantern ],
            [ -14.488, -8.795, 58.497, LightColors.Lantern ],
            // [ , LightColors.Lantern ],
        ];
        for (const [ x, y, z, color, intensity = 8, distance = 0, decay = 1 ] of lights) {
            const light = new THREE.PointLight(color, intensity, distance, decay);
            light.position.set(x, y, z);
            this.scene.add(light);
        }

        // petals
        {
            const regions = [
                [ [ -18.383, -6.058, -8.695 ], [ -25.021, -5.090, 1.545 ] ],
                [ [ -12.133, -6.117, 5.980 ], [ -17.765, -3.190, 17.714 ] ],
            ].map(
                ([ [ minX, minY, minZ ], [ maxX, maxY, maxZ ] ]) =>
                ({ min: { x: minX, y: minY, z: minZ }, max: { x: maxX, y: maxY, z: maxZ } })
            );

            const petalTexture = new THREE.TextureLoader().load('assets/images/home/cherry_petal_atlas.png');
            petalTexture.magFilter = THREE.NearestFilter;
            petalTexture.minFilter = THREE.NearestFilter;
            const petalMaterial = new THREE.MeshBasicMaterial({
                map: petalTexture,
                transparent: true,
                side: THREE.DoubleSide,
            });
            const petalGeometry = new THREE.PlaneGeometry(.2, .2);
            const petalSetRandomPosition = (petal, region) => petal.position.set(
                THREE.MathUtils.lerp(region.min.x, region.max.x, Math.random()),
                THREE.MathUtils.lerp(region.min.y, region.max.y, Math.random() * 10),
                THREE.MathUtils.lerp(region.min.z, region.max.z, Math.random())
            );
            const createPetal = region => {
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);

                const petalIndex = Math.floor(Math.random() * 4);
                const uOffset = (petalIndex % 4) * 0.25;
                const vOffset = Math.floor(petalIndex / 4) * 0.33;
                petal.material.map.offset.set(uOffset, vOffset);
                petal.material.map.repeat.set(0.25, 0.33);

                petalSetRandomPosition(petal, region);
                petal.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                petal.scale.setScalar(Math.random() * 0.5 + 0.5);

                return petal;
            };
            const petalsGroups = regions.map(region => {
                const group = new THREE.Group();
                for (let i = 0; i < 20; i++) group.add(createPetal(region));
                return group;
            });
            petalsGroups.forEach(group => this.scene.add(group));

            const animatePetal = (petal, region) => {
                petal.position.y -= 0.02;

                // 风向影响
                petal.position.x += 0.001;
                petal.position.z += 0.003;

                // 左右摇摆
                petal.rotation.z += Math.sin(petal.position.y * 0.1) * 0.02;

                // 重置位置
                if (petal.position.y <= -15) petalSetRandomPosition(petal, region);
            };
            this.animatePetals = () => petalsGroups.forEach((group, i) =>
                group.children.forEach(petal => animatePetal(petal, regions[i])));
        }

        this.camera.position.set(-34, -12, -0.1);
        this.camera.rotation.set(0, THREE.MathUtils.degToRad(270), 0);

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
            if (this.previousX) this.targetZ += (this.previousX - currentX) * 0.025;
            this.previousX = currentX;
        });
        window.addEventListener('touchend', () => this.previousX = null);
    }

    renderPseudo;
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.velocity.set(this.camera.position.z - this.previousCameraPosition.z, 0);
        this.previousCameraPosition.copy(this.camera.position);
        this.motionBlurPass.uniforms.velocity.value.copy(this.velocity);

        const computedZ = this.currentZ + (this.targetZ - this.currentZ) * this.damping;
        // 当接近边界时，应用一个缓动函数来逐渐减速
        if (computedZ < -17) {
            this.currentZ += (-17 - this.currentZ) * this.damping;
        } else if (computedZ > 64 * 2 - 60) {
            this.currentZ += ((64 * 2 - 60) - this.currentZ) * this.damping;
        } else {
            this.currentZ = computedZ;
        }
        this.camera.position.z = this.currentZ;

        this.animatePetals();

        if (this.renderPseudo) this.renderPseudo();

        this.composer.render();
    }
}

// function mappingFormMc(x, y, z) {
//     // [ -27.489, -12.795, 0.497 ] -> [ 8846, 72, 7507 ]
//     return [ x - 8873.489, y - 84.795, z - 7506.503 ];
// }
