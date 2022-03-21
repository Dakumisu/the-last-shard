import Player from './Entities/Player.js';
import Ground from './Colliders/Ground.js';
import Lights from './Lights/Lights.js';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	async setComponent() {
		this.lights = new Lights();

		this.ground = new Ground();
		await this.ground.init();

		this.player = new Player({ ground: this.ground.base.mesh });

		initialized = true;
	}

	resize() {
		if (!initialized) return;

		if (this.player) this.player.resize();
	}

	update(et, dt) {
		if (!initialized) return;

		if (this.player) this.player.update(et, dt);
	}

	destroy() {
		if (!initialized) return;

		initialized = false;
	}
}
