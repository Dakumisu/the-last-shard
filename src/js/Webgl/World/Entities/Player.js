import {
	Box3,
	BoxHelper,
	Color,
	GridHelper,
	Line3,
	Matrix4,
	Mesh,
	BoxGeometry,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshNormalMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	Vector2,
	Vector3,
	Group,
	AxesHelper,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { getGame } from '@game/Game';
import { getWebgl } from '@webgl/Webgl';

import BaseEntity from '../Components/BaseEntity';

import { store } from '@tools/Store';
import { mergeGeometry } from '@utils/webgl';
import { damp, dampPrecise } from 'philbin-packages/maths';

import debugMaterial from '../materials/debug/material';
import defaultMaterial from '../materials/default/material';
import OrbitCamera from '@webgl/CameraController/Cameras/OrbitCamera';
import fogMaterial from '../materials/fog/material';

const PI = Math.PI;
const PI2 = PI * 2;
const tVec3a = new Vector3();
const tVec3b = new Vector3();
const tBox = new Box3();
const tMat = new Matrix4();
const tSegment = new Line3();
const playerVelocity = new Vector3();

let initialized = false;

const params = {
	speed: 10,
	sprint: 25,

	physicsSteps: 5,
	upVector: new Vector3().set(0, 1, 0),
	defaultPos: [0, 3, 30],
};

/// #if DEBUG
const teleportPoints = [
	params.defaultPos,
	[-6.5303, 11, -27.421],
	[15, 2, -60],
	[104.32, 14, -65.342],
];
/// #endif

const state = {
	playerOnGround: true,

	forwardPressed: false,
	backwardPressed: false,
	leftPressed: false,
	rightPressed: false,

	updateDirection: false,

	playerisMounting: false,
	playerisDowning: false,

	slowDown: false,
};
let sd = state.slowDown;

const dynamic = {
	currentAngle: 0,

	speed: 0,
	inertie: 0,
};

let camAngle = 0;
let directionTarget = 0;
let nextDirection = 0;
let currentDirection = 0;

let inertieTarget = 0;
let speedTarget = 0;

let previousPlayerPos = 0;
let playerPos = 0;

// function rLerp(start, end, t) {
// 	let cs = Math.cos(start) * (1 - t) + Math.cos(end) * t;
// 	let sn = Math.sin(start) * (1 - t) + Math.sin(end) * t;
// 	return Math.atan2(sn, cs);
// }

// function rDamp(start, end, smoothing, dt) {
// 	return rLerp(start, end, 1 - Math.exp(-smoothing * 0.05 * dt));
// }

function rLerp(start, end, t) {
	const delta = ((end - start + PI2 + PI) % PI2) - PI;
	return (start + delta * t + PI2) % PI2;
}

function rLerpPrecise(start, end, t, limit) {
	const delta = ((end - start + PI2 + PI) % PI2) - PI;
	const r = (start + delta * t + PI2) % PI2;
	return Math.abs(end - r) < limit ? end : r;
}

function rDamp(start, end, smoothing, dt) {
	return rLerp(start, end, 1 - Math.exp(-smoothing * 0.05 * dt));
}

function rDampPrecise(start, end, smoothing, dt, limit) {
	return rLerpPrecise(start, end, 1 - Math.exp(-smoothing * 0.05 * dt), limit);
}

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Player',
};
/// #endif

export default class Player extends BaseEntity {
	constructor(opt = {}) {
		super();

		const webgl = getWebgl();
		const game = getGame();
		this.keyPressed = game.control.keyPressed;

		this.scene = webgl.scene.instance;
		this.cameraController = webgl.cameraController;

		this.ground = opt.ground; // TODO -> replace 'this.ground' by all the colliders (map, props, etc...)

		this.base = {};
		this.base.group = new Group();

		this.raycaster = webgl.raycaster;

		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.debug();
		this.helpers();
		/// #endif
	}

