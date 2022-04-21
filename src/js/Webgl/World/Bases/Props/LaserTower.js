import { controlsKeys } from '@game/Control';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import BaseScene from '@webgl/Scene/BaseScene';
import anime from 'animejs';
import { wait } from 'philbin-packages/misc';
import { ArrowHelper, BoxGeometry, BoxHelper, Mesh, Ray, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';

export default class LaserTower extends BaseCollider {
	/**
	 *
	 * @param {{scene: BaseScene, mesh: Mesh, name: string, towerType: 'first' | 'between' | 'end', maxDistance?: number, direction?: Array<number>, laserTowers : Array<LaserTower>}} param0
	 */
	constructor({ scene, mesh, name, towerType, maxDistance = 5, direction, laserTowers = [] }) {
		super({ mesh, name, type: 'nonWalkable', isInteractable: true });

		this.towerType = towerType;
		this.maxDistance = maxDistance;

		this.isActivated = false;

		this.previousTower = null;
		this.nextTower = null;

		this.ray = new Ray();

		this.direction = new Vector3();
		if (direction) this.direction.fromArray(direction);
		else this.base.mesh.getWorldDirection(this.direction);

		this.ray.set(this.base.mesh.position, this.direction);

		this.rayHelper = new ArrowHelper(
			this.direction,
			this.base.mesh.position,
			this.maxDistance,
			0xffff00,
			0.5,
			0.2,
		);
		this.rayHelper.visible = false;
		this.rayHelper.position.y += 1;

		scene.instance.add(this.rayHelper);

		this.laserTowers = laserTowers;
		this.laserTowers.push(this);
	}

	async activate() {
		this.isActivated = true;
		await wait(200);
		this.rayHelper.visible = true;
		this.base.mesh.material.color.set(0x00ff00);

		this.update();

		if (this.nextTower && !this.nextTower.isActivated) this.nextTower.activateBy(this);
	}

	async desactivate() {
		this.isActivated = false;
		await wait(200);
		this.rayHelper.visible = false;
		this.base.mesh.material.color.set(0xff0000);

		this.update();

		if (this.nextTower && this.nextTower.isActivated) {
			console.log('Desactivate nextTower');
			this.nextTower.desactivateBy(this);
		}
	}

	activateBy(laserTower) {
		if (this.previousTower === null || this.previousTower === laserTower) {
			laserTower.nextTower = this;
			this.previousTower = laserTower;

			console.log('Activating :', this.base.name, 'by :', laserTower.base.name);

			this.activate();
		}
	}

	desactivateBy(laserTower) {
		if (this.previousTower === laserTower) {
			this.previousTower = null;

			console.log('Desactivating :', this.base.name, 'by :', laserTower.base.name);

			this.desactivate();
		}
	}

	interact(key) {
		if (this.isInBroadphaseRange) {
			if (key === controlsKeys.interact.rotate) {
				// const updateHandler = this.towerType === 'end' ? null : this.update.bind(this);
				anime({
					targets: this.base.mesh.rotation,
					y: this.base.mesh.rotation.y + Math.PI * 0.05,
					duration: 500,
					// easing: 'easeInOutQuad',
					update: this.update.bind(this),
				});
			} else if (key === controlsKeys.interact.default && this.towerType === 'first') {
				if (this.isActivated) {
					// if(this.nextTower) this.nextTower.desactivateBy(this);
					// this.desactivate();
					this.laserTowers.forEach((laserTower) => {
						if (laserTower.isActivated) laserTower.desactivate();
					});
				} else {
					this.activate();
				}
			}
		}
	}

	update() {
		const _d = this.direction.clone();
		_d.applyQuaternion(this.base.mesh.quaternion);

		this.ray.set(this.base.mesh.position, _d);

		this.rayHelper.setDirection(_d);

		this.laserTowers.forEach((nextLaserTower) => {
			// Don't test with the first, the same tower and if distance from current is above max
			const distanceFromCurrent = nextLaserTower.base.mesh.position.distanceTo(
				this.base.mesh.position,
			);
			if (
				nextLaserTower.towerType === 'first' ||
				nextLaserTower === this ||
				distanceFromCurrent >= this.maxDistance
			)
				return;

			const rayNextDistance = this.ray.distanceToPoint(nextLaserTower.base.mesh.position);

			// If the current tower is activated, activate the next one, if not, desactivate it
			if (rayNextDistance <= 0.5 && !nextLaserTower.isActivated && this.isActivated) {
				this.nextTower = nextLaserTower;
				nextLaserTower.activateBy(this);
			} else if (nextLaserTower.isActivated && rayNextDistance > 0.5) {
				nextLaserTower.desactivateBy(this);
				this.nextTower = null;
			}
		});
	}
}
