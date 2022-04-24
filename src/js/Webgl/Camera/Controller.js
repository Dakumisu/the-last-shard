import { getWebgl } from '../Webgl';
import signal from 'philbin-packages/signal/Signal';

/// #if DEBUG
import { CameraHelper } from 'three';
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
		this.devtool();
		/// #endif
	}

	init() {
		signal.on('cameraSwitch', this.switch.bind(this));
	}

	/// #if DEBUG
	devtool() {
		debug.instance.setFolder(debug.label);
	}

	addToDebug(label, autoSwitch) {
		let previousValue;

		const gui = debug.instance.getFolder(debug.label);

		debug.camList = [...debug.camList, { text: label, value: label }];

		if (debug.guiList) {
			previousValue = debug.guiList.value;
			debug.guiList.dispose();
		}

		debug.guiList = gui.addBlade({
			view: 'list',
			label: 'Cameras',
			options: debug.camList,
			value: autoSwitch ? label : previousValue ? previousValue : label,
		});

		debug.guiList.on('change', (e) => {
			this.switch(e.value);
		});

		const domEl = debug.guiList.controller_.view.valueElement.firstChild.firstChild;
		domEl.style.backgroundColor = '#f55f0066';
		domEl.style.color = '#fff';
		const forceColor = () => {
			domEl.style.setProperty('background-color', '#f55f0066', 'important');
			domEl.style.setProperty('color', '#fff', 'important');
		};
		domEl.addEventListener('focus', forceColor);
		domEl.addEventListener('mouseover', forceColor);
	}
	/// #endif

	add(camera, autoSwitch) {
		if (!this.cameras[camera.label]) {
			this.cameras[camera.label] = camera;
			/// #if DEBUG
			this.addToDebug(camera.label, autoSwitch);
			/// #endif
			if (autoSwitch) this.switch(camera.label);
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
		/// #if DEBUG
		console.log('📹 Switch Camera :', label);
		/// #endif
		if (this.get(label)) {
			/// #if DEBUG
			if (this.currentCamera) this.currentCamera.gui.expanded = false;
			/// #endif

			this.currentCamera = this.get(label);
			this.currentCamera.resize();

			/// #if DEBUG
			this.currentCamera.gui.expanded = true;
			/// #endif
		}
	}
}
