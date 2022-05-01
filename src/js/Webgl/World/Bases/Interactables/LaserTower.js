import { controlsKeys } from '@game/Control';
import LaserGame from '@game/LaserGame';
import { loadDynamicGLTF } from '@utils/loaders';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import anime from 'animejs';
import { CylinderGeometry, Mesh, Ray, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';
import { loadModel } from '@utils/loaders/loadAssets';
import { Group } from 'three';
import { DoubleSide } from 'three';
import { Color } from 'three';
import { LaserMaterial } from '@webgl/Materials/Laser/material';

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

	constructor({ asset = {}, direction = null, game, group }) {
		super({ type: 'nonWalkable', isInteractable: true });

		this.game = game;
		this.game.laserTowers.push(this);

		this.asset = asset;
		this.group = group;

		this.type = asset.asset.split('LaserTower').pop().toLowerCase();
		this.maxDistance = asset.params.distance;

		this.laserMesh = null;

		this.isActivated = false;

		this.previousTower = null;
		this.nextTower = null;

		this.ray = new Ray();

		this.baseDirection = direction;
		this.direction = new Vector3();

		this.animation = null;

		this.initialized = false;
	}

	async init() {
		await this.loadAsset();

		if (this.baseDirection) this.direction.fromArray(this.baseDirection);
		else this.base.mesh.getWorldDirection(this.direction);

		this.ray.set(this.base.mesh.position, this.direction);

		this.laserMesh = new Mesh(this.game.laserGeometry, this.game.laserMaterial);
		this.laserMesh.scale.set(1, 1, this.maxDistance);
		this.laserMesh.visible = false;

		this.base.mesh.add(this.laserMesh);

		this.initialized = true;
	}

	async loadAsset() {
		this.base.mesh = await LaserTower.getModel(this.type, this.asset.asset);

		const { asset, transforms, type, traversable } = this.asset;

		const material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#ED4646'),
		});

		this.base.mesh.material = material;

		this.base.mesh.position.fromArray(transforms.pos);
		this.base.mesh.quaternion.fromArray(transforms.qt);
		this.base.mesh.scale.fromArray(transforms.scale);
		// this.base.mesh.scale.setScalar(0.00001);
		this.base.mesh.name = asset;

		this.base.mesh.propType = type;
		this.base.mesh.traversable = traversable;

		this.group.add(this.base.mesh);

		// anime({
		// 	targets: this.base.mesh.scale,
		// 	easing: 'spring(1, 190, 10, 1)',
		// 	duration: 1000,
		// 	x: [0.00001, transforms.scale[0]],
		// 	y: [0.00001, transforms.scale[1]],
		// 	z: [0.00001, transforms.scale[2]],
		// });
	}

	activate() {
		this.isActivated = true;
		if (this.type === 'end') this.game.endEvent();

		this.laserMesh.visible = true;

		if (this.nextTower && !this.nextTower.isActivated) this.nextTower.activateBy(this);

		this.update();
	}

	desactivate() {
		this.isActivated = false;

		this.laserMesh.visible = false;
		this.laserMesh.scale.z = this.maxDistance;

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
		const _d = this.direction.clone();
		_d.applyQuaternion(this.base.mesh.quaternion);

		this.ray.direction.copy(_d);

		if (this.laserMesh.scale.z !== this.maxDistance) this.laserMesh.scale.z = this.maxDistance;
		// this.ray.set(this.base.mesh.position, _d);

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
				this.laserMesh.scale.z = distanceFromCurrent;
				nextLaserTower.activateBy(this);
			} else if (nextLaserTower.isActivated && rayNextDistance > 0.1) {
				nextLaserTower.desactivateBy(this);
			}
		});
	}

	static async getModel(type, asset) {
		let geo;

		if (LaserTower.geometries[type]) geo = LaserTower.geometries[type].clone();
		else {
			geo = (await loadModel(asset)).geometry;
			LaserTower.geometries[type] = geo;
		}

		return new Mesh(geo, new BaseToonMaterial({ color: 0xffffff }));
	}
}
