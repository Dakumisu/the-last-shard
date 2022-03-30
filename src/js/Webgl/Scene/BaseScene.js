import { Group, Vector3 } from 'three';

/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
import { getPlayer } from '@webgl/World/Characters/Player';
const debug = {
	instance: null,
};
/// #endif

export default class BaseScene {
	constructor({ label, playerPosition }) {
		this.label = label;

		this.player = getPlayer();
		this.playerPosition = new Vector3().fromArray(playerPosition);

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

	init() {
		this.initialized = true;
	}

	addTo(mainScene) {
		mainScene.add(this.instance);
		this.player.setStartPosition(this.playerPosition);
	}

	removeFrom(mainScene) {
		mainScene.remove(this.instance);
	}

	update(et, dt) {
		if (this.player) this.player.update(et, dt);
	}
}
