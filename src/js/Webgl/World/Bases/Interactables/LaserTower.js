import { controlsKeys } from '@game/Control';
import LaserGame from '@game/LaserGame';
import anime from 'animejs';
import { ArrowHelper, Mesh, Ray, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';
import { Group } from 'three';
import { Pet } from '@webgl/World/Characters/Pet';
import Timer from '@game/Timer';

export default class LaserTower extends BaseCollider {
	/**
	 *
	 * @param {{ asset?: Object, direction?: Array<number>, game: LaserGame, group?: Group}} param0
	 */
	constructor({ asset = null, direction = null, game, group }) {
		super({ type: 'nonWalkable', isInteractable: true });

		this.base.asset = asset;
		this.base.group = group;

		this.type = asset.asset.split('LaserTower').pop().toLowerCase();
		this.maxDistance = asset.params.distance;

		this.laserGroup = new Group();

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

		this.innerLaser = new Mesh(this.game.laserGeometry, this.game.laserMaterialInner);
		this.outerLaser = new Mesh(this.game.laserGeometry, this.game.laserMaterialOuter);

		this.laserGroup.scale.set(1, 1, this.maxDistance);
		this.laserGroup.add(this.innerLaser, this.outerLaser);
		this.laserGroup.visible = false;

		this.base.mesh.add(this.laserGroup);

		if (this.type === 'start')
			this.timer = new Timer(
				1000,
				() => this.desactivate(),
				(et) => {
					console.log(et);
				},
			);

		this.initialized = true;
	}

	activate() {
		this.isActivated = true;
		if (this.type === 'start') {
			this.timer.start();
			this.game.pet.toggleFeeding(this.base.mesh.position.clone().setY(2));
		}

		if (this.type === 'end') this.game.endEvent();

		this.laserGroup.visible = true;

		if (this.nextTower && !this.nextTower.isActivated) this.nextTower.activateBy(this);

		this.update();
	}

	desactivate() {
		this.isActivated = false;
		if (this.type === 'start') {
			this.timer.stop();
			this.game.pet.toggleFeeding();
		}

		this.laserGroup.visible = false;
		this.laserGroup.scale.z = this.maxDistance;

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
		if (!this.isInBroadphaseRange || !this.base.isInteractable) return;

		if (key === controlsKeys.interact.rotate && this.type !== 'end') {
			if (this.animation && !this.animation.paused) this.animation.pause();
			let yOffset = this.base.mesh.rotation.y + Math.PI * 0.05;
			if (this.nextTower) yOffset += Math.PI * 0.05;
			const updateHandler = this.isActivated ? this.update.bind(this) : null;
			this.animation = anime({
				targets: this.base.mesh.rotation,
				y: yOffset,
				duration: 300,
				easing: 'easeOutQuad',
				update: updateHandler,
			});
		} else if (key === controlsKeys.interact.default && this.type === 'start') {
			if (this.isActivated) this.desactivate();
			else this.activate();
		}
	}

	update() {
		if (!this.initialized) return;

		this.base.mesh.getWorldDirection(this.ray.direction);

		if (this.laserGroup.scale.z !== this.maxDistance)
			this.laserGroup.scale.z = this.maxDistance;

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
				this.laserGroup.scale.z = distanceFromCurrent;
				nextLaserTower.activateBy(this);
			} else if (nextLaserTower.isActivated && rayNextDistance > 0.1) {
				nextLaserTower.desactivateBy(this);
			}
		});
	}
}
