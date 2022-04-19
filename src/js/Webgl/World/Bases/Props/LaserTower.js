import { controlsKeys } from '@game/Control';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import BaseScene from '@webgl/Scene/BaseScene';
import anime from 'animejs';
import { ArrowHelper, BoxGeometry, Mesh, Ray, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';

export default class LaserTower extends BaseCollider {
	static laserTowers = [];
	/**
	 *
	 * @param {{scene: BaseScene, mesh: Mesh, name: string, towerType: 'first' | 'between' | 'end'}} param0
	 */
	constructor({ scene, mesh, name, towerType }) {
		super({ mesh, name, type: 'nonWalkable', isInteractable: true });

		this.towerType = towerType;

		this.direction = new Vector3();
		this.ray = new Ray();

		this.base.mesh.getWorldDirection(this.direction);
		this.ray.set(this.base.mesh.position, this.direction);

		/// #if DEBUG
		this.rayHelper = new ArrowHelper(
			this.direction,
			this.base.mesh.position,
			0.9,
			0xffff00,
			10,
			0.08,
		);
		this.rayHelper.position.y += 1;
		scene.instance.add(this.rayHelper);
		/// #endif

		LaserTower.laserTowers.push(this);
	}

	activate() {}

	desactivate() {}

	interact(key) {
		if (this.isInBroadphaseRange) {
			console.log('🎮 Interacting with :', this.base.name);
			if (key === controlsKeys.interact.rotate) {
				anime({
					targets: this.base.mesh.rotation,
					y: this.base.mesh.rotation.y + Math.PI * 0.05,
					duration: 500,
					update: this.update.bind(this),
				});
			} else if (key === controlsKeys.interact.default) {
				console.log('Launch laser');
			}
		}
	}

	update() {
		this.base.mesh.getWorldDirection(this.direction);
		this.ray.set(this.base.mesh.position, this.direction);

		/// #if DEBUG
		this.rayHelper.setDirection(this.direction);
		/// #endif
	}
}
