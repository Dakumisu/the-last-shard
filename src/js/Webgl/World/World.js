import Player from './Entities/Player';
import Ground from './Colliders/Ground';

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
		}, 5000);
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
