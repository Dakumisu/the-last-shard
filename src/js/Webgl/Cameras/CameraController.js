import { getWebgl } from '../Webgl';
import signal from 'philbin-packages/signal/Signal';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'CameraController',
	camList: [],
	guiList: null,
};
/// #endif

export default class CameraController {
	constructor() {
		this.cameras = {};
		this.currentCamera = null;

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		this.initDebug();
		/// #endif
	}

	init() {
		signal.on('cameraSwitch', this.switch.bind(this));
	}

	/// #if DEBUG
	initDebug() {
		debug.instance.setFolder(debug.label);
		const gui = debug.instance.getFolder(debug.label);

		// gui.addInput(this.orbitParams, 'fps', {
		// 	label: 'mode',
		// 	options: { Default: false, FPS: true },
		// }).on('change', (e) => {
		// 	this.debugCam.orbit.setFPSMode(e.value);
		// });
		// gui.addButton({
		// 	title: 'Toggle auto rotate',
		// }).on('click', () => {
		// 	this.debugCam.orbit.autoRotate = !this.debugCam.orbit.autoRotate;
		// });
		// gui.addButton({
		// 	title: 'Reset',
		// }).on('click', () => {
		// 	this.debugCam.orbit.sphericalTarget.set(
		// 		this.orbitParams.spherical.radius,
		// 		this.orbitParams.spherical.phi,
		// 		this.orbitParams.spherical.theta,
		// 	);
		// 	// WIP
		// });
	}

	addToDebug(label) {
		const gui = debug.instance.getFolder(debug.label);
		debug.camList = [...debug.camList, { text: label, value: label }];
		if (debug.guiList) debug.guiList.dispose();
		debug.guiList = gui.addBlade({
			view: 'list',
			label: 'Switch',
			options: debug.camList,
			value: label,
		});
		debug.guiList.on('change', (e) => {
			this.switch(e.value);
		});
	}
	/// #endif

	add(label, camera, autoSwitch) {
		if (!this.cameras[label]) {
			this.cameras[label] = camera;
			/// #if DEBUG
			this.addToDebug(label);
			/// #endif
			if (autoSwitch) this.switch(label);
			return;
		}
		console.error('Camera already exists');
	}

	get(label) {
		if (this.cameras[label]) return this.cameras[label];
		console.error('Camera does not exists');
		return;
	}

	switch(label) {
		console.log('📹 Switch Camera', label);
		if (this.get(label)) {
			this.currentCamera = this.get(label);
		}
	}

	resizeAll() {
		for (const cam in this.cameras) cam.resize();
	}
}
