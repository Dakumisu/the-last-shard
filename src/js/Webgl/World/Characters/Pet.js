import {
	AdditiveBlending,
	Color,
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
import { deferredPromise, wait } from 'philbin-packages/async';
import { dampPrecise } from 'philbin-packages/maths';

import { loadModel, loadTexture } from '@utils/loaders/loadAssets';
import { loadDynamicGLTF as loadGLTF } from '@utils/loaders';
import AnimationController from '@webgl/Animation/Controller';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import AuraMaterial from '@webgl/Materials/AuraMaterial/AuraMaterial';
import { getWebgl } from '@webgl/Webgl';
import BaseEntity from '../Bases/BaseEntity';
import { getPlayer } from './Player';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Pet',
	tab: 'Entity',
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
	anim: 'idle',
};

const TMP_PLAYER_POS = new Vector3();
const TARGET_POS = new Vector3();
const TMP_DIR = new Vector3();
const OFFSET = new Vector3();
const UP_VECTOR = new Vector3(0, 1, 0);

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

		this.focusPos = new Vector3();
		this.state = Pet.STATES.IDLE;
		this.isTooFar = false;
		this.isFeeding = false;
		this.speed = 1;
		this.isTeleporting = false;

		this.base.group = new Group();

		this.initialized = false;

		this.isLoaded = deferredPromise();

		this.listeners();
		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.devtools();
		/// #endif
	}

	/// #if DEBUG
	devtools() {
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(this, 'speed');

		// this.initPhysicsVisualizer();
	}
	/// #endif

	async init() {
		const texture = await loadTexture('petTexture');
		texture.flipY = false;

		this.base.material = new BaseBasicMaterial({ map: texture });

		const m = await loadGLTF(model);
		m.scene.traverse((child) => {
			if (child.isMesh) child.material = this.base.material;
		});

		this.base.auraMaterial = new AuraMaterial({
			transparent: true,
			blending: AdditiveBlending,
			depthWrite: false,
			uniforms: {
				uColor: { value: new Color(0xc1f376) },
				uIntensity: { value: 0.3 },
				uRadius: { value: 0.005 },
			},
		});

		this.base.auraGeom = new IcosahedronGeometry(0.75, 3);
		this.base.auraMesh = new Mesh(this.base.auraGeom, this.base.auraMaterial);
		this.base.auraMesh.frustumCulled = false;

		this.base.model = m;
		this.base.model.scene.rotateY(PI);
		this.base.group.add(this.base.model.scene, this.base.auraMesh);

		this.base.animation = new AnimationController({ model: this.base.model, name: 'pet' });
		console.log(this.base.animation);

		this.initPhysics();

		const playerPos = this.player.getPosition();
		const playerQt = this.player.getQuaternion();
		OFFSET.set(-1, 0, 0).applyQuaternion(playerQt);
		TARGET_POS.copy(playerPos).add(OFFSET);
		this.base.group.position.copy(TARGET_POS);
		TMP_PLAYER_POS.copy(playerPos);

		this.scene.add(this.base.group);

		this.isLoaded.resolve();

		this.initialized = true;
	}

	listeners() {
		signal.on('dialog:start', () => {
			if (this.isTooFar) this.speak().teleport(true);
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

		if (this.isTooFar && this.state !== Pet.STATES.FEEDING) {
			await this.teleport();
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

		// if (previousAnim != pet.anim) {
		// 	previousAnim = pet.anim;
		// 	this.base.animation.switch(pet.anim);
		// }
		// this.base.animation.update(dt);
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

		pet.anim = this.base.animation.get('follow');

		return this;
	}

	idle(et) {
		let time = et * 0.001;

		const playerQt = this.player.getQuaternion();
		OFFSET.set(-1, 0, 0).applyQuaternion(playerQt);

		const playerPos = this.player.getPosition();
		TMP_PLAYER_POS.copy(playerPos);

		TARGET_POS.copy(playerPos).add(OFFSET);

		// pet.anim = this.base.animation.get('idle');

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

		const playerQt = this.player.getQuaternion();
		OFFSET.set(-1, 0, 0).applyQuaternion(playerQt);

		TARGET_POS.copy(playerPos).add(TMP_DIR).add(OFFSET);
		this.focusPos.copy(TARGET_POS).addScaledVector(UP_VECTOR, 0.5);

		// pet.anim = this.base.animation.get('speak');

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

	async teleport(force = false) {
		if (this.isTeleporting) return;
		this.isTeleporting = true;

		if (!force) await this.hide();

		const playerPos = this.player.getPosition();
		const playerQt = this.player.getQuaternion();
		OFFSET.set(-1, 0, 0).applyQuaternion(playerQt);
		TARGET_POS.copy(playerPos).add(OFFSET);
		TMP_PLAYER_POS.copy(playerPos);
		this.base.group.position.copy(TARGET_POS);

		signal.emit('sound:play', 'pet-tp');

		await this.show();

		this.isTeleporting = false;

		return this;
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

	getPosition() {
		return this.base.group.position;
	}

	getFocusPosition() {
		return this.focusPos;
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

const initPet = async () => {
	const pet = new Pet();
	await pet.isLoaded;
	return pet;
};

const getPet = () => {
	return Pet.instance;
};

export { initPet, getPet };
