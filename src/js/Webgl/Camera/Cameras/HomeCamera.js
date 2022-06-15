import { getPlayer } from '@webgl/World/Characters/Player';
import PersCamera from './PersCamera';
import { Vector3 } from 'three';

import { getWebgl } from '@webgl/Webgl';
import signal from 'philbin-packages/signal';

import anime from 'animejs';
import { dampPrecise } from 'philbin-packages/maths';

/// #if DEBUG
const debug = {
	instance: null,
	scene: null,
	cameraController: null,
};
/// #endif

const TEMP_POS = new Vector3();
const DUMMY_POS = new Vector3();

let distance = 6;
let dummy_distance = 6;

export default class HomeCamera extends PersCamera {
	constructor() {
		super('home');

		this.player = getPlayer();
		this.playerCam = this.player.base.camera;

		this.label = 'home';
		this.needUpdate = true;
		this.started = false;

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
		super.init(true);
	}

	async start() {
		this.started = true;
		dummy_distance = 0;
	}

	update(et, dt) {
		if (!this.initialized) return;
		if (!this.needUpdate) return;

		super.update();

		distance = dampPrecise(distance, dummy_distance, 0.1, dt);

		if (this.started && distance === dummy_distance) {
			this.needUpdate = false;

			signal.emit('camera:switch', 'player');
		}

		TEMP_POS.copy(this.playerCam.camera.position).addScalar(distance);
		this.instance.quaternion.copy(this.playerCam.camera.quaternion);
		this.instance.position.copy(TEMP_POS);

		this.instance.lookAt(this.player.getPosition());
	}
}
