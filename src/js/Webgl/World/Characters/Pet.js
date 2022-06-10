import {
	Euler,
	Group,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	Quaternion,
	Vector3,
} from 'three';
import anime from 'animejs';
import signal from 'philbin-packages/signal';
import { wait } from 'philbin-packages/async';
import { dampPrecise } from 'philbin-packages/maths';

import { loadModel } from '@utils/loaders/loadAssets';
import { loadDynamicGLTF as loadGLTF } from '@utils/loaders';
import AnimationController from '@webgl/Animation/Controller';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { getWebgl } from '@webgl/Webgl';
import BaseEntity from '../Bases/BaseEntity';
import { getPlayer } from './Player';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Pet',
	tab: 'Player',
};
/// #endif

const PI = Math.PI;

const model = '/assets/model/lua.glb';

const params = {
	offsetFromPlayer: new Vector3(-1, 1, 1),
	idleRadius: 2,
	statesTimeouts: [4000, 2000],
};

const pet = {
	anim: null,
};

let previousAnim = null;

export class Pet extends BaseEntity {
	static STATES = {
		FOLLOW: 0,
		IDLE: 1,
		FEEDING: 2,
		SPEAKING: 3,
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
		this.base.group = new Group();

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif

		this.isInitialized = false;

		this.listeners();
		this.init();
	}

	/// #if DEBUG
	devtools() {
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(this, 'speed');

		this.initPhysicsVisualizer();
	}
	/// #endif

	async init() {
		this.base.material = new BaseBasicMaterial({ color: '#C1C2FF' });

		const m = await loadGLTF(model);

		m.scene.traverse((child) => {
			if (child.isMesh) child.material = this.base.material;
		});

		this.base.model = m;
		console.log(m);
		this.base.model.scene.rotateY(PI);
		this.base.group.add(this.base.model.scene);

		// this.base.animation = new AnimationController({ model: this.base.model, name: 'pet' });

		this.base.geometry = new IcosahedronGeometry(0.1, 3);
		this.base.mesh = new Mesh(this.base.geometry);

		this.initPhysics();

		/// #if DEBUG
		this.devtools();
		/// #endif

		this.targetPos.copy(this.player.getPosition()).add(params.offsetFromPlayer);

		this.base.group.position.copy(this.targetPos);
		this.lastPlayerPos.copy(this.player.getPosition());

		this.scene.add(this.base.group);
		this.isInitialized = true;
	}

	listeners() {
		signal.on('dialog:start', () => {
			this.state = Pet.STATES.SPEAKING;
		});
		signal.on('dialog:complete', () => {
			this.state = Pet.STATES.IDLE;
		});
	}

	update(et, dt) {
		if (!this.isInitialized) return;

		console.log(this.state);
		if (
			!this.timeOutStarted &&
			this.state !== Pet.STATES.FEEDING &&
			this.state !== Pet.STATES.SPEAKING
		)
			this.stateTimeout();

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
				break;
			case Pet.STATES.SPEAKINK:
				this.speak(et, dt);
				break;
		}
	}

	follow(et, dt) {
		this.lookAtPlayer();
		this.dampPosition(dt, 0.05);

		this.lastPlayerPos.copy(this.player.getPosition());

		const _dir = new Vector3();
		// this.player.base.mesh.getWorldDirection(_dir);
		// _dir.negate();

		this.targetPos.copy(this.player.getPosition()).add(_dir).add(params.offsetFromPlayer);
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

	speak(et, dt) {
		this.lookAtPlayer();

		// pet.anim = this.base.animation.get('speak')
		// if (previousAnim != pet.anim) this.base.animation.switch(pet.anim)
		// this.base.animation.update(et, dt)
	}

	getPosition() {
		return this.base.group.position;
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
		const { x, z } = this.player.getPosition();
		this.base.group.lookAt(x, this.base.group.position.y, z);
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
