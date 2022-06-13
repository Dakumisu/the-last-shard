import { getPet } from '@webgl/World/Characters/Pet';
import { getPlayer } from '@webgl/World/Characters/Player';
import PersCamera from './PersCamera';
import { Vector3 } from 'three';

/// #if DEBUG
import { getWebgl } from '@webgl/Webgl';
import { dampPrecise } from 'philbin-packages/maths';
const debug = {
	instance: null,
	scene: null,
	cameraController: null,
};
/// #endif

const TEMP_POS = new Vector3();
const DUMMY_LOOKAT = new Vector3();
const TEMP_LOOKAT = new Vector3();
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

	update(et, dt) {
		if (!this.initialized) return;

		super.update();

		TEMP_POS.copy(this.player.getPosition()).addScaledVector(UP_VECTOR, 1);
		this.instance.position.copy(TEMP_POS);

		if (DUMMY_LOOKAT.distanceTo(TEMP_LOOKAT) > 1) DUMMY_LOOKAT.copy(TEMP_LOOKAT);
		TEMP_LOOKAT.copy(this.pet.getFocusPosition());
		DUMMY_LOOKAT.x = dampPrecise(DUMMY_LOOKAT.x, TEMP_LOOKAT.x, 0.1, dt);
		DUMMY_LOOKAT.y = dampPrecise(DUMMY_LOOKAT.y, TEMP_LOOKAT.y, 0.1, dt);
		DUMMY_LOOKAT.z = dampPrecise(DUMMY_LOOKAT.z, TEMP_LOOKAT.z, 0.1, dt);

		this.instance.lookAt(DUMMY_LOOKAT);
	}
}
