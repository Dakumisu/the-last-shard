/// #if DEBUG
const debug = {
	instance: null,
	scene: null,
	cameraController: null,
};
/// #endif

import { getWebgl } from '@webgl/Webgl';
import { CameraHelper, Path } from 'three';
import PersCamera from './PersCamera';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';

export default class Cinematrix extends PersCamera {
	constructor() {
		super('cinematrix');

		console.log(this);

		const webgl = getWebgl();

		this.isActive = false;
		this.isPlaying = false;

		signal.on('cinematrix:switch', (curve) => {
			this.switch(curve);
		});

		signal.on('cinematrix:play', () => this.play());
		signal.on('cinematrix:stop', () => this.stop());

		signal.on('cameraSwitch', (label) => {
			if (label === this.label) this.enter();
			else this.quit();
		});

		/// #if DEBUG
		debug.instance = webgl.debug;
		debug.scene = webgl.mainScene.instance;
		debug.cameraController = webgl.cameraController;
		this.devtool();
		/// #endif
	}

	init() {
		super.init();
	}

	/// #if DEBUG
	devtool() {
		this.camHelper = new CameraHelper(this.instance);
		this.camHelper.visible = false;
		debug.scene.add(this.camHelper);

		this.gui = debug.instance
			.getFolder('CameraController')
			.addFolder({ title: this.label ? this.label : 'null', expanded: false });

		this.gui.addInput(this.camHelper, 'visible', {
			label: 'Show Helper',
		});

		this.gui
			.addButton({
				title: 'play',
			})
			.on('click', () => {
				this.play();
			});

		this.gui
			.addButton({
				title: 'stop',
			})
			.on('click', () => {
				this.stop();
			});
	}
	/// #endif

	switch(curve) {
		if (!curve) return;
		if (this.isActive) return;

		console.log('cinematrix switch', curve);

		const { name, instance } = curve;

		const _points = instance.getPoints(250);
		this.path = _points;
	}

	play() {
		if (this.isPlaying) return;

		this.isPlaying = true;

		console.log('cinematrix play');
	}

	stop() {
		if (!this.isPlaying) return;

		this.isPlaying = false;

		console.log('cinematrix stop');
	}

	quit() {
		this.isActive = false;
		console.log('cinematrix quit');
	}

	enter() {
		this.isActive = true;
		console.log('cinematrix enter');
	}

	setPosition(x, y, z) {
		this.instance.position.set(x, y, z);
	}

	setRotation(x, y, z) {
		this.instance.rotation.set(x, y, z);
	}

	setTarget(x, y, z) {
		this.instance.lookAt(x, y, z);
	}

	setFov(fov) {
		this.instance.fov = fov;
		this.instance.updateProjectionMatrix();
	}

	update(et, dt) {
		if (!this.isActive && !this.initialized) return;

		// TODO: add dummy position and damp on it
		// TODO: add normals to the cam OR look at (one or more)

		// c la merde de copilot mdr
		if (this.isPlaying) {
			const _points = this.path;
			const _len = _points.length;

			const _index = Math.floor(et * _len);

			if (_index < _len) {
				const _point = _points[_index];

				this.instance.position.set(_point.x, _point.y, _point.z);
			}
		}

		/// #if DEBUG
		this.camHelper.update();
		/// #endif

		super.update();
	}
}
