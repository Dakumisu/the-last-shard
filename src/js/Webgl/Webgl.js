import signal from 'philbin-packages/signal';

import Device from '@tools/Device';
import Keyboard from '@tools/Keyboard';
import Mouse from '@tools/Mouse';
import PerformanceMonitor from '@tools/PerformanceMonitor';
import Raf from '@tools/Raf';
import Raycast from '@tools/Raycast';
import Size from '@tools/Size';

import CameraController from './Camera/Controller';
import MainCamera from './Camera/Cameras/MainCamera';
import Cinematrix from './Camera/Cameras/Cinematrix';

import Renderer from './Renderer';
import MainScene from './Scene/MainScene';
import World from './World/World';

/// #if DEBUG
import Debug from '@tools/Debug';
import OrbitCamera from './Camera/Cameras/OrbitCamera';
/// #endif

let initialized = false;

class Webgl {
	/**
	 * @type {Webgl}
	 */
	static instance;

	constructor(_canvas) {
		if (!_canvas) {
			console.error(`Missing 'canvas' property 🚫`);
			return null;
		}
		this.canvas = _canvas;
		Webgl.instance = this;

		this.beforeInit();
		this.event();
	}

	beforeInit() {
		/// #if DEBUG
		this.debug = new Debug();
		/// #endif

		this.device = new Device();
		this.size = new Size();
		this.raf = new Raf();
		this.mainScene = new MainScene();

		this.init();
	}

	init() {
		this.cameraController = new CameraController();
		this.camera = new MainCamera();
		// this.cinematrixCamera = new Cinematrix();

		/// #if DEBUG
		this.debugOrbitCam = new OrbitCamera(
			{
				spherical: {
					radius: 5,
					phi: 1,
					theta: 0.5,
				},

				minDistance: 0.5,
				maxDistance: 100,

				fps: false,
			},
			'debug',
		);
		this.cameraController.add(this.debugOrbitCam);
		/// #endif

		this.performance = new PerformanceMonitor();
		this.renderer = new Renderer();

		this.mouse = new Mouse();
		this.raycaster = new Raycast();

		this.world = new World();

		this.afterInit();
	}

	afterInit() {
		initialized = true;

		this.performance.everythingLoaded();
		this.resize();
	}

	event() {
		if (!initialized) return;

		signal.on('raycast', (e) => {
			/// #if DEBUG
			console.log('Raycast something 🔍', e);
			/// #endif
		});

		signal.on('resize', () => {
			this.resize();
			/// #if DEBUG
			console.log('Resize spotted 📐');
			/// #endif
		});

		signal.on('raf', () => {
			this.update();
			this.render();
		});
	}

	update() {
		if (!initialized) return;

		if (this.performance) this.performance.update(this.raf.delta);
		if (this.raycaster) this.raycaster.update();

		/// #if DEBUG
		if (this.debug.stats) this.debug.stats.update();
		/// #endif
	}

	render() {
		if (!initialized) return;

		if (this.world) this.world.update(this.raf.elapsed, this.raf.delta);
		if (this.renderer) this.renderer.render();
		if (this.camera) this.camera.update(this.raf.elapsed, this.raf.delta);
	}

	resize() {
		if (!initialized) return;

		if (this.renderer) this.renderer.resize();
		if (this.camera) this.camera.resize();
		if (this.world) this.world.resize();
		if (this.device) this.device.resize();
	}

	destroy() {
		signal.clear();
		/// #if DEBUG
		this.debug.destroy();
		/// #endif
		this.device.destroy();
		this.size.destroy();
		this.raf.destroy();
		this.keyboard.destroy();
		this.raycaster.destroy();
		this.mouse.destroy();
		this.performance.destroy();

		this.mainScene.destroy();
		this.renderer.destroy();
		this.camera.destroy();

		delete Webgl.instance;
	}
}

const initWebgl = (canvas) => {
	return new Webgl(canvas);
};

const getWebgl = () => {
	return Webgl.instance;
};

export { initWebgl, getWebgl };
