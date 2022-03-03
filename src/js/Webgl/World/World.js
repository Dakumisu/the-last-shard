import Character from './Character';
import Ground from './Colliders/Ground';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	setComponent() {
		this.character = new Character();
		this.ground = new Ground();

		initialized = true;
	}

	resize() {
		if (!initialized) return;

		if (this.character) this.character.resize();
	}

	update(et, dt) {
		if (!initialized) return;

		if (this.character) this.character.update(et);
	}

	destroy() {
		if (!initialized) return;

		initialized = false;
	}
}
