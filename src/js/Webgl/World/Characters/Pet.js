import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { getWebgl } from '@webgl/Webgl';
import { wait } from 'philbin-packages/async';
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

const params = {
	offsetFromPlayer: new Vector3(-0.5, 0.5, 0.5),
	idleRadius: 2,
	statesTimeouts: [4000, 2000],
};

export class Pet extends BaseEntity {
	static STATES = {
		FOLLOW: 0,
		IDLE: 1,
		FEEDING: 2,
	};
	static instance;

	constructor() {
		super();

		Pet.instance = this;

		const webgl = getWebgl();

		this.player = getPlayer();
		this.scene = webgl.mainScene.instance;

		this.state = Pet.STATES.IDLE;
		this.isBlocked = false;
		this.speed = 1;

		this.lastPlayerPos = new Vector3();
		this.targetPos = new Vector3();

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif

		this.isInitialized = false;

		this.init();
	}

	async init() {
		this.base.geometry = new IcosahedronGeometry(0.08, 3);
		this.base.material = new BaseBasicMaterial({ color: '#C1C2FF' });
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);

		this.initPhysics();

		/// #if DEBUG
		this.devltools();
		/// #endif

		this.targetPos.copy(this.player.base.mesh.position).add(params.offsetFromPlayer);

		this.base.mesh.position.copy(this.targetPos);
		this.lastPlayerPos.copy(this.player.base.mesh.position);

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
		if (!this.isInitialized || this.isBlocked) return;

		if (!this.timeOutStarted) this.stateTimeout();

		// TODO: TP if distance to far

		switch (this.state) {
			case Pet.STATES.FOLLOW:
				this.follow(et, dt);
				break;
			case Pet.STATES.IDLE:
				this.idle(et, dt);
				break;
			case Pet.STATES.FEEDING:
				this.feed(et, dt);
		}
	}

	dampPosition(dt, factor) {
		this.base.mesh.position.x = dampPrecise(
			this.base.mesh.position.x,
			this.targetPos.x,
			factor,
			dt,
			0.001,
		);

		if (this.player.state.isOnGround)
			this.base.mesh.position.y = dampPrecise(
				this.base.mesh.position.y,
				this.targetPos.y,
				factor,
				dt,
				0.001,
			);

		this.base.mesh.position.z = dampPrecise(
			this.base.mesh.position.z,
			this.targetPos.z,
			factor,
			dt,
			0.001,
		);
	}

	follow(et, dt) {
		this.dampPosition(dt, 0.1);

		this.lastPlayerPos.copy(this.player.base.mesh.position);
		this.targetPos.copy(this.player.base.mesh.position).add(params.offsetFromPlayer);
	}

	idle(et, dt) {
		this.dampPosition(dt, 0.01);

		this.targetPos.x =
			Math.cos(et * 0.001 * this.speed) * params.idleRadius + this.lastPlayerPos.x;

		this.targetPos.z =
			Math.sin(et * 0.001 * this.speed) * params.idleRadius + this.lastPlayerPos.z;

		this.targetPos.y = Math.sin(et * 0.005) * 0.01 + this.lastPlayerPos.y;
	}

	feed(et, dt) {
		this.isBlocked = true;
		console.log('feed');
	}

	toggleFeeding() {
		this.state = Pet.STATES.FEEDING ? Pet.STATES.FOLLOW : Pet.STATES.FEEDING;
		this.isBlocked = this.isBlocked ? false : true;
	}

	async stateTimeout() {
		this.timeOutStarted = true;
		await wait(params.statesTimeouts[this.state]);
		this.state = this.player.state.isMoving ? Pet.STATES.FOLLOW : Pet.STATES.IDLE;
		this.timeOutStarted = false;
	}
}

const initPet = () => {
	return new Pet();
};

const getPet = () => {
	return Pet.instance;
};

export { initPet, getPet };
