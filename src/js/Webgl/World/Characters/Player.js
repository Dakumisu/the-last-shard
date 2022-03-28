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
const tBox = new Box3();
const tMat = new Matrix4();
const tSegment = new Line3();
const playerVelocity = new Vector3();

const params = {
	speed: 6,
	sprint: 14,

	physicsSteps: 5,
	upVector: new Vector3().set(0, 1, 0),
	defaultPos: [0, 3, 30],
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

	updateDirection: false,

	playerisMounting: false,
	playerisDowning: false,

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

		// this.ground = opt.ground; // TODO -> replace 'this.collider' by all the colliders (map, props, etc...)
		this.collider = null;

		this.base = {};
		this.base.group = new Group();

		this.raycaster = webgl.raycaster;

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif

		this.beforeInit();
	}

	/// #if DEBUG
	debug() {
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

		const guiPosition = gui.addFolder({
			title: 'Position',
		});

		guiPosition.addMonitor(state, 'playerOnGround', { label: 'on ground', type: 'graph' });
		guiPosition.addMonitor(state, 'playerisMounting', { label: 'mounting', type: 'graph' });
		guiPosition.addMonitor(state, 'playerisDowning', { label: 'downing', type: 'graph' });

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

	helpers() {
		this.visualizer = this.setVisualizer(this.base.mesh, 15);
		this.visualizer.visible = false;
		this.scene.add(this.visualizer);

		const axesHelper = new AxesHelper(2);
		axesHelper.visible = false;
		this.base.group.add(axesHelper);
	}
	/// #endif

	async beforeInit() {
		/// #if DEBUG
		this.debug();
		/// #endif

		await this.init();

		/// #if DEBUG
		this.helpers();
		/// #endif
	}

	async init() {
		await this.setModel();
		this.setAnimation();

		this.setCameraPlayer();
		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		initialized = true;
	}

	async setModel() {
		const m = await loadGLTF(model);
		// console.log(m);

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

	setAnimation() {
		this.base.animation = new AnimationController({ model: this.base.model, name: 'player' });
	}

	setCameraPlayer() {
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

	setGeometry() {
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

	setMaterial() {
		this.base.material = new DebugMaterial();
		// this.base.material = new BaseToonMaterial({
		// 	color: new Color('#d29ddc'),
		// });
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.base.mesh.visible = false;

		this.base.mesh.position.fromArray(params.defaultPos);

		this.scene.add(this.base.mesh);
		this.base.mesh.position.y = 10;
		this.scene.add(this.base.group);
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

		playerDirection = this.base.mesh.rotation.y;
		camDirection = this.base.camera.orbit.spherical.theta;

		if (state.updateDirection) {
			if (this.keyPressed.forward) nextDirection = 0; // ⬆️
			if (this.keyPressed.backward) nextDirection = PI; // ⬇️
			if (this.keyPressed.left) nextDirection = PI * 0.5; // ⬅️
			if (this.keyPressed.right) nextDirection = PI * 1.5; // ➡️

			if (this.keyPressed.forward && this.keyPressed.left) nextDirection = PI * 0.25; // ↖️
			if (this.keyPressed.forward && this.keyPressed.right) nextDirection = PI * 1.75; // ↗️
			if (this.keyPressed.backward && this.keyPressed.left) nextDirection = PI * 0.75; // ↙️
			if (this.keyPressed.backward && this.keyPressed.right) nextDirection = PI * 1.25; // ↘️

			state.slowDown =
				Math.abs(currentDirection - nextDirection) >= PI - 0.003 &&
				Math.abs(currentDirection - nextDirection) <= PI + 0.003;

			currentDirection = nextDirection;
		}

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
		tBox.makeEmpty();
		tMat.copy(this.collider.matrixWorld).invert();
		tSegment.copy(capsuleInfo.segment);

		// get the position of the capsule in the local space of the collider
		tSegment.start.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat);
		tSegment.end.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat);

		// get the axis aligned bounding box of the capsule
		tBox.expandByPoint(tSegment.start);
		tBox.expandByPoint(tSegment.end);

		tBox.min.addScalar(-capsuleInfo.radius);
		tBox.max.addScalar(capsuleInfo.radius);

		this.collider.boundsTree.shapecast({
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
		newPosition.copy(tSegment.start).applyMatrix4(this.collider.matrixWorld);

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
		this.base.camera.camera.position.sub(this.base.camera.orbit.target);
		this.base.camera.orbit.targetOffset.copy(this.base.mesh.position);
		this.base.camera.camera.position.add(this.base.mesh.position);

		// if the player has fallen too far below the level reset their position to the start
		if (this.base.mesh.position.y < -25) {
			this.reset();
		}
	}

	async jump(delay = false) {
		if (state.isJumping) return;
		state.isJumping = true;
		if (delay) await wait(400);
		playerVelocity.y = 15.0;
		state.isJumping = false;
	}

	checkPlayerPosition(dt) {
		previousPlayerPos = playerPosY;
		playerPosY = this.base.mesh.position.y;

		state.playerisMounting = playerPosY - previousPlayerPos <= 0 ? false : true;
		state.playerisDowning = playerPosY - previousPlayerPos >= 0 ? false : true;

		// get real speed based on the player's delta position
		tVec2a.copy({ x: this.base.mesh.position.x, y: this.base.mesh.position.z });
		const d = tVec2b.distanceTo(tVec2a);
		player.realSpeed = (d / dt) * 1000;
		player.isMoving = player.realSpeed > 0.001;
		tVec2b.copy(tVec2a);
	}

	updateCamInertie(dt) {
		camInertie = dampPrecise(camInertie, player.realSpeed * 0.2, 0.25, dt, 0.001);
		this.base.camera.orbit.spherical.setRadius(camParams.radius + camInertie);
	}

	updateAnimation() {
		let previousPlayerAnim = player.anim;
		if (state.playerOnGround && !state.isJumping) {
			if (player.isMoving && player.realSpeed >= params.speed * 0.2) {
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
			if (player.isMoving && player.realSpeed >= params.speed * 0.2) {
				player.anim = this.base.animation.get('run_jump');
				this.jump();
			} else {
				player.anim = this.base.animation.get('jump');
				this.jump(true);
			}
			this.base.animation.playOnce(player.anim);
		}
		// console.log(player.anim.name);
		if (previousPlayerAnim != player.anim) this.base.animation.switch(player.anim);
	}

	reset() {
		speed = 0;
		playerVelocity.set(0, 0, 0);
		this.base.mesh.position.fromArray(params.defaultPos);
		this.base.camera.camera.position.sub(this.base.camera.orbit.targetOffset);
		this.base.camera.orbit.targetOffset.copy(this.base.mesh.position);
		this.base.camera.camera.position.add(this.base.mesh.position);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		if (this.collider)
			for (let i = 0; i < params.physicsSteps; i++) this.move(dt / params.physicsSteps, et);

		speed = dampPrecise(speed, speedTarget, 0.1, dt, 0.1);

		this.base.group.position.copy(this.base.mesh.position);
		this.base.group.quaternion.copy(this.base.mesh.quaternion);

		this.checkPlayerPosition(dt);
		this.updateCamInertie(dt);
		this.updateAnimation();

		this.base.animation.update(dt);

		// if (state.hasJumped != this.keyPressed.space) state.hasJumped = this.keyPressed.space;
	}

	setCollider(geo) {
		if (!(geo instanceof BufferGeometry)) {
			console.error(`BufferGeometry required ❌`);
			return;
		}
		this.collider = geo;
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
