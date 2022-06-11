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
	idleRadius: 2,
	statesTimeouts: [4000, 2000],
	floatHeight: 0.25,
};

const pet = {
	anim: null,
};

const TMP_PLAYER_POS = new Vector3();
const TARGET_POS = new Vector3();
const TMP_DIR = new Vector3();
const OFFSET = new Vector3();

let previousAnim = null;
let isTeleporting = false;

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

		this.focusPos = new Vector3();
		this.state = Pet.STATES.IDLE;
		this.isTooFar = false;
		this.isFeeding = false;
		this.speed = 1;

		this.base.group = new Group();

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif

		this.initialized = false;

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
		this.base.model.scene.rotateY(PI);
		this.base.group.add(this.base.model.scene);

		// this.base.animation = new AnimationController({ model: this.base.model, name: 'pet' });

		this.base.geometry = new IcosahedronGeometry(0.1, 3);
		this.base.mesh = new Mesh(this.base.geometry);

		this.initPhysics();

		const playerPos = this.player.getPosition();
		const playerQt = this.player.getQuaternion();
		OFFSET.set(-1, 0, 0).applyQuaternion(playerQt);
		TARGET_POS.copy(playerPos).add(OFFSET);
		this.base.group.position.copy(TARGET_POS);
		TMP_PLAYER_POS.copy(playerPos);

		this.scene.add(this.base.group);

		this.initialized = true;

		/// #if DEBUG
		this.devtools();
		/// #endif
	}

	listeners() {
		signal.on('dialog:start', () => {
			this.state = Pet.STATES.SPEAKING;
		});
		signal.on('dialog:complete', () => {
			this.state = Pet.STATES.IDLE;
		});
	}

	async update(et, dt) {
		if (!this.initialized) return;

		const d = this.getDistanceToPlayer();
		this.isTooFar = d >= 10;

		if (this.isTooFar && !isTeleporting) {
			isTeleporting = true;
			await this.teleport();
			isTeleporting = false;
		}

		if (this.isTooFar) return;

		this.updateState();

		switch (this.state) {
			case Pet.STATES.FOLLOW:
				this.follow().float(et).dampPosition(dt, 0.04);
				break;
			case Pet.STATES.IDLE:
				this.idle(et).float(et).dampPosition(dt, 0.015);
				break;
			case Pet.STATES.FEEDING:
				this.feed().dampPosition(dt, 0.1);
				break;
			case Pet.STATES.SPEAKING:
				this.speak().float(et).dampPosition(dt, 0.075);
				break;
		}

		// this.base.animation.update(et, dt)
		// if (previousAnim != pet.anim) {
		// 	previousAnim = pet.anim;
		// 	this.base.animation.switch(pet.anim)
		// }
	}

	updateState(force) {
		if (this.state === Pet.STATES.FEEDING || this.state === Pet.STATES.SPEAKING) return;
		if (!this.player.state.isMoving) this.state = Pet.STATES.IDLE;
		else this.state = Pet.STATES.FOLLOW;
	}

	getDistanceToPlayer() {
		const playerPos = this.player.getPosition();
		return this.base.group.position.distanceTo(playerPos);
	}

	follow() {
		this.lookAtPlayer();

		const playerPos = this.player.getPosition();
		TMP_PLAYER_POS.copy(playerPos);

		this.player.getDirection(TMP_DIR);
		TARGET_POS.copy(playerPos).add(TMP_DIR);

		// pet.anim = this.base.animation.get('follow')

		return this;
	}

	idle(et) {
		let time = et * 0.001;

		const playerQt = this.player.getQuaternion();
		OFFSET.set(-1, 0, 0).applyQuaternion(playerQt);

		const playerPos = this.player.getPosition();
		TMP_PLAYER_POS.copy(playerPos);

		TARGET_POS.copy(playerPos).add(OFFSET);

		// pet.anim = this.base.animation.get('idle')

		return this;
	}

	feed() {
		// pet.anim = this.base.animation.get('feed')

		return this;
	}

	speak() {
		this.lookAtPlayer();

		const playerPos = this.player.getPosition();
		TMP_PLAYER_POS.copy(playerPos);

		this.player.getDirection(TMP_DIR);
		TMP_DIR.negate();

		TARGET_POS.copy(playerPos).add(TMP_DIR).addScalar(0.5);
		this.focusPos.copy(TARGET_POS);

		// pet.anim = this.base.animation.get('speak')

		return this;
	}

	float(et) {
		let time = et * 0.001;

		const playerPos = this.player.getPosition();
		TMP_PLAYER_POS.copy(playerPos);

		TARGET_POS.y =
			TMP_PLAYER_POS.y + 0.5 + Math.sin(time * this.speed) * 0.15 + params.floatHeight;

		return this;
	}

	async teleport() {
		await this.hide();

		const playerPos = this.player.getPosition();
		const playerQt = this.player.getQuaternion();
		OFFSET.set(-1, 0, 0).applyQuaternion(playerQt);
		TARGET_POS.copy(playerPos).add(OFFSET);
		TMP_PLAYER_POS.copy(playerPos);
		this.base.group.position.copy(TARGET_POS);

		await this.show();

		return this;
	}

	getPosition() {
		return this.base.group.position;
	}

	getFocusPosition() {
		return this.focusPos;
	}

	feedOn(target = null) {
		if (!target) {
			console.error('No target provided');
			return;
		}

		if (this.isFeeding) return;

		this.isFeeding = true;
		TARGET_POS.copy(target).setY(target.y - 0.3);
		this.state = Pet.STATES.FEEDING;
	}

	feedOff() {
		this.state = Pet.STATES.FOLLOW;
		this.isFeeding = false;
	}

	dampPosition(dt, factor) {
		this.base.group.position.x = dampPrecise(
			this.base.group.position.x,
			TARGET_POS.x,
			factor,
			dt,
			0.001,
		);

		if (!this.player.state.hasJumped)
			this.base.group.position.y = dampPrecise(
				this.base.group.position.y,
				TARGET_POS.y,
				factor,
				dt,
				0.001,
			);

		this.base.group.position.z = dampPrecise(
			this.base.group.position.z,
			TARGET_POS.z,
			factor,
			dt,
			0.001,
		);
	}

	lookAtPlayer() {
		const { x, z } = this.player.getPosition();
		this.base.group.lookAt(x, this.base.group.position.y, z);
	}
}

const initPet = () => {
	return new Pet();
};

const getPet = () => {
	return Pet.instance;
};

export { initPet, getPet };
