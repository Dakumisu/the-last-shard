import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import FragmentMaterial from '@webgl/Materials/Fragment/FragmentMaterial';
import { dampPrecise } from 'philbin-packages/maths';
import { DoubleSide } from 'three';
import BaseCollider from '../BaseCollider';

// let dummy_alpha = 1;
// let material;

export default class Fragment extends BaseCollider {
	constructor({ asset = null, group }) {
		super({ type: 'nonWalkable', isInteractable: true });

		this.base.asset = asset;
		this.base.group = group;

		this.material = new FragmentMaterial();
		this.alpha = 1;

		this.initialized = false;
	}

	async init() {
		await super.init();

		this.base.mesh.traverse((obj) => {
			if (obj.material) {
				obj.material = this.material;
			}
		});

		this.initialized = true;
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;

		this.alpha = 0;

		console.log('interact with fragment');
	}

	update(et, dt) {
		if (!this.initialized) return;

		this.material.uniforms.uAlpha.value = dampPrecise(
			this.material.uniforms.uAlpha.value,
			this.alpha,
			0.1,
			dt,
		);
	}
}
