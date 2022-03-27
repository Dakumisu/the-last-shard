import { getWebgl } from '@webgl/Webgl';
import { Group } from 'three';

/// #if DEBUG
const debug = {
	instance: null,
};
/// #endif

export default class BaseScene {
	constructor({ label, textures = [], models = [], playerPosition, cameraPosition }) {
		const webgl = getWebgl();

		this.label = label;

		this.textures = textures;
		this.models = models;

		this.playerPosition = playerPosition;
		this.cameraPosition = cameraPosition;

		this.instance = new Group();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.initDebug();
		/// #endif
	}

	/// #if DEBUG
	initDebug() {
		this.gui = debug.instance
			.getFolder('SceneController')
			.addFolder({ title: this.label ? this.label : 'noname', expanded: false });
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
