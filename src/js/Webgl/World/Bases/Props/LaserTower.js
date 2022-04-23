import { controlsKeys } from '@game/Control';
import LaserGame from '@game/LaserGame';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import BaseScene from '@webgl/Scene/BaseScene';
import anime from 'animejs';
import { wait } from 'philbin-packages/misc';
import {
	ArrowHelper,
	BoxGeometry,
	BoxHelper,
	BufferGeometry,
	LineBasicMaterial,
	Mesh,
	Ray,
	Vector3,
} from 'three';
import BaseCollider from '../BaseCollider';

export default class LaserTower extends BaseCollider {
	/**
	 *
	 * @param {{mesh: Mesh, name: string, towerType: 'first' | 'between' | 'end', maxDistance?: number, direction?: Array<number>, game: LaserGame}} param0
	 */
	constructor({ mesh, name, towerType, maxDistance = 5, direction, game }) {
		super({ mesh, name, type: 'nonWalkable', isInteractable: true });

		this.towerType = towerType;
		this.maxDistance = maxDistance;

		this.rayLength = 0;

		this.isActivated = false;

		this.previousTower = null;
		this.nextTower = null;

		this.ray = new Ray();

		this.direction = new Vector3();
		if (direction) this.direction.fromArray(direction);
		else this.base.mesh.getWorldDirection(this.direction);

		this.ray.set(this.base.mesh.position, this.direction);

		this.animation = null;

		this.game = game;
		this.game.laserTowers.push(this);
	}

	activate() {
		this.isActivated = true;
		this.base.mesh.material.color.set(0x00ff00);

		this.game.addPointToGeometry(this.base.mesh.position);

		if (this.nextTower && !this.nextTower.isActivated) this.nextTower.activateBy(this);
		this.update();
	}

	desactivate() {
		this.isActivated = false;
		this.base.mesh.material.color.set(0xff0000);

		this.game.removePointFromGeometry(this.base.mesh.position);

		if (this.nextTower && this.nextTower.isActivated) {
			this.nextTower.desactivateBy(this);
			this.nextTower = null;
		}

		this.update();
	}

	activateBy(laserTower) {
		if (this.previousTower && this.previousTower !== laserTower) return;

		laserTower.nextTower = this;
		this.previousTower = laserTower;

		this.activate();
	}

	desactivateBy(laserTower) {
		if (this.previousTower !== laserTower) return;

		this.previousTower = null;

		this.desactivate();
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;

		if (key === controlsKeys.interact.rotate) {
			const updateHandler = this.towerType === 'end' ? null : this.update.bind(this);
			if (this.animation && !this.animation.paused) this.animation.pause();
			this.animation = anime({
				targets: this.base.mesh.rotation,
				y: this.base.mesh.rotation.y + Math.PI * 0.05,
				duration: 300,
				easing: 'easeOutQuad',
				update: updateHandler,
			});
		} else if (key === controlsKeys.interact.default && this.towerType === 'first') {
			if (this.isActivated) this.desactivate();
			else this.activate();
		}
	}

	update() {
		const _d = this.direction.clone();
		_d.applyQuaternion(this.base.mesh.quaternion);

		this.ray.set(this.base.mesh.position, _d);

		const _newMaxDistance = this.base.mesh.position
			.clone()
			.addScaledVector(_d, this.maxDistance);

		this.game.maxDistancePoint.set(_newMaxDistance.x, _newMaxDistance.y, _newMaxDistance.z);
		this.game.updateGeometry();

		this.game.laserTowers.forEach((nextLaserTower) => {
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
				if (this.animation && !this.animation.paused) {
					console.log('animation is paused');
					this.animation.pause();
				}
				nextLaserTower.activateBy(this);
			} else if (nextLaserTower.isActivated && rayNextDistance > 0.5) {
				nextLaserTower.desactivateBy(this);
			}
		});
	}
}
