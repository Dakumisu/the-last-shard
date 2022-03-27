import { Group } from 'three';

/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
const debug = {
	instance: null,
};
/// #endif

export default class BaseScene {
	constructor({ label, textures = [], models = [], playerPosition, cameraPosition }) {
		this.label = label;

		this.textures = textures;
		this.models = models;

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

	loadAssets() {}

	loadModels() {}

	initScene(player, currentCamera) {
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
