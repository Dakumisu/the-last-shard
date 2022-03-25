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

export default class Controller {
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
	}

	addToDebug(label) {
		const gui = debug.instance.getFolder(debug.label);
		debug.camList = [...debug.camList, { text: label, value: label }];
		if (debug.guiList) debug.guiList.dispose();
		debug.guiList = gui.addBlade({
			view: 'list',
			label: 'Cameras',
			options: debug.camList,
			value: label,
		});
		debug.guiList.on('change', (e) => {
			this.switch(e.value);
		});
		debug.guiList.controller_.view.valueElement.firstChild.firstChild.style.backgroundColor =
			'#f55f0066';
		debug.guiList.controller_.view.valueElement.firstChild.firstChild.style.color = '#fff';
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
		console.log('📹 Switch Camera :', label);
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
