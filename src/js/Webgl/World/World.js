import Player from './Entities/Player.js';
import Ground from './Colliders/Ground.js';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	setComponent() {
		this.ground = new Ground();
		setTimeout(() => {
			this.player = new Player({ ground: this.ground.base.mesh });
			initialized = true;
		}, 3000);
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
