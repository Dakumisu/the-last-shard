import { Vector3 } from 'three';
import { wait } from 'philbin-packages/async';
import signal from 'philbin-packages/signal';

import Cinematrix from '@webgl/Camera/Cameras/Cinematrix';
import { getPlayer } from '@webgl/World/Characters/Player';
import { store } from '@tools/Store';

const params = {
	speed: 0.5,
	delay: 500,
};

export class Level {
	constructor(scene, datas = {}) {
		this.datas = datas;
		this.scene = scene;

		this.label = `${this.scene.label.toLowerCase()}_${this.datas.name}`;
		this.controller = new Cinematrix(this.label);

		this.isComplete = false;

		this.listeners();
		this.setup();
	}

	async setup() {
		this.initTargets();

		await this.controller.setupPath(this.datas.curve);

		this.controller.setTargets(this.targets);
		this.controller.setSpeed(params.speed);
		this.controller.setDelay(params.delay);

		this.controller.reset();
	}

	initTargets() {
		const targets = [];

		targets.push({
			focus: 'player',
			pos: getPlayer().base.mesh.position,
			ratio: 0.25,
			speed: 0.5,
		});

		targets.push({
			focus: 'door',
			pos: this.scene.focusList.door,
			ratio: 0.5,
			speed: 1,
		});

		targets.push({
			focus: 'fragment',
			pos: this.scene.focusList.fragment,
			ratio: 0.25,
			speed: 0.75,
		});

		this.targets = targets;

		return targets;
	}

	async play(label) {
		console.log(label, this.label);
		if (label !== this.label) return;
		if (this.isComplete) return;

		signal.emit('postpro:transition-in', 500);
		await wait(500);

		signal.emit('camera:switch', this.label);

		signal.emit('postpro:transition-out');

		await wait(params.delay);
		this.controller.play();

		return this;
	}

	async exit(label) {
		if (label !== this.label) return;

		this.isComplete = true;
		signal.emit('camera:switch', 'player');

		signal.emit('postpro:transition-out');

		return this;
	}

	listeners() {
		signal.on('area:enter', this.play.bind(this));
		signal.on('cinematrix:exit', this.exit.bind(this));
	}
}