	/// #if DEBUG
	debug() {
		debug.instance.setFolder(debug.label);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(this.params, 'gravity', {
			min: -50,
			max: 50,
		});
		gui.addInput(params, 'speed', {
			min: 0,
			max: 30,
		});
		gui.addInput(params, 'physicsSteps', {
			min: 1,
			max: 30,
			step: 1,
		});

		const guiPosition = gui.addFolder({
			title: 'Position',
		});

		guiPosition.addMonitor(state, 'playerOnGround', { label: 'on ground', type: 'graph' });
		guiPosition.addMonitor(state, 'playerisMounting', { label: 'mounting', type: 'graph' });
		guiPosition.addMonitor(state, 'playerisDowning', { label: 'downing', type: 'graph' });

		guiPosition.addSeparator();

		guiPosition.addMonitor(dynamic, 'speed', { label: 'speed', type: 'graph' });

		guiPosition.addSeparator();

		guiPosition
			.addButton({
				title: 'copy player pos',
			})
			.on('click', () => {
				const stuffToCopy = `[
				${this.base.mesh.position.x.toPrecision(5)},
				${this.base.mesh.position.y.toPrecision(5)},
				${this.base.mesh.position.z.toPrecision(5)}
			]`;
				if (navigator.clipboard) {
					navigator.clipboard.writeText(stuffToCopy).then(
						() => {
							console.log('player pos copied ✅');
						},
						() => {
							console.log('copy failed ❌');
						},
					);
				} else {
					console.warn('Server need to be in https to access to this command');
				}
			});

		guiPosition.addSeparator();

		const guiTeleport = guiPosition.addFolder({
			title: 'Teleport',
		});

		const dummy = {
			a: -1,
		};
		guiTeleport
			.addInput(dummy, 'a', {
				view: 'radiogrid',
				groupName: 'positions',
				size: [4, 1],
				cells: (x, y) => ({
					title: `${x + y}`,
					value: teleportPoints[x + y],
				}),

				label: 'points',
			})
			.on('change', (pos) => {
				this.base.mesh.position.fromArray(pos.value);
			});
	}

	helpers() {
		this.scene.add(this.base.group);

		const v = this.setVisualizer(this.base.mesh, 15);
		this.scene.add(v);

		const axesHelper = new AxesHelper(2);
		this.base.group.add(axesHelper);
	}
	/// #endif

	async init() {
		this.setCameraPlayer();
		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		initialized = true;
	}

	setCameraPlayer() {
		// Create OrbitCam for the player and add it to controller
		const playerOrbitCam = new OrbitCamera(
			{
				spherical: {
					radius: 5,
					phi: 1,
					theta: PI2 * 1000,
				},

				minDistance: 1,
				maxDistance: 30,
				/// #if !DEBUG
				enableZoom: false,
				/// #endif

				enablePan: false,
				rotateSpeed: 0.2,

				minPolarAngle: PI * 0.25,
				maxPolarAngle: PI * 0.5,
			},
			'playerCam',
		);
		this.cameraController.add('playerCam', playerOrbitCam, true);
		this.camera = this.cameraController.get('playerCam').camObject;
	}

	setGeometry() {
		this.base.geometry = new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5);

		this.base.geometry.translate(0, -0.5, 0);

