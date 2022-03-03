import Player from './Entities/Player';
import Ground from './Colliders/Ground';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	setComponent() {
		this.player = new Player();
		this.ground = new Ground();

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
