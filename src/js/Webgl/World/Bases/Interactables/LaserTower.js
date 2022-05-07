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

export default class LaserTower extends BaseCollider {
	/**
	 *
	 * @param {{ asset?: Object, direction?: Array<number>, laserYOffset: number, game: LaserGame, group?: Group}} param0
	 */
	static geometries = {
		start: null,
		between: null,
		end: null,
	};
	constructor({ asset = null, direction = null, game, group }) {
		super({ mesh: null, name, type: 'nonWalkable', isInteractable: true });

		this.base.asset = asset;
		this.base.group = group;

		this.type = asset.asset.split('LaserTower').pop().toLowerCase();
		this.maxDistance = asset.params.distance;

		this.rayLength = 0;

		this.isActivated = false;

		this.previousTower = null;
		this.nextTower = null;

		this.ray = new Ray();

		this.baseDirection = direction;
		this.direction = new Vector3();

		this.animation = null;

		this.game = game;
		this.game.laserTowers.push(this);

		this.initialized = false;
	}

	async init() {
		await super.init();

		if (this.baseDirection) this.direction.fromArray(this.baseDirection);
		else this.base.mesh.getWorldDirection(this.direction);

		this.ray.set(this.base.mesh.position, this.direction);

		this.initialized = true;
	}

	activate() {
		this.isActivated = true;

		this.game.addPointToGeometry(this.base.mesh.position, this.type === 'end');

		if (this.nextTower && !this.nextTower.isActivated) this.nextTower.activateBy(this);

		this.update();
	}

	desactivate() {
		this.isActivated = false;

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

		if (key === controlsKeys.interact.rotate && this.type !== 'end') {
			if (this.animation && !this.animation.paused) this.animation.pause();
			let yOffset = this.base.mesh.rotation.y + Math.PI * 0.05;
			if (this.nextTower) yOffset += Math.PI * 0.05;
			this.animation = anime({
				targets: this.base.mesh.rotation,
				y: yOffset,
				duration: 300,
				easing: 'easeOutQuad',
				update: this.update.bind(this),
			});
		} else if (key === controlsKeys.interact.default && this.type === 'start') {
			if (this.isActivated) this.desactivate();
			else this.activate();
		}
	}

	update() {
		if (!this.initialized) return;

		const _d = this.direction.clone();
		_d.applyQuaternion(this.base.mesh.quaternion);

		this.ray.set(this.base.mesh.position, _d);

		const _newMaxDistance = this.base.mesh.position
			.clone()
			.addScaledVector(_d, this.maxDistance);

		this.game.updateMaxDistancePoint(_newMaxDistance);

		this.game.laserTowers.forEach((nextLaserTower) => {
			// Don't test with the start, the same tower and if distance from current is above max
			const distanceFromCurrent = nextLaserTower.base.mesh.position.distanceTo(
				this.base.mesh.position,
			);
			if (
				nextLaserTower.towerType === 'start' ||
				nextLaserTower === this ||
				distanceFromCurrent >= this.maxDistance
			)
				return;

			const rayNextDistance = this.ray.distanceToPoint(nextLaserTower.base.mesh.position);

			// If the current tower is activated, activate the next one, if not, desactivate it
			if (rayNextDistance <= 0.1 && !nextLaserTower.isActivated && this.isActivated) {
				if (this.animation && !this.animation.paused) this.animation.pause();
				nextLaserTower.activateBy(this);
			} else if (nextLaserTower.isActivated && rayNextDistance > 0.1)
				nextLaserTower.desactivateBy(this);
		});
	}
}
