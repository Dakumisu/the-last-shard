import {
	Box3,
	Color,
	Line3,
	Matrix4,
	Mesh,
	BoxGeometry,
	Vector3,
	Group,
	AxesHelper,
	CapsuleGeometry,
	Vector2,
	BufferGeometry,
	IcosahedronGeometry,
	Object3D,
	MeshBasicMaterial,
	CircleGeometry,
} from 'three';
import { MeshBVH } from 'three-mesh-bvh';

import { getGame } from '@game/Game';
import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';
import { loadDynamicGLTF as loadGLTF } from '@utils/loaders';
import { mergeGeometry } from '@utils/webgl';
import { dampPrecise, rDampPrecise } from 'philbin-packages/maths';

import OrbitCamera from '@webgl/Camera/Cameras/OrbitCamera';
import { PlayerMaterial } from '@webgl/Materials/Player/material';
import AnimationController from '@webgl/Animation/Controller';
import DebugMaterial from '@webgl/Materials/debug/material';
import BaseEntity from '../Bases/BaseEntity';
import { wait } from 'philbin-packages/misc';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';

const model = '/assets/model/player.glb';

const PI = Math.PI;
const PI2 = PI * 2;
const tVec3a = new Vector3();
const tVec3b = new Vector3();
const tVec2a = new Vector2();
const tVec2b = new Vector2();
const tBox3a = new Box3();
const tBox3b = new Box3();
const tMat4a = new Matrix4();
const tMat4b = new Matrix4();
const tLine3 = new Line3();
const playerVelocity = new Vector3();

const params = {
	speed: 4,
	sprint: 14,

	physicsSteps: 5,
	upVector: new Vector3().set(0, 1, 0),
	defaultPos: [0, 3, 30],

	broadphaseRadius: 5,
};

const camParams = {
	radius: 5,
	phi: 1,
	theta: 0,
};

const state = {
	playerOnGround: true,

	forwardPressed: false,
	backwardPressed: false,
	leftPressed: false,
	rightPressed: false,

	hasJumped: false,
	isJumping: false,

	isMounting: false,
	isDowning: false,

	slowDown: false,
};
let tmpSlowDown = state.slowDown;

const player = {
	realSpeed: 0,
	isMoving: false,

	anim: null,
};

let playerDirection = 0;
let camDirection = 0;
let lastXAxis = null;
let lastZAxis = null;

let turnCounter = 0;
let directionTarget = 0;
let nextDirection = 0;
let currentDirection = 0;

let inertie = 0;
let inertieTarget = 0;
let speed = 0;
let speedTarget = 0;

let previousPlayerPos = 0;
let playerPosY = 0;

let camInertie = 0;

/// #if DEBUG
// TODO -> replace teleport points by checkpoint
const teleportPoints = [
	params.defaultPos,
	[-6.5303, 11, -27.421],
	[15, 2, -60],
	[104.32, 14, -65.342],
];

const debug = {
	instance: null,
	label: 'Player',
	tab: 'Player',
};
/// #endif

let initialized = false;

class Player extends BaseEntity {
	static instance;

	constructor(opt = {}) {
		super();

		Player.instance = this;

		const webgl = getWebgl();
		const game = getGame();
		this.keyPressed = game.control.keyPressed;

		this.scene = webgl.mainScene.instance;
		this.cameraController = webgl.cameraController;

		this.colliders = [];
		this.collidersToTest = [];

		this.base = {};
		this.base.group = new Group();

		this.raycaster = webgl.raycaster;

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif

		this.beforeInit();
	}

	/// #if DEBUG
	#debug() {
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(this.params, 'gravity', {
			min: -50,
			max: 50,
		});
		gui.addInput(params, 'speed', {
			min: 0,
			max: 30,
		});
		gui.addInput(params, 'sprint', {
			min: params.speed,
			max: 40,
		});
		gui.addInput(params, 'physicsSteps', {
			min: 1,
			max: 30,
			step: 1,
		});

		gui.addButton({ title: 'bvh' }).on('click', () => {
			this.visualizer.visible = !this.visualizer.visible;
		});
		gui.addButton({ title: 'broadphase' }).on('click', () => {
			this.broadphaseHelper.visible = !this.broadphaseHelper.visible;
		});

		const guiPosition = gui.addFolder({
			title: 'Position',
		});

		guiPosition.addMonitor(state, 'playerOnGround', { label: 'on ground', type: 'graph' });
		guiPosition.addMonitor(state, 'isMounting', { label: 'mounting', type: 'graph' });
		guiPosition.addMonitor(state, 'isDowning', { label: 'downing', type: 'graph' });

		guiPosition.addSeparator();

