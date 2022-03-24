import Player from './Entities/Player.js';
import Ground from './Colliders/Ground.js';
import Lights from './Environment/Lights/Lights.js';
import CustomFog from './Environment/Fog/CustomFog.js';
import baseUniforms from './Materials/baseUniforms.js';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	async setComponent() {
		this.lights = new Lights();

		this.fog = new CustomFog();

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
		if (this.ground) this.ground.update(et, dt);
		if (this.fog) this.fog.update(et, dt);
	}

	destroy() {
		if (!initialized) return;

		initialized = false;
	}
}
