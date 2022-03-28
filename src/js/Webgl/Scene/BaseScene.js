import { Group } from 'three';

/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
const debug = {
	instance: null,
};
/// #endif

export default class BaseScene {
	constructor({ label, playerPosition, cameraPosition }) {
		this.label = label;

		this.playerPosition = playerPosition;
		this.cameraPosition = cameraPosition;

		this.instance = new Group();

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		this.initDebug();
		/// #endif
	}

	/// #if DEBUG
	initDebug() {
		this.gui = debug.instance.getTab('Scene', this.label).addFolder({
			title: this.label ? this.label : 'noname',
			hidden: true,
		});
	}
	/// #endif

	init(currentCamera) {
		this.initialized = true;

		// console.log('Init positions : ', this.label);
	}

	addTo(mainScene) {
		mainScene.add(this.instance);
	}

	removeFrom(mainScene) {
		mainScene.remove(this.instance);
	}

	update(et, dt) {}
}
