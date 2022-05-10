import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { getWebgl } from '@webgl/Webgl';
import { dampPrecise } from 'philbin-packages/maths';
import { Euler, IcosahedronGeometry, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three';
import BaseEntity from '../Bases/BaseEntity';
import { getPlayer } from './Player';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Pet',
	tab: 'Player',
};
/// #endif

const STATES = {
	FOLLOW: 0,
	IDLE: 1,
};

const params = {
	offsetFromPlayer: new Vector3(-1.5, 1.5, 1.5),
	idleRadius: 1,
	followTimeOut: 1,
};

class Pet extends BaseEntity {
	static instance;
	constructor() {
		super();

		Pet.instance = this;

		const webgl = getWebgl();

		this.player = getPlayer();
		this.scene = webgl.mainScene.instance;

		this.state = STATES.IDLE;
		this.speed = 1;

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

		this.targetPos.copy(this.player.base.mesh.position).add(params.offsetFromPlayer);

		this.base.mesh.position.copy(this.targetPos);
		this.scene.add(this.base.mesh);
		this.isInitialized = true;
	}

	/// #if DEBUG
	devltools() {
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(this, 'speed');

		this.initPhysicsVisualizer();
	}
	/// #endif

	update(et, dt) {
		if (!this.isInitialized) return;

		if (this.player.isMoving()) this.state = STATES.FOLLOW;
		else this.state = STATES.IDLE;

		switch (this.state) {
			case STATES.FOLLOW:
				this.follow(et, dt);
				break;
			case STATES.IDLE:
				this.follow(et, dt);
				// this.idle(et, dt);
				break;
		}

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
	}

	follow(et, dt) {
		console.log('follow');
		this.targetPos.copy(this.player.base.mesh.position).add(params.offsetFromPlayer);
	}

	idle(et, dt) {
		console.log('idle');

		this.targetPos.x =
			Math.cos(et * 0.001 * this.speed) * params.idleRadius +
			this.player.base.mesh.position.x;
		this.targetPos.z =
			Math.sin(et * 0.001 * this.speed) * params.idleRadius +
			this.player.base.mesh.position.z;

		this.targetPos.y = Math.sin(et * 0.005) * 0.01 + this.targetPos.y;

		// .copy(this.player.base.mesh.position)
		// .add(params.offsetFromPlayer.clone().multiplyScalar(0.5));
	}

	startTimeOut() {}
}

const initPet = () => {
	return new Pet();
};

const getPet = () => {
	return Pet.instance;
};

export { initPet, getPet };
