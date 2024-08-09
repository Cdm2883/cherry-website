export default class Pseudo3DLayer {
    /** @param {HTMLDivElement} container */
    constructor(container) {
        this.container = container;
    }

    /** @param {WorldViewport} world */
    bind(world) {
        this.world = world;
        this.originX = world.camera.position.z;
        world.renderPseudo = this.render.bind(this);
    }

    /** @type {[ { wrapper: HTMLDivElement, element: HTMLElement, x: (layer: Pseudo3DLayer) => number, y: (layer: Pseudo3DLayer) => number, z: (layer: Pseudo3DLayer) => number } ]} */
    items = [];
    /**
     * @param {HTMLElement} element
     * @param {{ x: number | (() => number), y?: number | (() => number), z?: number | (() => number) }} options
     */
    add(element, options) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.appendChild(element);
        this.container.appendChild(wrapper);
        // const
        const value = x => typeof x === 'function' ? x : () => (x || 0);
        this.items.push({
            wrapper,
            element,
            x: value(options.x),
            y: value(options.y),
            z: value(options.z),
        });
    }

    static PixelToBlockMultiple = 40;
    render(item) {
        if (!item) return this.items.forEach(item => this.render(item));

        const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
        const { clientWidth: width, clientHeight: height } = item.element;
        const [ x, y, z ] = [ item.x(this), item.y(this), item.z(this) ];
        const cameraZ = this.world.camera.position.z;

        const top = windowHeight / 2 - height / 2 + y;
        const left = windowWidth / 2 - width / 2
            + x
            + (this.originX - cameraZ) * Pseudo3DLayer.PixelToBlockMultiple
            * (1 + z);

        item.wrapper.style.top = `${top}px`;
        item.wrapper.style.left = `${left}px`;
    }
}
