import BaseObject from '../BaseObject';
import anime from 'animejs';
import { Group, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import BasePhysic from '../BasePhysic';
import { easings, getEase } from 'philbin-packages/easing';

export default class LevelDoor extends BasePhysic {
	/**
	 * @param {{scene: BaseScene, name?: string, isInteractable: boolean, isRawMesh: boolean, asset?: Object, group?: Group}} param0
	 */
	constructor(
		scene,
		{ name = 'level_door', isInteractable = false, asset = null, group = null },
	) {
		super({ name, isInteractable, isMovable: true, isRawMesh: false, asset, group });

		this.scene = scene;

		this.gameId = this.base.asset.params.gameId;
		this.target = {};
		this.anime = null;

		this.listeners();
	}

	async init() {
		await super.init();
		this.initPhysics();

		this.defaultPos = this.base.mesh.position.clone();
		this.target.pos = new Vector3().copy(this.defaultPos).add(new Vector3(0, -4.75, 0));
	}

	listeners() {
		signal.on(this.scene.label + ':endGame', (gameId) => {
			if (gameId !== this.gameId) return;
			this.trigger().play();
		});

		signal.on(this.scene.label + ':endGameReverse', (gameId) => {
			if (gameId !== this.gameId) return;
			this.reverse().play();
		});
	}

	trigger() {
		const duration = 2000;
		const easing = 'linear';
		const delay = 0;

		this.anime = anime({
			targets: this.base.mesh.position,
			duration,
			easing,
			delay,
			autoplay: false,
			...this.target.pos,
			update: () => {
				this.base.mesh.updateMatrix();
			},
		});

		return this.anime;
	}

	reverse() {
		const duration = 1500;
		const easing = 'linear';
		const delay = 0;

		this.anime = anime({
			targets: this.base.mesh.position,
			duration,
			easing,
			delay,
			autoplay: false,
			...this.defaultPos,
			update: () => {
				this.base.mesh.updateMatrix();
			},
		});

		return this.anime;
	}
}
