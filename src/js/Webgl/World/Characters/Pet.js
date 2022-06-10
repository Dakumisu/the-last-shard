import { loadModel } from '@utils/loaders/loadAssets';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { getWebgl } from '@webgl/Webgl';
import anime from 'animejs';
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
	offsetFromPlayer: new Vector3(-1, 1, 1),
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
		this.base.geometry = new IcosahedronGeometry(0.1, 3);
		// this.base.material = new BaseBasicMaterial({ color: '#C1C2FF' });

		this.base.group = await loadModel('lua');
		this.base.group.scale.setScalar(1.5);

		// this.base.group.traverse((child) => {
		// 	if (child.isMesh) child.material = this.base.material;
		// });

		this.base.mesh = new Mesh(this.base.geometry);

		this.initPhysics();

		/// #if DEBUG
		this.devltools();
		/// #endif

		this.targetPos.copy(this.player.base.mesh.position).add(params.offsetFromPlayer);

		this.base.group.position.copy(this.targetPos);
		this.lastPlayerPos.copy(this.player.base.mesh.position);

		this.scene.add(this.base.group);
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

		if (!this.timeOutStarted && this.state !== Pet.STATES.FEEDING) this.stateTimeout();

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

	follow(et, dt) {
		this.lookAtPlayer();
		this.dampPosition(dt, 0.05);

		this.lastPlayerPos.copy(this.player.base.mesh.position);

		const _dir = new Vector3();
		// this.player.base.mesh.getWorldDirection(_dir);
		// _dir.negate();

		this.targetPos.copy(this.player.base.mesh.position).add(_dir).add(params.offsetFromPlayer);
	}

	idle(et, dt) {
		this.lookAtPlayer();
		this.dampPosition(dt, 0.01);

		this.targetPos.x =
			Math.cos(et * 0.001 * this.speed) * params.idleRadius + this.lastPlayerPos.x;

		this.targetPos.z =
			Math.sin(et * 0.001 * this.speed) * params.idleRadius + this.lastPlayerPos.z;
	}

	feed(et, dt) {
		this.dampPosition(dt, 0.1);
	}

	toggleFeeding(targetPos = null) {
		if (!this.isBlocked && targetPos) {
			this.isBlocked = true;
			this.targetPos.copy(targetPos).setY(targetPos.y - 0.3);
			this.state = Pet.STATES.FEEDING;
		} else {
			this.state = Pet.STATES.FOLLOW;
			this.isBlocked = false;
		}
	}

	dampPosition(dt, factor) {
		this.base.group.position.x = dampPrecise(
			this.base.group.position.x,
			this.targetPos.x,
			factor,
			dt,
			0.001,
		);

		if (!this.player.state.hasJumped)
			this.base.group.position.y = dampPrecise(
				this.base.group.position.y,
				this.targetPos.y,
				factor,
				dt,
				0.001,
			);

		this.base.group.position.z = dampPrecise(
			this.base.group.position.z,
			this.targetPos.z,
			factor,
			dt,
			0.001,
		);
	}

	lookAtPlayer() {
		this.base.group.lookAt(
			this.player.base.mesh.position.x,
			this.base.group.position.y,
			this.player.base.mesh.position.z,
		);
	}

	async stateTimeout() {
		this.timeOutStarted = true;
		await wait(params.statesTimeouts[this.state]);
		if (!this.isBlocked)
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
