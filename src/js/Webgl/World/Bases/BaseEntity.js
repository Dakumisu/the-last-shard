import anime from 'animejs';

import BasePhysic from './BasePhysic';
import CollidersBroadphase from './Broadphase/CollidersBroadphase';

export default class BaseEntity extends BasePhysic {
	constructor({ name = '', isInteractable = false } = {}) {
		super({ name, isInteractable });

		this.broadphase = new CollidersBroadphase({ radius: 10 });

		this.params = {
			gravity: -30,
		};
	}

	async hide() {
		return new Promise((resolve) => {
			anime({
				targets: this.base.group.scale,
				easing: 'spring(1, 190, 10, 1)',
				duration: 500,
				x: ['', 0.001],
				y: ['', 0.001],
				z: ['', 0.001],
				complete: () => {
					resolve();
				},
			});
		});
	}

	async show(scale = 1) {
		return new Promise((resolve) => {
			anime({
				targets: this.base.group.scale,
				easing: 'spring(1, 190, 10, 1)',
				duration: 1000,
				x: [0.001, scale],
				y: [0.001, scale],
				z: [0.001, scale],
				complete: () => {
					resolve();
				},
			});
		});
	}
}
