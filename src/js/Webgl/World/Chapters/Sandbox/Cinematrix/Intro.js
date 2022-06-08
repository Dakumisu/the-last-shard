import { Vector3 } from 'three';
import { wait } from 'philbin-packages/async';
import signal from 'philbin-packages/signal';

import Cinematrix from '@webgl/Camera/Cameras/Cinematrix';
import { getPlayer } from '@webgl/World/Characters/Player';

const params = {
	speed: 1,
	delay: 500,
};

export class Intro {
	constructor(datas) {
		this.datas = datas;

		this.label = `sandbox_${this.datas.name}`;
		this.controller = new Cinematrix(this.label);

		this.isComplete = true;

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
			ratio: 0.5,
			speed: 0.5,
		});

		targets.push({
			focus: 'center',
			pos: new Vector3(),
			ratio: 0.5,
			speed: 1,
		});

		this.targets = targets;

		return targets;
	}

	async play(label) {
		if (label !== this.label) return;
		if (this.isComplete) return;

		signal.emit('postpro:transition');

		await wait(params.delay);
		signal.emit('camera:switch', this.label);
		await wait(params.delay);
		this.controller.play();

		return this;
	}

	async exit(label) {
		if (label !== this.label) return;

		this.isComplete = true;
		signal.emit('camera:switch', 'player');

		return this;
	}

	listeners() {
		signal.on('area:enter', this.play.bind(this));
		signal.on('cinematrix:exit', this.exit.bind(this));
	}
}
