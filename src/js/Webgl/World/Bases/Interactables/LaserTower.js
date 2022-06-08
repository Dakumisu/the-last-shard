import { controlsKeys } from '@game/Control';
import LaserGame from '@game/LaserGame';
import anime from 'animejs';
import { ArrowHelper, Box3, Box3Helper, MathUtils, Mesh, Ray, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';
import { Group } from 'three';
import { Pet } from '@webgl/World/Characters/Pet';
import Timer from '@game/Timer';
import signal from 'philbin-packages/signal';
import { clamp, damp, dampPrecise, lerp } from 'philbin-packages/maths';
import { getWebgl } from '@webgl/Webgl';

const params = {
	ringRotationOffset: {
		max: 0.02,
		min: 0,
	},
	tiltYOffset: 0.0005,
};

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

		if (this.type !== 'end') this.laserGroup = new Group();

		this.isActivated = false;
		this.needsUpdate = false;

		this.previousTower = null;
		this.nextTower = null;

		this.ray = new Ray();

		this.baseDirection = direction;
		this.direction = new Vector3();

		this.tiltY = this.tiltYTarget = 0;
		signal.on('scroll', this.tilt);

		this.ringRotationOffset = params.ringRotationOffset.min;

		this.animation = null;

		this.game = game;
		this.game.laserTowers.push(this);

		this.initialized = false;
	}

	async init() {
		await super.init();

		this.rings = this.base.mesh.children.filter((children) => children.name.includes('ring'));
		this.sphereGroup = this.base.mesh.children.find((children) =>
			children.name.includes('sphereGroup'),
		);
		this.sphere = this.sphereGroup.children[0];
		this.sphere.material = LaserGame.sphereMaterial;
		this.sphereWorldPos = this.base.mesh.position.clone();
		this.base.mesh.localToWorld(this.sphereWorldPos);
		// .setY(this.sphereGroup.position.y + this.base.mesh.position.y);

		if (this.baseDirection) this.direction.fromArray(this.baseDirection);
		else this.sphere.getWorldDirection(this.direction);

		this.ray.set(this.sphereWorldPos, this.direction);

		this.innerLaser = new Mesh(this.game.laserGeometry, this.game.laserMaterialInner);
		this.outerLaser = new Mesh(this.game.laserGeometry, this.game.laserMaterialOuter);

		if (this.laserGroup) {
			this.laserGroup.scale.set(1, 1, this.maxDistance);
			this.laserGroup.add(this.innerLaser, this.outerLaser);
			this.laserGroup.visible = false;
			this.sphere.add(this.laserGroup);
		}

		if (this.type === 'start') this.timer = new Timer(200000, 'laserTimer', this.desactivate);

		this.initialized = true;
	}

	activate() {
		this.isActivated = true;

		if (this.type === 'start') {
			signal.emit('sound:play-loop', 'laser');
			this.timer.start();
			this.game.pet.toggleFeeding(this.sphereWorldPos);
		} else if (this.type === 'end') this.game.endEvent();

		if (this.laserGroup) this.laserGroup.visible = true;

		if (this.nextTower && !this.nextTower.isActivated) this.nextTower.activateBy(this);
	}

	desactivate = () => {
		this.isActivated = false;

		if (this.type === 'end') this.game.revertEndEvent();
		else if (this.type === 'start') {
			signal.emit('sound:stop', 'laser');
			this.timer.stop();
			this.game.pet.toggleFeeding();
		}

		if (this.laserGroup) {
			this.laserGroup.visible = false;
			this.laserGroup.scale.z = this.maxDistance;
		}

		if (this.nextTower && this.nextTower.isActivated) {
			this.nextTower.desactivateBy(this);
			this.nextTower = null;
		}
	};

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

		if (
			(key === controlsKeys.rotate[0] || key === controlsKeys.rotate[1]) &&
			this.type !== 'end'
		) {
			this.needsUpdate = true;
			this.rotate(key === controlsKeys.rotate[0]);
		} else if (key === controlsKeys.interact && this.type === 'start') {
			this.needsUpdate = true;

			if (this.isActivated) this.desactivate();
			else this.activate();
		}
	}

	rotate(reversed) {
		this.needsUpdate = true;

		if (this.animation && !this.animation.paused) this.animation.pause();

		const radOffset = reversed ? Math.PI * 0.05 : -Math.PI * 0.05;
		let yOffset = this.sphereGroup.rotation.y + radOffset;

		this.animation = anime({
			targets: this.sphereGroup.rotation,
			y: yOffset,
			duration: 300,
			easing: 'easeOutQuad',
		});
	}

	tilt = (e) => {
		if (
			!this.isInBroadphaseRange ||
			!this.base.isInteractable ||
			!this.initialized ||
			!this.isActivated
		)
			return;

		this.tiltYTarget -= e.y * params.tiltYOffset;
		this.tiltYTarget = clamp(this.tiltYTarget, -Math.PI * 0.25, Math.PI * 0.25);
	};

	update = (et, dt) => {
		if (!this.initialized) return;

		this.animate(et, dt);

		if (!this.needsUpdate) return;

		this.tiltY = lerp(this.tiltY, this.tiltYTarget, 0.1);
		this.sphere.rotation.x = this.tiltY;
		this.sphere.rotation.z = this.tiltY;

		this.sphere.updateMatrix();
		this.sphere.getWorldDirection(this.ray.direction);

		if (this.laserGroup && this.laserGroup.scale.z !== this.maxDistance)
			this.laserGroup.scale.z = this.maxDistance;

		this.game.laserTowers.forEach((nextLaserTower) => {
			// Don't test with the start, the same tower and if distance from current is above max
			const distanceFromCurrent = nextLaserTower.sphereWorldPos.distanceTo(
				this.sphereWorldPos,
			);
			if (
				nextLaserTower.towerType === 'start' ||
				nextLaserTower === this ||
				distanceFromCurrent >= this.maxDistance
			)
				return;

			const rayNextDistance = this.ray.distanceToPoint(nextLaserTower.sphereWorldPos);

			// If the current tower is activated, activate the next one, if not, desactivate it
			if (rayNextDistance <= 0.2 && !nextLaserTower.isActivated && this.isActivated) {
				if (this.animation && !this.animation.paused) this.animation.pause();
				if (this.laserGroup) this.laserGroup.scale.z = distanceFromCurrent + 2;
				nextLaserTower.activateBy(this);
				this.needsUpdate = false;
			} else if (nextLaserTower.isActivated && rayNextDistance > 0.1) {
				nextLaserTower.desactivateBy(this);
			}
		});
	};

	animate = (et, dt) => {
		if (this.isActivated || this.ringRotationOffset >= 0.00001) {
			this.ringRotationOffset = lerp(
				this.ringRotationOffset,
				this.isActivated ? params.ringRotationOffset.max : params.ringRotationOffset.min,
				0.07,
			);
			this.rings.forEach((ring, i) => {
				ring.rotation.x += this.ringRotationOffset * (i + 1);
				ring.rotation.z += this.ringRotationOffset * (i + 1);
			});
		}
	};
}
