import { getDom } from '@dom/Dom';
import { getGame } from '@game/Game';
import { store } from '@tools/Store';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import FragmentMaterial from '@webgl/Materials/Fragment/FragmentMaterial';
import { dampPrecise } from 'philbin-packages/maths';
import { DoubleSide, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';

const params = {
	speed: 1,
	floatHeight: 0.25,
};

let dom;
let game;

export default class Fragment extends BaseCollider {
	constructor({ asset = null, group }) {
		super({ type: 'nonWalkable', isInteractable: true });

		this.base.asset = asset;
		this.base.group = group;
		this.autoUpdate = true;

		this.material = new FragmentMaterial();
		this.alpha = 1;
		this.isCollected = false;

		dom = getDom();
		game = getGame();

		this.initialized = false;
	}

	async init() {
		await super.init();

		this.base.mesh.traverse((obj) => {
			if (obj.material) {
				obj.material = this.material;
			}
		});

		this.defaultPosY = this.base.asset.transforms.pos[1];
		this.TARGET_POS_Y = this.defaultPosY;

		this.initialized = true;
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;
		if (this.isCollected) return;

		this.isCollected = true;
		store.game.fragmentsCollected++;
		dom.nodes.domElements['fragment_count'].innerHTML = `${store.game.fragmentsCollected}`;
		game.save('fragments', store.game.fragmentsCollected);

		this.alpha = 0;

		console.log('interact with fragment');
	}

	float(et) {
		let time = et * 0.001;

		this.TARGET_POS_Y =
			this.defaultPosY + 0.5 + Math.sin(time * params.speed) * 0.15 + params.floatHeight;

		return this;
	}

	dampPosition(dt, factor) {
		// this.base.mesh.position.x = dampPrecise(
		// 	this.base.mesh.position.x,
		// 	this.TARGET_POS.x,
		// 	factor,
		// 	dt,
		// 	0.001,
		// );

		this.base.mesh.position.y = dampPrecise(
			this.base.mesh.position.y,
			this.TARGET_POS_Y,
			factor,
			dt,
			0.001,
		);

		// this.base.mesh.position.z = dampPrecise(
		// 	this.base.mesh.position.z,
		// 	this.TARGET_POS.z,
		// 	factor,
		// 	dt,
		// 	0.001,
		// );
	}

	update(et, dt) {
		if (!this.initialized) return;

		this.float(et).dampPosition(dt, 0.1);

		this.material.uniforms.uAlpha.value = dampPrecise(
			this.material.uniforms.uAlpha.value,
			this.alpha,
			0.2,
			dt,
		);
	}
}
