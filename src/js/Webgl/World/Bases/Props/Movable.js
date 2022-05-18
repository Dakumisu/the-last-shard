import BaseObject from '../BaseObject';
import anime from 'animejs';
import { Group, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import BasePhysic from '../BasePhysic';

export default class Movable extends BasePhysic {
	/**
	 * @param {{name?: string, isInteractable: boolean, isRawMesh: boolean, asset?: Object, group?: Group}} param0
	 */
	constructor({
		name = '',
		isInteractable = false,
		isRawMesh = false,
		asset = null,
		group = null,
	}) {
		super({ name, isInteractable, isMovable: true, isRawMesh, asset, group });

		this.currentAnim = null;
		this.triggerId = this.base.asset.params.gameId;

		signal.on(name + ':endGame', (gameId, targetId = 0, opts = {}) => {
			console.log('🎮 Test :', gameId, targetId, opts);
			if (gameId !== this.triggerId) return;
			this.getTargetAnim(targetId, opts).play();
		});

		signal.on(name + ':endGameReverse', (gameId, targetId = 0, opts = {}) => {
			if (gameId !== this.triggerId) return;
			this.getReverseAnim(targetId, opts).play();
		});

		this.targets = this.base.asset.anim;
	}

	async init() {
		await super.init();
		this.initPhysics();

		this.firstPos = this.base.mesh.position.clone();
	}

	getTargetAnim(id, opts = {}) {
		// if (this.currentAnim) await this.currentAnim.finished;

		const target = this.targets[id];

		const duration = opts.duration || 1000;
		const easing = opts.easing || 'spring(1, 100, 10, 0)';
		const delay = opts.delay || 0;

		return anime({
			targets: this.base.mesh.position,
			duration,
			easing,
			delay,
			autoplay: false,
			...opts,
			...new Vector3().fromArray(target.pos),
			update: () => {
				this.base.mesh.updateMatrix();
			},
		});
	}

	getReverseAnim(id, opts = {}) {
		const target = this.targets[id];

		const duration = opts.duration || 1000;
		const easing = opts.easing || 'spring(1, 100, 10, 0)';
		const delay = opts.delay || 0;

		return anime({
			targets: this.base.mesh.position,
			duration,
			easing,
			delay,
			autoplay: false,
			...opts,
			...this.firstPos,
			update: () => {
				this.base.mesh.updateMatrix();
			},
		});
	}
}
