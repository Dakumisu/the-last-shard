/// #if DEBUG
const debug = {
	instance: null,
	scene: null,
	cameraController: null,
};
/// #endif

import { getWebgl } from '@webgl/Webgl';
import { BufferGeometry, CameraHelper, Mesh, Path, Vector3 } from 'three';
import PersCamera from './PersCamera';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { clamp, dampPrecise, isBetween } from 'philbin-packages/maths';
import { wait } from 'philbin-packages/async';
import { getGame } from '@game/Game';
import { getPlayer } from '@webgl/World/Characters/Player';

const dummyTangent = new Vector3();
const tmpPos = new Vector3();
const dummyPos = new Vector3();
const dummyTarget = new Vector3();
const nextDummyTarget = new Vector3();
let dummyFov = 0;
let dummySpeed = 0;

let currentFocus = '';
let prevFocus = '';
let index = 0;

let hasSkipped = false;
let isComplete = false;

export default class Cinematrix extends PersCamera {
	constructor(label = 'cinematrix_null', { useNormals = false } = {}) {
		super(label);

		this.label = label;

		const webgl = getWebgl();
		const game = getGame();
		this.keyPressed = game.control.keyPressed;
		this.soundController = webgl.world.soundController;

		this.isActive = false;
		this.isPlaying = false;
		this.onPause = false;
		this.useNormals = useNormals;

		this.targetsList = {};

		this.speed = 0;
		this.delay = 0;

		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		debug.scene = webgl.mainScene.instance;
		debug.cameraController = webgl.cameraController;
		this.devtool();
		/// #endif
	}

	/// #if DEBUG
	async devtool() {
		await this.initialized;

		super.devtools(debug);

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

	init() {
		super.init();
	}

	async setupPath(curve) {
		if (!curve) {
			console.error('Need datas');
			return;
		}

		this.curve = curve;

		console.log('Cinematrix switch');

		const { name, instance, params } = this.curve;

		const _points = instance.getPoints(750);
		this.path = _points;
		this.length = _points.length;

		return this;
	}

	play() {
		if (this.isPlaying && !this.onPause) return;

		this.isPlaying = true;
		this.onPause = false;

		signal.emit('sound:play', 'cinematrix-1');
		this.soundController.fadeOutAmbient(this.soundController.currentAmbient);

		// console.log('Cinematrix play');
	}

	stop() {
		if (!this.isPlaying) return;

		this.isPlaying = false;

		console.log('Cinematrix stop');
	}

	pause() {
		this.onPause = true;

		signal.emit('sound:stop', 'cinematrix-1');
		this.soundController.fadeInAmbient(this.soundController.currentAmbient);

		// console.log('Cinematrix pause');
	}

	reset() {
		if (!this.length) {
			console.error('no path');
			return;
		}

		index = 0;
		this.setPosition({ ...this.path[index] });

		if (!this.useNormals) {
			const _target = this.targetsList[0];
			nextDummyTarget.set(..._target.pos);
			dummyTarget.copy(nextDummyTarget);

			this.instance.lookAt(dummyTarget);
		}

		dummyFov = this.instance.fov;

		this.isPlaying = false;
		this.onPause = false;

		this.enter();

		// console.log('Cinematrix reset');
	}

	enter() {
		this.isActive = true;
		// console.log('Cinematrix enter');

		return this;
	}

	exit() {
		this.isActive = false;
		signal.emit('sound:stop', 'cinematrix-1');
		this.soundController.fadeInAmbient(this.soundController.currentAmbient);

		signal.emit('cinematrix:exit', this.label);

		console.log('Cinematrix exit');
	}

	setPosition({ x, y, z }) {
		this.instance.position.set(x, y, z);

		return this;
	}

	setRotation({ x, y, z }) {
		this.instance.rotation.set(x, y, z);

		return this;
	}

	async setTargets(targets) {
		if (!targets) {
			console.error('Need targets');
			return this;
		}

		this.targetsList = targets;

		return this;
	}

	setFov(fov) {
		dummyFov = fov;

		return this;
	}

	setSpeed(speed) {
		if (!speed) {
			console.error('no speed');
			return this;
		}

		dummySpeed = speed;

		return this;
	}

	setDelay(delay) {
		this.delay = delay;

		return this;
	}

	async onComplete() {
		if (isComplete) return;

		isComplete = true;
		console.log('Cinematrix complete');

		await wait(this.delay);

		signal.emit('postpro:transition-in', 500);
		await wait(500);

		this.isPlaying = false;

		this.exit();
	}

	skip() {
		if (hasSkipped) return;

		console.log('Cinematrix skipped');
		hasSkipped = true;

		this.onComplete();
	}

	updateTarget(i) {
		const _target = this.targetsList[i];
		nextDummyTarget.set(..._target.pos);

		return this;
	}

	getTangent(a, b) {
		dummyTangent.subVectors(a, b).normalize();

		nextDummyTarget.copy(tmpPos.copy(this.instance.position).sub(dummyTangent));
	}

	updatePath(length, index, dt) {
		let realPart = 0;
		let prevPart = 0;

		this.targetsList.forEach((target, i) => {
			prevPart = i === 0 ? 0 : realPart;
			realPart += target.ratio;

			const min = length * prevPart;
			const max = length * realPart;

			let inRange = isBetween(index, min, max);
			if (!inRange) return;

			prevFocus = currentFocus;
			currentFocus = target.focus;
			if (currentFocus !== prevFocus) {
				this.updateTarget(i);
				if (dummySpeed !== target.speed) this.setSpeed(target.speed);
			}
		});
	}

	dampPosition(dt) {
		this.instance.position.x = dampPrecise(this.instance.position.x, dummyPos.x, 0.1, dt, 0.01);
		this.instance.position.y = dampPrecise(this.instance.position.y, dummyPos.y, 0.1, dt, 0.01);
		this.instance.position.z = dampPrecise(this.instance.position.z, dummyPos.z, 0.1, dt, 0.01);
	}

	dampTarget(dt) {
		dummyTarget.x = dampPrecise(
			dummyTarget.x,
			nextDummyTarget.x,
			// this.useNormals ? 0.05 : 0.01,
			0.01,
			dt,
			0.001,
		);
		dummyTarget.y = dampPrecise(
			dummyTarget.y,
			nextDummyTarget.y,
			// this.useNormals ? 0.05 : 0.01,
			0.01,
			dt,
			0.001,
		);
		dummyTarget.z = dampPrecise(
			dummyTarget.z,
			nextDummyTarget.z,
			// this.useNormals ? 0.05 : 0.01,
			0.01,
			dt,
			0.001,
		);

		this.instance.lookAt(dummyTarget);
	}

	update(et, dt) {
		if (!this.isActive && !this.initialized) return;

		if (this.isPlaying) {
			if (!this.path) return;

			if (this.keyPressed.escape) this.skip();
			if (index === this.length - 1 && this.instance.position.equals(dummyPos))
				this.onComplete();

			if (!this.onPause) {
				const _points = this.path;
				const _len = this.length;

				this.speed = dampPrecise(this.speed, dummySpeed, 0.04, dt, 0.01);

				index += 0.1 * dt * this.speed;
				index = clamp(index, 0, _len - 1);
				const _index = Math.trunc(index);

				const _point = _points[_index];

				dummyPos.set(_point.x, _point.y, _point.z);

				if (this.useNormals) {
					if (_points[_index + 10]) this.getTangent(_point, _points[_index + 10]);
				} else {
					this.updatePath(_len, _index, dt);
				}
			}

			this.dampPosition(dt);
			this.dampTarget(dt);
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
