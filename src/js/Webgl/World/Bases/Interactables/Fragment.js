import { controlsKeys } from '@game/Control';
import LaserGame from '@game/LaserGame';
import { loadDynamicGLTF } from '@utils/loaders';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import anime from 'animejs';
import { Mesh, Ray, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';
import { loadModel } from '@utils/loaders/loadAssets';
import { Group } from 'three';
import { DoubleSide } from 'three';
import { Color } from 'three';

export default class Fragment extends BaseCollider {
	constructor({ asset = null, direction = null, game, group }) {
		super({ mesh: null, name, type: 'nonWalkable', isInteractable: true });

		this.base.asset = asset;
		this.base.group = group;

		this.initialized = false;
	}

	async init() {
		await super.init();

		this.initialized = true;
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;

		// this.base.mesh.geometry.dispose();
		// this.base.mesh.material.dispose();
		// this.base.mesh = null;

		console.log('interact with fragment');
	}

	update() {
		if (!this.initialized) return;
	}
}
