import BaseObject from '../BaseObject';
import anime from 'animejs';
import { Group, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import BasePhysic from '../BasePhysic';
import { easings, getEase } from 'philbin-packages/easing';

export default class LevelDoor extends BasePhysic {
	/**
	 * @param {{name?: string, isInteractable: boolean, isRawMesh: boolean, asset?: Object, group?: Group}} param0
	 */
	constructor(
		scene,
		{ name = 'level_door', isInteractable = false, asset = null, group = null },
	) {
		super({ name, isInteractable, isMovable: true, isRawMesh: false, asset, group });

		this.scene = scene;

		this.gameId = this.base.asset.params.gameId;
		this.target = {};

		this.ease = getEase(easings.outSwift);
		console.log(this.ease);

		this.listeners();
	}

	async init() {
		await super.init();
		this.initPhysics();

		this.defaultPos = this.base.mesh.position.clone();
		this.target.pos = this.defaultPos.add(new Vector3(0, -3, 0));
	}

	listeners() {
		signal.on(this.scene.label + ':endGame', (gameId, opts = {}) => {
			console.log('🎮 Test :', gameId, opts);
			if (gameId !== this.gameId) return;
			this.trigger(opts).play();
		});

		signal.on(this.scene.label + ':endGameReverse', (gameId, opts = {}) => {
			if (gameId !== this.gameId) return;
			this.reverse(opts).play();
		});
	}

	trigger(opts = {}) {
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
			...this.target.pos,
			update: () => {
				this.base.mesh.updateMatrix();
			},
		});
	}

	reverse(opts = {}) {
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
			...this.defaultPos,
			update: () => {
				this.base.mesh.updateMatrix();
			},
		});
	}
}