		this.base.capsuleInfo = {
			radius: 0.5,
			segment: new Line3(new Vector3(0, 0, 0), new Vector3(0, -1, 0)),
		};

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);
	}

	setMaterial() {
		const matOpts = {
			color: new Color('#ff0000'),
		};

		this.base.material = defaultMaterial.get(matOpts);
		// this.base.material = fogMaterial.get();
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);

		this.base.mesh.position.fromArray(params.defaultPos);
		this.base.group.add(this.base.mesh);
		this.scene.add(this.base.mesh);
	}

	move(dt) {
		// check if the direction change
		state.updateDirection = false;
		if (state.forwardPressed != this.keyPressed.forward) state.updateDirection = true;
		if (state.backwardPressed != this.keyPressed.backward) state.updateDirection = true;
		if (state.leftPressed != this.keyPressed.left) state.updateDirection = true;
		if (state.rightPressed != this.keyPressed.right) state.updateDirection = true;

		state.forwardPressed = this.keyPressed.forward;
		state.backwardPressed = this.keyPressed.backward;
		state.leftPressed = this.keyPressed.left;
		state.rightPressed = this.keyPressed.right;

		const delta = dt * 0.001;

		playerVelocity.y += state.playerOnGround ? 0 : delta * this.params.gravity;
		this.base.mesh.position.addScaledVector(playerVelocity, delta);

		dynamic.currentAngle = this.base.mesh.rotation.y;
		camAngle = this.camera.orbit.spherical.theta;

		if (state.updateDirection) {
			if (this.keyPressed.forward) nextDirection = 0; // ⬆️
			if (this.keyPressed.backward) nextDirection = PI - 0; // ⬇️
			if (this.keyPressed.left) nextDirection = PI * 0.5 + 0; // ⬅️
			if (this.keyPressed.right) nextDirection = PI * 1.5 - 0; // ➡️
			// if (this.keyPressed.forward) nextDirection = 0.001; // ⬆️
			// if (this.keyPressed.backward) nextDirection = PI - 0.001; // ⬇️
			// if (this.keyPressed.left) nextDirection = PI * 0.5 + 0.001; // ⬅️
			// if (this.keyPressed.right) nextDirection = PI * 1.5 - 0.001; // ➡️

			if (this.keyPressed.forward && this.keyPressed.left) nextDirection = PI * 0.25; // ↖️
			if (this.keyPressed.forward && this.keyPressed.right) nextDirection = PI * 1.75; // ↗️
			if (this.keyPressed.backward && this.keyPressed.left) nextDirection = PI * 0.75; // ↙️
			if (this.keyPressed.backward && this.keyPressed.right) nextDirection = PI * 1.25; // ↘️

			state.slowDown =
				Math.abs(currentDirection - nextDirection) >= PI - 0.004 &&
				Math.abs(currentDirection - nextDirection) <= PI + 0.004;

			currentDirection = nextDirection;
		}

		inertieTarget = this.keyPressed.shift ? params.sprint : params.speed;

		if (
			this.keyPressed.forward ||
			this.keyPressed.backward ||
			this.keyPressed.left ||
			this.keyPressed.right
		) {
			if (!sd && state.slowDown) {
				speedTarget = -1.5;
			} else speedTarget = dampPrecise(speedTarget, inertieTarget, 0.05, dt, 0.1);
			directionTarget = camAngle + currentDirection;
		} else speedTarget = 0;

		sd = state.slowDown;

		tVec3a.set(0, 0, -1).applyAxisAngle(params.upVector, dynamic.currentAngle);
		this.base.mesh.position.addScaledVector(tVec3a, dynamic.speed * delta);

		if (this.keyPressed.space) {
			if (state.playerOnGround) playerVelocity.y = 15.0;
		}

		this.base.mesh.updateMatrixWorld();

		// adjust player position based on collisions
		const capsuleInfo = this.base.capsuleInfo;
		tBox.makeEmpty();
		tMat.copy(this.ground.matrixWorld).invert();
		tSegment.copy(capsuleInfo.segment);

		// get the position of the capsule in the local space of the collider
		tSegment.start.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat);
		tSegment.end.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat);

		// get the axis aligned bounding box of the capsule
		tBox.expandByPoint(tSegment.start);
		tBox.expandByPoint(tSegment.end);

		tBox.min.addScalar(-capsuleInfo.radius);
		tBox.max.addScalar(capsuleInfo.radius);

		this.ground.geometry.boundsTree.shapecast({
			intersectsBounds: (box) => box.intersectsBox(tBox),

			intersectsTriangle: (tri) => {
				// check if the triangle is intersecting the capsule and adjust the capsule position if it is.
				const triPoint = tVec3a;
				const capsulePoint = tVec3b;

				const distance = tri.closestPointToSegment(tSegment, triPoint, capsulePoint);
				if (distance < capsuleInfo.radius) {
					const depth = capsuleInfo.radius - distance;
					const direction = capsulePoint.sub(triPoint).normalize();

					tSegment.start.addScaledVector(direction, depth);
					tSegment.end.addScaledVector(direction, depth);
				}
			},
		});

		// get the adjusted position of the capsule collider in world space after checking
		// triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
		// the origin of the player model.
		const newPosition = tVec3a;
		newPosition.copy(tSegment.start).applyMatrix4(this.ground.matrixWorld);

		// check how much the collider was moved
		const deltaVector = tVec3b;
		deltaVector.subVectors(newPosition, this.base.mesh.position);

		// if the player was primarily adjusted vertically we assume it's on something we should consider ground
		state.playerOnGround = deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

		// const offset = Math.max(0, deltaVector.length() - 1e-5);
		// deltaVector.normalize().multiplyScalar(offset);

		// adjust the player model
		this.base.mesh.position.add(deltaVector);

		if (!state.playerOnGround) {
			deltaVector.normalize();
			playerVelocity.addScaledVector(deltaVector, -deltaVector.dot(playerVelocity));
		} else {
			playerVelocity.set(0, 0, 0);
		}

		// adjust the camera
		this.camera.camera.position.sub(this.camera.orbit.target);
		this.camera.orbit.targetOffset.copy(this.base.mesh.position);
		this.camera.camera.position.add(this.base.mesh.position);

		// if the player has fallen too far below the level reset their position to the start
		if (this.base.mesh.position.y < -25) {
			this.reset();
		}
	}

	checkPlayerHeightPosition() {
		previousPlayerPos = playerPos;
		playerPos = this.base.mesh.position.y;

		state.playerisMounting = playerPos - previousPlayerPos <= 0 ? false : true;
		state.playerisDowning = playerPos - previousPlayerPos >= 0 ? false : true;
	}

	reset() {
		playerVelocity.set(0, 0, 0);
		this.base.mesh.position.fromArray(params.defaultPos);
		this.camera.camera.position.sub(this.camera.orbit.targetOffset);
		this.camera.orbit.targetOffset.copy(this.base.mesh.position);
		this.camera.camera.position.add(this.base.mesh.position);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		for (let i = 0; i < params.physicsSteps; i++) this.move(dt / params.physicsSteps, et);

		this.base.mesh.rotation.y = rDampPrecise(
			this.base.mesh.rotation.y,
			directionTarget,
			0.11,
			dt,
			0.01,
		);

		dynamic.speed = dampPrecise(dynamic.speed, speedTarget, 0.1, dt, 0.1);

		this.base.group.position.copy(this.base.mesh.position);
		this.base.group.quaternion.copy(this.base.mesh.quaternion);

		this.checkPlayerHeightPosition();
	}
}
