/// #if DEBUG
const debug = {
	instance: null,
	scene: null,
	cameraController: null,
};
/// #endif

import { getWebgl } from '@webgl/Webgl';
import { CameraHelper, Path, Vector3 } from 'three';
import PersCamera from './PersCamera';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { clamp, dampPrecise } from 'philbin-packages/maths';
import { wait } from 'philbin-packages/async';
import { getGame } from '@game/Game';
import { getPlayer } from '@webgl/World/Characters/Player';

let dummyPos = new Vector3();
let dummyTarget = new Vector3();
let nextDummyTarget = new Vector3();
let dummyFov = 0;
let dummySpeed = 0;

let currentFocus = '';
let prevFocus = '';
let index = 0;

let hasSkipped = false;
let isComplete = false;

const isBetween = (value, min, max, inclusive = false) =>
	inclusive ? value >= min && value <= max : value > min && value < max;

export default class Cinematrix extends PersCamera {
	static targetsList = {
		player: new Vector3(),
		objectif: new Vector3(),
		center: new Vector3(),
	};

	constructor() {
		super('cinematrix');

		const webgl = getWebgl();
		const game = getGame();
		this.keyPressed = game.control.keyPressed;

		this.isActive = false;
		this.isPlaying = false;
		this.onPause = false;

		this.targets = null;

		this.speed = 0;
		this.delay = 0;

		signal.on('cinematrix:switch', (curve) => {
			this.switch(curve);
		});

		signal.on('cinematrix:play', () => this.play());
		signal.on('cinematrix:stop', () => this.stop());

		signal.on('cameraSwitch', (label) => {
			if (label === this.label) this.enter();
		});

		/// #if DEBUG
		debug.instance = webgl.debug;
		debug.scene = webgl.mainScene.instance;
		debug.cameraController = webgl.cameraController;
		this.devtool();
		/// #endif
	}

	init() {
		super.init();
	}

	/// #if DEBUG
	devtool() {
		this.camHelper = new CameraHelper(this.instance);
		this.camHelper.visible = false;
		debug.scene.add(this.camHelper);

		this.gui = debug.instance
			.getFolder('CameraController')
			.addFolder({ title: this.label ? this.label : 'null', expanded: false });

		this.gui.addInput(this.camHelper, 'visible', {
			label: 'Show Helper',
		});

		this.gui
			.addButton({
				title: 'play',
			})
			.on('click', () => {
				this.play();
			});

		this.gui
			.addButton({
				title: 'stop',
			})
			.on('click', () => {
				this.stop();
			});

		this.gui
			.addButton({
				title: 'pause',
			})
			.on('click', () => {
				this.pause();
			});

		this.gui
			.addButton({
				title: 'reset',
			})
			.on('click', () => {
				this.reset();
			});
	}
	/// #endif

	switch(curve) {
		if (!curve) return;

		console.log('cinematrix switch', curve);

		const { name, instance, params } = curve;

		const _points = instance.getPoints(500);
		this.path = _points;
		this.length = _points.length;

		this.setSpeed(params.speed);
		this.initTargets(params.targets);
		this.setDelay(1000);
		this.reset();

		return this;
	}

	play() {
		if (this.isPlaying && !this.onPause) return;

		this.isPlaying = true;
		this.onPause = false;

		console.log('cinematrix play');
	}

	stop() {
		if (!this.isPlaying) return;

		this.isPlaying = false;

		console.log('cinematrix stop');
	}

	pause() {
		this.onPause = true;

		console.log('cinematrix pause');
	}

	reset() {
		if (!this.length) {
			console.log('no path');
			return;
		}

		index = 0;
		this.setPosition({ ...this.path[index] });

		Cinematrix.targetsList['player'].copy(getPlayer().base.mesh.position);

		const _target = Cinematrix.targetsList[this.targets[0].focus];
		nextDummyTarget.set(..._target);
		dummyTarget.copy(nextDummyTarget);

		this.instance.lookAt(dummyTarget);

		dummyFov = this.instance.fov;

		this.isPlaying = false;
		this.onPause = false;

		this.enter();

		console.log('cinematrix reset');
	}

	quit() {
		this.isActive = false;

		signal.emit('cinematrix:quit');

		console.log('cinematrix quit');
	}

	enter() {
		this.isActive = true;
		console.log('cinematrix enter');

		return this;
	}

