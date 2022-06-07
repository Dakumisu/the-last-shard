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
	constructor(label = 'cinematrix_null') {
		super(label);

		this.label = label;

		const webgl = getWebgl();
		const game = getGame();
		this.keyPressed = game.control.keyPressed;

		this.isActive = false;
		this.isPlaying = false;
		this.onPause = false;
		this.useNormals = false;

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

		console.log('cinematrix switch', this.curve);

		const { name, instance, params } = this.curve;

		const _points = instance.getPoints(800);
		this.path = _points;
		this.length = _points.length;

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

		const _target = this.targetsList[0];
		nextDummyTarget.set(..._target.pos);
		dummyTarget.copy(nextDummyTarget);

		this.instance.lookAt(dummyTarget);

		dummyFov = this.instance.fov;

		this.isPlaying = false;
		this.onPause = false;

		this.enter();

		console.log('cinematrix reset');
	}

	enter() {
		this.isActive = true;
		console.log('cinematrix enter');

		return this;
	}

	exit() {
		this.isActive = false;

		signal.emit('cinematrix:exit', this.label);

		console.log('cinematrix exit');
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
			console.log('Need targets');
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
		signal.emit('postpro:transition');
		// await fadeOut()
		this.isPlaying = false;
		// TODO: postpro fadeout

		this.exit();
	}

	skip() {
		if (hasSkipped) return;

		console.log('cinematrix skipped');
		hasSkipped = true;

		this.onComplete();
	}

	updateTarget(i) {
		const _target = this.targetsList[i];
		nextDummyTarget.set(..._target.pos);

		console.log(_target);

		return this;
	}

	getTangent(a, b, dt) {
		dummyTangent.subVectors(a, b).normalize();

		dummyTarget.copy(tmpPos.copy(this.instance.position).sub(dummyTangent));
		this.instance.lookAt(dummyTarget);
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

				this.speed = dampPrecise(this.speed, dummySpeed, 0.04, dt, 0.01);

				index += 0.1 * dt * this.speed;
				index = clamp(index, 0, _len - 1);
				const _index = Math.trunc(index);

				const _point = _points[_index];

				dummyPos.set(_point.x, _point.y, _point.z);

				if (!this.useNormals) {
					this.updatePath(_len, _index, dt);
				} else {
					if (_points[_index + 1]) this.getTangent(_point, _points[_index + 1], dt);
				}
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
