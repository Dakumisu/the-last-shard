import Blueprint from './Blueprint';
import Character from './Character';
import GeoMerge from './GeoMerge';
import Model from './Model';
import Particles from './Particles';

let initialized = false;

export default class World {
	constructor(opt = {}) {
		this.setComponent();
	}

	setComponent() {
		// Examples
		// this.blueprint = new Blueprint();
		// this.particles = new Particles();
		// this.model = new Model();
		// this.geoMerge = new GeoMerge();
		this.character = new Character();

		initialized = true;
	}

	resize() {
		if (!initialized) return;

		// if (this.blueprint) this.blueprint.resize();
		// if (this.particles) this.particles.resize();
		if (this.character) this.character.resize();
	}

	update(et, dt) {
		if (!initialized) return;

		// if (this.blueprint) this.blueprint.update(et);
		// if (this.particles) this.particles.update(et);
		if (this.character) this.character.update(et);
	}

	destroy() {}
}