	initTargets(targets) {
		if (!targets) {
			console.log('no targets, set to 0 per default');
			this.setTarget('center');

			return this;
		}

		const _targets = [];
		targets.split(',').map((t) => {
			const _t = t.split('-');
			const _focus = _t[0].trim();
			const _part = _t[1] * 1;
			const _speed = _t[2] ? _t[2] * 1 : 1;
			// multiply by 1 to parse string number into a real number

			const _target = {};
			_target['focus'] = _focus;
			_target['part'] = _part;
			_target['speed'] = _speed;

			_targets.push(_target);
		});

		console.log(_targets);
		this.targets = _targets;
	}

	setPosition({ x, y, z }) {
		this.instance.position.set(x, y, z);

		return this;
	}

	setRotation({ x, y, z }) {
		this.instance.rotation.set(x, y, z);

		return this;
	}

	setTarget(target) {
		const _target = Cinematrix.targetsList[target];
		nextDummyTarget.set(..._target);

		console.log(target, _target);

		return this;
	}

	setFov(fov) {
		dummyFov = fov;

		return this;
	}

	setSpeed(speed) {
		if (!speed) {
			console.log('no speed');
			return this;
		}

		dummySpeed = speed;

		console.log('speed:', speed);

		return this;
	}

	setDelay(delay) {
		this.delay = delay;

		return this;
	}

	async onComplete() {
		if (isComplete) return;

		isComplete = true;
		console.log('cinematrix complete');

		await wait(this.delay);
		signal.emit('postpro:fadeout');
		// await fadeOut()
		this.isPlaying = false;
		// TODO: postpro fadeout

		this.quit();
	}

	skip() {
		if (hasSkipped) return;

		console.log('cinematrix skipped');
		hasSkipped = true;

		this.onComplete();
	}

	updateTarget(length, index, dt) {
		let realPart = 0;
		let prevPart = 0;
		this.targets.forEach((target, i, array) => {
			prevPart = i === 0 ? 0 : realPart;
			realPart += target.part;

			const min = length * prevPart;
			const max = length * realPart;

			let inRange = isBetween(index, min, max);
			if (!inRange) return;
			// console.log(index, min, max, target.focus);

			prevFocus = currentFocus;
			currentFocus = target.focus;
			if (currentFocus !== prevFocus) {
				this.setTarget(target.focus);
				if (dummySpeed !== target.speed) this.setSpeed(target.speed);
			}
		});

		dummyTarget.x = dampPrecise(dummyTarget.x, nextDummyTarget.x, 0.01, dt, 0.001);
		dummyTarget.y = dampPrecise(dummyTarget.y, nextDummyTarget.y, 0.01, dt, 0.001);
		dummyTarget.z = dampPrecise(dummyTarget.z, nextDummyTarget.z, 0.01, dt, 0.001);
	}

	update(et, dt) {
		if (!this.isActive && !this.initialized) return;

		// TODO: add normals to the cam OR look at (one or more)

		if (this.isPlaying) {
			if (!this.path) return;

			if (this.keyPressed.escape) this.skip();
			if (index === this.length - 1 && this.instance.position.equals(dummyPos))
				this.onComplete();

			if (!this.onPause) {
				const _points = this.path;
				const _len = this.length;

				this.speed = dampPrecise(this.speed, dummySpeed, 0.05, dt, 0.01);

				index += 0.1 * dt * this.speed;
				index = clamp(index, 0, _len - 1);
				const _index = Math.trunc(index);

				const _point = _points[_index];

				dummyPos.set(_point.x, _point.y, _point.z);

				this.updateTarget(_len, _index, dt);
			}

			this.instance.position.x = dampPrecise(
				this.instance.position.x,
				dummyPos.x,
				0.1,
				dt,
				0.01,
			);
			this.instance.position.y = dampPrecise(
				this.instance.position.y,
				dummyPos.y,
				0.1,
				dt,
				0.01,
			);
			this.instance.position.z = dampPrecise(
				this.instance.position.z,
				dummyPos.z,
				0.1,
				dt,
				0.01,
			);

			this.instance.lookAt(dummyTarget);
		}

		if (dummyFov !== this.instance.fov) {
			this.instance.fov = dampPrecise(this.instance.fov, dummyFov, 0.1, dt, 0.001);
			this.instance.updateProjectionMatrix();
		}

		/// #if DEBUG
		this.camHelper.update();
		/// #endif

		super.update();
	}
}
