import Blueprint from './Blueprint';
import Particles from './Particles';
import Model from './Model';
import GeoMerge from './GeoMerge';
import Character from './Character';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	setComponent() {
		this.character = new Character();

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
