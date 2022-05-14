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

		signal.on(name + ':endGame', async (gameId, targetId = 0, opt = {}) => {
			console.log('🎮 Test :', gameId, targetId, opt);
			if (gameId !== this.triggerId) return;
			await this.targetTo(targetId, opt);
			this.play();
		});

		this.targets = this.base.asset.anim;
	}

	async init() {
		await super.init();
		this.initPhysics();
	}

	async targetTo(id, opts = {}) {
		// if (this.currentAnim) await this.currentAnim.finished;

		const target = this.targets[id];

		const duration = opts.duration || 1000;
		const easing = opts.easing || 'spring(1, 100, 10, 0)';
		const delay = opts.delay || 0;

		const animeOpts = {
			targets: this.base.mesh.position,
			duration,
			easing,
			delay,
			autoplay: false,
			...opts,
			...new Vector3().fromArray(target.pos),
			begin: () => {
				this.base.mesh.matrixAutoUpdate = true;
			},
			complete: () => {
				this.base.mesh.matrixAutoUpdate = false;
				this.base.mesh.updateMatrix();
			},
		};

		this.currentAnim = anime(animeOpts);

		return this;
	}

	play() {
		if (this.currentAnim) this.currentAnim.play();
	}

	stop() {
		if (this.currentAnim) this.currentAnim.pause();
	}

	restart() {
		if (this.currentAnim) this.currentAnim.restart();
	}

	reverse() {
		if (this.currentAnim) this.currentAnim.reverse();
	}
}
