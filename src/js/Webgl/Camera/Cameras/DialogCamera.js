import { getPet } from '@webgl/World/Characters/Pet';
import { getPlayer } from '@webgl/World/Characters/Player';
import PersCamera from './PersCamera';
import { Vector3 } from 'three';

/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
const debug = {
	instance: null,
	scene: null,
	cameraController: null,
};
/// #endif

const TEMP_POS = new Vector3();
const UP_VECTOR = new Vector3(0, 1, 0);

export default class DialogCamera extends PersCamera {
	constructor() {
		super('dialog');

		this.pet = getPet();
		this.player = getPlayer();

		this.label = 'dialog';

		this.init();

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		debug.scene = webgl.mainScene.instance;
		debug.cameraController = webgl.cameraController;
		this.devtool();
		/// #endif
	}

	/// #if DEBUG
	async devtool() {
		await this.initialized;

		super.devtools(debug);
	}
	/// #endif

	init() {
		super.init();
	}

	update() {
		if (!this.initialized) return;

		super.update();

		TEMP_POS.copy(this.player.getPosition()).addScaledVector(UP_VECTOR, 1);
		this.instance.position.copy(TEMP_POS);
		this.instance.lookAt(this.pet.getFocusPosition());
	}
}
