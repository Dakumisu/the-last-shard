import Player from './Entities/Player.js';
import CustomFog from './Environment/Fog/CustomFog.js';
import Sky from './Environment/Sky/Sky.js';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	async setComponent() {
		this.fog = new CustomFog();
		this.sky = new Sky();
		await this.sky.init();

		initialized = true;
	}

	resize() {
		if (!initialized) return;

		// if (this.player) this.player.resize();
	}

	update(et, dt) {
		if (!initialized) return;

		if (this.sky) this.sky.update(et, dt);
	}

	destroy() {
		if (!initialized) return;

		initialized = false;
	}
}
