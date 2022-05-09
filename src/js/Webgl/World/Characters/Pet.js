import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { getWebgl } from '@webgl/Webgl';
import { dampPrecise } from 'philbin-packages/maths';
import { IcosahedronGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import BaseEntity from '../Bases/BaseEntity';
import { getPlayer } from './Player';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Pet',
	tab: 'Player',
};
/// #endif

const params = {
	distanceFromPlayer: new Vector3(-1.5, 1.5, 1.5),
};

class Pet extends BaseEntity {
	static instance;
	constructor() {
		super();

		Pet.instance = this;

		const webgl = getWebgl();

		this.player = getPlayer();
		this.scene = webgl.mainScene.instance;

		this.targetPos = new Vector3();

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif

		this.isInitialized = false;

		this.init();
	}

	async init() {
		this.base.geometry = new IcosahedronGeometry(0.25, 3);
		this.base.material = new BaseBasicMaterial({ color: 0xed4646 });
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);

		this.initPhysics();

		/// #if DEBUG
		this.devltools();
		/// #endif

		this.scene.add(this.base.mesh);
		this.isInitialized = true;
	}

	/// #if DEBUG
	devltools() {
		this.initPhysicsVisualizer();
	}
	/// #endif

	update(et, dt) {
		if (!this.isInitialized) return;

		this.targetPos.copy(this.player.base.mesh.position);
		this.targetPos.add(params.distanceFromPlayer);

		this.base.mesh.position.x = dampPrecise(
			this.base.mesh.position.x,
			this.targetPos.x,
			0.1,
			dt,
			0.001,
		);
		this.base.mesh.position.y = dampPrecise(
			this.base.mesh.position.y,
			this.targetPos.y,
			0.1,
			dt,
			0.001,
		);
		this.base.mesh.position.z = dampPrecise(
			this.base.mesh.position.z,
			this.targetPos.z,
			0.1,
			dt,
			0.001,
		);

		// this.base.mesh.position.copy(this.player.base.mesh.position);
	}
}

const initPet = () => {
	return new Pet();
};

const getPet = () => {
	return Pet.instance;
};

export { initPet, getPet };
