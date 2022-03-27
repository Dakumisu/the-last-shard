import Player from './Characters/Player.js';
import CustomFog from './Bases/Fog/CustomFog.js';
import Sky from './Bases/Sky/Sky.js';

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