		guiPosition.addMonitor(player, 'realSpeed', { label: 'speed', type: 'graph' });

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
							console.log('player position copied ✅');
						},
						() => {
							console.log('copy failed ❌');
						},
					);
				} else {
					console.warn("Dev server need to be in 'https' to access this command");
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

	#helpers() {
		this.visualizer = this.setVisualizer(this.base.mesh, 15);
		this.visualizer.visible = false;
		this.scene.add(this.visualizer);

		const axesHelper = new AxesHelper(2);
		axesHelper.visible = false;
		this.base.group.add(axesHelper);

		this.broadphaseHelper = new Mesh(
			new CircleGeometry(params.broadphaseRadius, 10).rotateX(Math.PI * 0.5),
			new MeshBasicMaterial({ wireframe: true }),
		);
		this.broadphaseHelper.visible = false;
		this.base.group.add(this.broadphaseHelper);
	}
	/// #endif

	async beforeInit() {
		/// #if DEBUG
		this.#debug();
		/// #endif

		await this.#init();

		/// #if DEBUG
		this.#helpers();
		/// #endif
	}

	async #init() {
		this.#setCameraPlayer();
		this.#setGeometry();
		this.#setMaterial();
		this.#setMesh();

		await this.#setModel();
		this.#setAnimation();

		initialized = true;
	}

	async #setModel() {
		const m = await loadGLTF(model);

		m.scene.traverse((object) => {
			if (object.type === 'SkinnedMesh') {
				object.material = this.base.material;
			}
		});

		this.base.model = m;
		this.base.model.scene.rotateY(PI);
		this.base.model.scene.translateOnAxis(params.upVector, -1.5);

		const playerMaterial = new PlayerMaterial({
			color: new Color('#d29ddc'),
		});
		this.base.model.scene.traverse((child) => {
			child.material = playerMaterial;
		});

		this.base.group.add(this.base.model.scene);
	}

	#setAnimation() {
		this.base.animation = new AnimationController({ model: this.base.model, name: 'player' });
	}

	#setCameraPlayer() {
		// Create OrbitCam for the player and add it to controller
		const playerOrbitCam = new OrbitCamera(
			{
				spherical: {
					radius: camParams.radius,
					phi: camParams.phi,
					theta: camParams.theta,
				},

				minDistance: 1,
				maxDistance: 30,
				/// #if !DEBUG
				enableZoom: false,
				/// #endif

				enablePan: false,
				rotateSpeed: 0.2,

				minPolarAngle: PI * 0.25,
				maxPolarAngle: PI * 0.55,
			},
			'player',
		);
		this.cameraController.add(playerOrbitCam, true);
		this.base.camera = this.cameraController.get('player').camObject;
	}

	#setGeometry() {
		this.base.geometry = new CapsuleGeometry(0.25, 1.5, 10, 10);
		this.base.geometry.translate(0, -0.5, 0);

		this.base.capsuleInfo = {
			radius: 0.5,
			segment: new Line3(new Vector3(), new Vector3(0, -1, 0)),
		};

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);
	}

	#setMaterial() {
		this.base.material = new DebugMaterial();

		this.base.material = new PlayerMaterial({
			color: new Color('#d29ddc'),
		});
	}

	#setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.base.mesh.visible = false;

		this.base.mesh.position.fromArray(params.defaultPos);

		this.scene.add(this.base.mesh);
		this.base.mesh.position.y = 10;
		this.scene.add(this.base.group);
	}

	#move(dt, collider) {
		state.forwardPressed = this.keyPressed.forward;
		state.backwardPressed = this.keyPressed.backward;
		state.leftPressed = this.keyPressed.left;
		state.rightPressed = this.keyPressed.right;

		if (state.leftPressed && !state.rightPressed) lastXAxis = 'left';
		if (!state.leftPressed && state.rightPressed) lastXAxis = 'right';
		if (!state.leftPressed && !state.rightPressed) lastXAxis = '';

		if (state.forwardPressed && !state.backwardPressed) lastZAxis = 'forward';
		if (!state.forwardPressed && state.backwardPressed) lastZAxis = 'backward';
		if (!state.forwardPressed && !state.backwardPressed) lastZAxis = '';

		const delta = dt * 0.001;

		playerVelocity.y += state.playerOnGround ? 0 : delta * this.params.gravity;
		this.base.mesh.position.addScaledVector(playerVelocity, delta);

		playerDirection = this.base.mesh.rotation.y;
		camDirection = this.base.camera.orbit.spherical.theta;

		if (this.keyPressed.forward) nextDirection = 0; // ⬆️
		if (this.keyPressed.backward) nextDirection = PI; // ⬇️
		if (this.keyPressed.forward && lastZAxis === 'backward') nextDirection = 0; // ⬆️

		if (this.keyPressed.left) nextDirection = PI * 0.5; // ⬅️
		if (this.keyPressed.right) nextDirection = PI * 1.5; // ➡️
		if (this.keyPressed.left && lastXAxis === 'right') nextDirection = PI * 0.5; // ⬅️

		if (this.keyPressed.forward && this.keyPressed.left) nextDirection = PI * 0.25; // ↖️
		if (this.keyPressed.forward && this.keyPressed.right) nextDirection = PI * 1.75; // ↗️
		if (this.keyPressed.forward && this.keyPressed.left && lastXAxis === 'right')
			nextDirection = PI * 0.25; // ↖️

		if (this.keyPressed.backward && this.keyPressed.left) nextDirection = PI * 0.75; // ↙️
		if (this.keyPressed.backward && this.keyPressed.right) nextDirection = PI * 1.25; // ↘️
		if (this.keyPressed.backward && this.keyPressed.left && lastXAxis === 'right')
			nextDirection = PI * 0.75; // ↙️

		state.slowDown =
			Math.abs(currentDirection - nextDirection) >= PI - 0.003 &&
			Math.abs(currentDirection - nextDirection) <= PI + 0.003;

		currentDirection = nextDirection;

		inertieTarget = this.keyPressed.shift ? params.sprint : params.speed;

		if (
			this.keyPressed.forward ||
			this.keyPressed.backward ||
			this.keyPressed.left ||
			this.keyPressed.right
		) {
			if (!tmpSlowDown && state.slowDown) {
				speedTarget = -1.5;
			} else speedTarget = dampPrecise(speedTarget, inertieTarget, 0.05, dt, 0.1);
		} else speedTarget = 0;

		tmpSlowDown = state.slowDown;

		// Rotate only if the player is moving
		if (player.isMoving) {
			turnCounter = Math.abs(Math.trunc(camDirection / PI2));
			if (camDirection <= -PI2 * turnCounter) camDirection += PI2 * turnCounter;
			directionTarget = currentDirection + camDirection;

			this.base.mesh.rotation.y = rDampPrecise(
				this.base.mesh.rotation.y,
				directionTarget,
				0.11,
				dt,
				0.01,
			);
		}
		tVec3a.set(0, 0, -1).applyAxisAngle(params.upVector, playerDirection);
		this.base.mesh.position.addScaledVector(tVec3a, speed * delta);

		// if (this.keyPressed.space && state.playerOnGround && !state.isJumping) this.jump();

		this.base.mesh.updateMatrixWorld();

		// adjust player position based on collisions
		const capsuleInfo = this.base.capsuleInfo;
		tBox3a.makeEmpty();
		tMat4a.copy(collider.matrixWorld).invert();
		tLine3.copy(capsuleInfo.segment);

		// get the position of the capsule in the local space of the collider
		tLine3.start.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat4a);
		tLine3.end.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat4a);

		// get the axis aligned bounding box of the capsule
		tBox3a.expandByPoint(tLine3.start);
		tBox3a.expandByPoint(tLine3.end);

		tBox3a.min.addScalar(-capsuleInfo.radius);
		tBox3a.max.addScalar(capsuleInfo.radius);

		collider.boundsTree.shapecast({
			intersectsBounds: (box) => box.intersectsBox(tBox3a),

			intersectsTriangle: (tri) => {
				// check if the triangle is intersecting the capsule and adjust the capsule position if it is.
				const triPoint = tVec3a;
				const capsulePoint = tVec3b;

				const distance = tri.closestPointToSegment(tLine3, triPoint, capsulePoint);
				if (distance < capsuleInfo.radius) {
					// console.log(distance);
					const depth = capsuleInfo.radius - distance;
					const direction = capsulePoint.sub(triPoint).normalize();

					tLine3.start.addScaledVector(direction, depth);
					tLine3.end.addScaledVector(direction, depth);
				}
			},
		});

		// get the adjusted position of the capsule collider in world space after checking
		// triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
		// the origin of the player model.
		const newPosition = tVec3a;
		newPosition.copy(tLine3.start).applyMatrix4(collider.matrixWorld);

		// check how much the collider was moved
		const deltaVector = tVec3b;
		deltaVector.subVectors(newPosition, this.base.mesh.position);

		// if the player was primarily adjusted vertically we assume it's on something we should consider ground
		if (collider.colliderType === 'walkable')
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
		this.base.camera.orbit.targetOffset.copy(this.base.mesh.position);

		// if the player has fallen too far below the level reset their position to the start
		if (this.base.mesh.position.y < -25) {
			this.reset();
		}
	}

	async #jump(delay = false) {
		if (state.isJumping) return;
		state.isJumping = true;
		if (delay) await wait(400);
		playerVelocity.y = 15.0;
		state.isJumping = false;
	}

	#checkPlayerPosition(dt) {
		previousPlayerPos = playerPosY;
		playerPosY = this.base.mesh.position.y;

		state.isMounting = playerPosY - previousPlayerPos <= 0 ? false : true;
		state.isDowning = playerPosY - previousPlayerPos >= 0 ? false : true;

		// get real speed based on the player's delta position
		tVec2a.copy({ x: this.base.mesh.position.x, y: this.base.mesh.position.z });
		const d = tVec2b.distanceTo(tVec2a);
		player.realSpeed = (d / dt) * 1000;
		player.isMoving = player.realSpeed > 0.001;
		tVec2b.copy(tVec2a);
	}

	#updateCamInertie(dt) {
		camInertie = dampPrecise(camInertie, player.realSpeed * 0.2, 0.25, dt, 0.001);
		this.base.camera.orbit.spherical.setRadius(camParams.radius + camInertie);
	}

	#updateAnimation() {
		let previousPlayerAnim = player.anim;
		if (state.playerOnGround && !state.isJumping) {
			if (player.isMoving && player.realSpeed >= params.speed * 0.1) {
				// if (player.realSpeed <= params.speed + 2)
				// 	player.anim = this.base.animation.get('walk');

				// if (player.realSpeed > params.speed + 1.5) {
				// 	player.anim = this.base.animation.get('run');
				// }
				if (this.keyPressed.shift) player.anim = this.base.animation.get('run');
				else player.anim = this.base.animation.get('walk');
			} else player.anim = this.base.animation.get('idle');
		}
		if (this.keyPressed.space && state.playerOnGround && !state.isJumping) {
			if (player.isMoving && player.realSpeed >= params.speed * 0.1) {
				player.anim = this.base.animation.get('run_jump');
				this.#jump();
			} else {
				player.anim = this.base.animation.get('jump');
				this.#jump(true);
			}
			this.base.animation.playOnce(player.anim);
		}
		// console.log(player.anim.name);
		if (previousPlayerAnim != player.anim) this.base.animation.switch(player.anim);
	}

	#updateBroadphase() {
		this.collidersToTest.forEach((object) => {
			tBox3b.makeEmpty();
			tBox3b.copy(object.geometry.boundingBox);
			tMat4b.copy(object.matrixWorld);
			tBox3b.applyMatrix4(tMat4b);

			const d = tBox3b.distanceToPoint(this.base.mesh.position);

			if (d <= params.broadphaseRadius) this.#addCollider(object);
			else this.#removeCollider(object);
		});
	}
	#addCollider(collider) {
		if (!this.colliders.includes(collider.geometry)) this.colliders.push(collider.geometry);
	}
	#removeCollider(collider) {
		if (this.colliders.indexOf(collider.geometry) === -1) return;

		const id = this.colliders.indexOf(collider.geometry);
		this.colliders.splice(id, 1);
	}

	reset() {
		speed = 0;
		playerVelocity.set(0, 0, 0);
		this.base.mesh.position.fromArray(params.defaultPos);
		this.base.camera.orbit.targetOffset.copy(this.base.mesh.position);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		if (this.colliders.length)
			this.colliders.forEach((collider) => {
				for (let i = 0; i < params.physicsSteps; i++)
					this.#move(dt / params.physicsSteps / this.colliders.length, collider);
			});

		speed = dampPrecise(speed, speedTarget, 0.1, dt, 0.1);

		this.base.group.position.copy(this.base.mesh.position);
		this.base.group.quaternion.copy(this.base.mesh.quaternion);

		this.#checkPlayerPosition(dt);
		this.#updateCamInertie(dt);
		this.#updateAnimation();

		this.base.animation.update(dt);

		this.#updateBroadphase();

		// if (state.hasJumped != this.keyPressed.space) state.hasJumped = this.keyPressed.space;
	}

	setMainCollider(geo) {
		if (!(geo instanceof BufferGeometry)) {
			console.error(`BufferGeometry required ❌`);
			return;
		}
		this.colliders = [];
		this.colliders.push(geo);
	}

	setPropsColliders(array) {
		this.collidersToTest = array;
	}

	setStartPosition(pos) {
		this.base.mesh.position.copy(pos);
	}
}

const initPlayer = () => {
	return new Player();
};

const getPlayer = () => {
	return Player.instance;
};

export { initPlayer, getPlayer };
