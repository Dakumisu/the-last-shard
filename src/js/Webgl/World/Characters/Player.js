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
	MeshBasicMaterial,
	CircleGeometry,
	LineBasicMaterial,
	Line,
	Box3Helper,
	MeshNormalMaterial,
	sRGBEncoding,
	Euler,
} from 'three';
import { MeshBVH } from 'three-mesh-bvh';

import { getGame } from '@game/Game';
import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';
import { loadDynamicGLTF as loadGLTF, loadTexture } from '@utils/loaders';
import { clamp, dampPrecise, rDampPrecise } from 'philbin-packages/maths';

import OrbitCamera from '@webgl/Camera/Cameras/OrbitCamera';
import PlayerMaterial from '@webgl/Materials/Player/PlayerMaterial';
import AnimationController from '@webgl/Animation/Controller';
import BaseEntity from '../Bases/BaseEntity';
import { wait } from 'philbin-packages/async';
import signal from 'philbin-packages/signal';

const model = '/assets/model/player.glb';

const PI = Math.PI;
const PI2 = PI * 2;

const tVec3a = new Vector3();
const tVec3b = new Vector3();
const tVec3c = new Vector3();
const tVec3d = new Vector3();
const tVec3e = new Vector3();
const playerVelocity = new Vector3();

const tVec2a = new Vector2();
const tVec2b = new Vector2();

const tBox3a = new Box3();
const tBox3b = new Box3();
const tBox3c = new Box3();

const tMat4a = new Matrix4();
const tMat4b = new Matrix4();

const tLine3 = new Line3();

const params = {
	speed: 3.25,
	sprint: 6.9,

	physicsSteps: 5,
	upVector: new Vector3().set(0, 1, 0),

	broadphaseRadius: 10,
};

const camParams = {
	radius: 3,
	phi: 1,
	theta: 0,
};

const player = {
	realSpeed: 0,
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
let camAxisTarget = 0;

/// #if DEBUG
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

		this.base.group = new Group();

		this.raycaster = webgl.raycaster;

		this.state = {
			isOnGround: true,
			isOnGrass: false,

			forwardPressed: false,
			backwardPressed: false,
			leftPressed: false,
			rightPressed: false,

			hasJumped: false,
			isJumping: false,

			isMounting: false,
			isFalling: false,

			isMoving: false,
			isBlocked: false,

			slowDown: false,

			isDead: false,
		};
		this.tmpSlowDown = this.state.slowDown;

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif

		this.beforeInit();
	}

	/// #if DEBUG
	devtool() {
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

		gui.addButton({ title: 'broadphase' }).on('click', () => {
			this.broadphaseHelper.visible = !this.broadphaseHelper.visible;
		});

		const guiPosition = gui.addFolder({
			title: 'Position',
		});

		guiPosition.addMonitor(this.state, 'hasJumped', { label: 'has jumped', type: 'graph' });
		guiPosition.addMonitor(this.state, 'isOnGround', { label: 'on ground', type: 'graph' });
		guiPosition.addMonitor(this.state, 'isMounting', { label: 'mounting', type: 'graph' });
		guiPosition.addMonitor(this.state, 'isFalling', { label: 'falling', type: 'graph' });

		guiPosition.addSeparator();

		guiPosition.addMonitor(player, 'realSpeed', { label: 'speed', type: 'graph' });

		guiPosition.addSeparator();

		guiPosition
			.addButton({
				title: 'copy player pos',
			})
			.on('click', () => {
				const { x, y, z } = this.getPosition();
				const stuffToCopy = `[
				${x.toPrecision(5)},
				${y.toPrecision(5)},
				${z.toPrecision(5)}
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

		guiPosition
			.addButton({
				title: 'respawn',
			})
			.on('click', () => {
				this.reset();
			});
	}

	helpers() {
		this.initPhysicsVisualizer(15);
		this.scene.add(this.physicsVisualizer);

		const gui = debug.instance.getFolder(debug.label);
		gui.addInput(this.physicsVisualizer, 'visible', { label: 'BVH' });

		const axesHelper = new AxesHelper(2);
		axesHelper.visible = false;
		this.base.group.add(axesHelper);

		this.broadphaseHelper = new Mesh(
			new CircleGeometry(params.broadphaseRadius, 10).rotateX(Math.PI * 0.5),
			new MeshBasicMaterial({ wireframe: true }),
		);
		this.broadphaseHelper.visible = false;
		this.base.group.add(this.broadphaseHelper);

		const material = new LineBasicMaterial({
			color: '#ffffff',
		});

		const points = [];
		points.push(new Vector3(0, tLine3.start.y, 0));
		points.push(new Vector3(0, tLine3.end.y, 0));
		const geometry = new BufferGeometry().setFromPoints(points);

		this.capsuleHelper = new Line(geometry, material);
		this.base.group.add(this.capsuleHelper);
	}
	/// #endif

	async beforeInit() {
		/// #if DEBUG
		this.devtool();
		/// #endif

		await this.init();

		/// #if DEBUG
		this.helpers();
		/// #endif
	}

	async init() {
		this.setCameraPlayer();
		this.setBodyMesh();

		this.initPhysics({
			lazyGeneration: false,
		});

		await this.setModel();
		this.setAnimation();
		this.listeners();

		initialized = true;
	}

	listeners() {}

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
				enableZoom: false,

				enablePan: false,
				rotateSpeed: 0.2,

				minPolarAngle: PI * 0.2,
				maxPolarAngle: PI * 0.55,
			},
			'player',
		);
		this.cameraController.add(playerOrbitCam, true);
		this.base.camera = this.cameraController.get('player').camObject;
	}

	async setBodyMesh() {
		this.base.geometry = new CapsuleGeometry(0.5, 0.5, 10, 20);
		this.base.geometry.translate(0, -0.75, 0);

		this.base.capsuleInfo = {
			radius: {
				base: 0.4,
				body: 0.27,
			},
			segment: new Line3(new Vector3(), new Vector3(0, -0.5, 0)),
		};

		const texture = await loadTexture('characterTexture');
		texture.flipY = false;
		texture.encoding = sRGBEncoding;

		this.base.material = new PlayerMaterial({
			map: texture,
			uniforms: {
				// uTexture: { value: texture },
			},
		});

		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.base.mesh.visible = false;

		this.scene.add(this.base.mesh);
	}

	async setModel() {
		const m = await loadGLTF(model);

		m.scene.traverse((object) => {
			if (object.material) object.material = this.base.material;
		});

		this.base.model = m;
		this.base.model.scene.rotateY(PI);
		this.base.model.scene.translateOnAxis(params.upVector, -0.9);

		this.base.group.add(this.base.model.scene);
		this.scene.add(this.base.group);
	}

	setAnimation() {
		this.base.animation = new AnimationController({ model: this.base.model, name: 'player' });
	}

	move(dt, collider) {
		const delta = dt * 0.001;

		playerVelocity.y += this.state.isOnGround ? 0 : delta * this.params.gravity;
		this.base.mesh.position.addScaledVector(playerVelocity, delta);

		this.updateDirection();
		this.updateSpeed(delta, dt);

		// adjust player position based on collisions
		tBox3a.makeEmpty();
		tMat4a.copy(collider.base.mesh.geometry.matrixWorld).invert();
		tLine3.copy(this.base.capsuleInfo.segment);

		// get the position of the capsule in the local space of the collider
		tLine3.start.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat4a);
		tLine3.end.applyMatrix4(this.base.mesh.matrixWorld).applyMatrix4(tMat4a);

		// get the axis aligned bounding box of the capsule
		tBox3a.expandByPoint(tLine3.start);
		tBox3a.expandByPoint(tLine3.end);

		tBox3b.copy(tBox3a);

		tBox3a.min.addScalar(-this.base.capsuleInfo.radius.base);
		tBox3a.max.addScalar(this.base.capsuleInfo.radius.base);

		tBox3b.min.addScalar(-this.base.capsuleInfo.radius.body);
		tBox3b.max.addScalar(this.base.capsuleInfo.radius.body);

		collider.base.mesh.geometry.boundsTree.shapecast({
			intersectsBounds: (box) => box.intersectsBox(tBox3a),

			intersectsTriangle: (tri) => {
				// check if the triangle is intersecting the capsule and adjust the capsule position if it is
				const triPoint = tVec3a;
				const capsulePoint = tVec3b;

				const distance = tri.closestPointToSegment(tLine3, triPoint, capsulePoint);
				if (distance < this.base.capsuleInfo.radius.base) {
					const depth = this.base.capsuleInfo.radius.base - distance;
					const direction = capsulePoint.sub(triPoint).normalize();

					if (Math.abs(direction.y) < 0.5) {
						direction.y = 0;
					}

					tLine3.start.addScaledVector(direction, depth);
					tLine3.end.addScaledVector(direction, depth);
				}
			},
		});

		// get the adjusted position of the capsule collider in world space after checking
		// triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
		// the origin of the player model
		const newPosition = tVec3a;
		newPosition.copy(tLine3.start).applyMatrix4(collider.base.mesh.geometry.matrixWorld);

		// check how much the collider was moved
		const deltaVector = tVec3b;
		deltaVector.subVectors(newPosition, this.base.mesh.position);

		// if the player was primarily adjusted vertically
		// we assume it's on something we should consider ground
		if (collider.base.type === 'walkable')
			this.state.isOnGround = deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

		const offset = Math.max(0, deltaVector.length() - 1e-5);
		deltaVector.normalize().multiplyScalar(offset);

		// adjust the player model
		this.base.mesh.position.add(deltaVector);

		if (!this.state.isOnGround) {
			// prevent user sticking the ceiling
			deltaVector.normalize();
			tVec3e.set(0, deltaVector.y, 0);
			playerVelocity.addScaledVector(tVec3e, -tVec3e.dot(playerVelocity));
		} else {
			playerVelocity.set(0, 0, 0);
		}

		// if the player has fallen too far below the level reset their position to the start
		if (this.base.mesh.position.y < -25) this.reset();
	}

	updateDirection() {
		playerDirection = this.base.mesh.rotation.y;
		camDirection = this.base.camera.orbit.spherical.theta;

		if (!store.game.player.canMove) {
			this.state.forwardPressed = false;
			this.state.backwardPressed = false;
			this.state.leftPressed = false;
			this.state.rightPressed = false;

			return;
		}

		// gestion de la direction
		this.state.forwardPressed = this.keyPressed.forward;
		this.state.backwardPressed = this.keyPressed.backward;
		this.state.leftPressed = this.keyPressed.left;
		this.state.rightPressed = this.keyPressed.right;

		if (this.state.leftPressed && !this.state.rightPressed) lastXAxis = 'left';
		if (!this.state.leftPressed && this.state.rightPressed) lastXAxis = 'right';
		if (!this.state.leftPressed && !this.state.rightPressed) lastXAxis = '';

		if (this.state.forwardPressed && !this.state.backwardPressed) lastZAxis = 'forward';
		if (!this.state.forwardPressed && this.state.backwardPressed) lastZAxis = 'backward';
		if (!this.state.forwardPressed && !this.state.backwardPressed) lastZAxis = '';

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

		this.state.slowDown =
			Math.abs(currentDirection - nextDirection) >= PI - 0.003 &&
			Math.abs(currentDirection - nextDirection) <= PI + 0.003;

		currentDirection = nextDirection;
	}

	updateSpeed(delta, dt) {
		inertieTarget = this.keyPressed.shift ? params.sprint : params.speed;

		if (this.state.keysPressed) {
			if (!this.tmpSlowDown && this.state.slowDown) {
				speedTarget = 0;
			} else speedTarget = dampPrecise(speedTarget, inertieTarget, 0.04, dt, 0.1);
		} else speedTarget = 0;

		if (!store.game.player.canMove) speedTarget = 0;

		this.tmpSlowDown = this.state.slowDown;

		// Rotate only if the player is moving
		directionTarget = currentDirection + camDirection;
		if (this.state.isMoving && player.realSpeed > params.speed * 0.1) {
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
		} else if (this.state.keysPressed) this.base.mesh.rotation.y = directionTarget;
		tVec3a.set(0, 0, -1).applyAxisAngle(params.upVector, playerDirection);
		this.base.mesh.position.addScaledVector(tVec3a, speed * delta);

		this.base.mesh.updateMatrixWorld();
	}

	async jump(delay = 0) {
		if (this.state.isJumping) return;
		if (!store.game.player.canMove) return;

		this.state.hasJumped = this.state.isJumping = true;
		await wait(delay);
		playerVelocity.y = 13;
		this.state.isJumping = false;
		signal.emit('sound:play', 'jump');
	}

	checkPlayerPosition(dt) {
		const playerPos = this.getPosition();

		previousPlayerPos = playerPosY;
		playerPosY = playerPos.y;

		let deltaPlayerPosY = Math.round((playerPosY - previousPlayerPos) * 100) * 0.001;

		this.state.isMounting = deltaPlayerPosY >= 0 && deltaPlayerPosY !== 0;
		this.state.isFalling = !this.state.isMounting && deltaPlayerPosY !== 0;

		// get real speed based on the player's delta position
		tVec2a.copy({ x: playerPos.x, y: playerPos.z });
		const _d = tVec2b.distanceTo(tVec2a);

		if (!dt) return;
		player.realSpeed = (_d / dt) * 1000;
		this.state.isMoving = player.realSpeed > 0.002;
		tVec2b.copy(tVec2a);
	}

	updatePlayerCam(dt) {
		this.base.camera.orbit.targetOffset.copy(this.base.mesh.position);

		camInertie = dampPrecise(camInertie, player.realSpeed * 0.2, 0.25, dt, 0.001);
		this.base.camera.orbit.sphericalTarget.setRadius(camParams.radius + (camInertie || 0));

		let axisTarget = 0;
		let strength = 0;
		if (!this.state.hasJumped) {
			axisTarget =
				this.state.isFalling || this.state.isMounting
					? (playerPosY - previousPlayerPos) * 0.2
					: 0;
			strength = this.state.isFalling || this.state.isMounting ? 0.03 : 0.2;
		}
		camAxisTarget = dampPrecise(camAxisTarget, axisTarget, strength, dt, 0.001);
		this.base.camera.orbit.spherical
			.setPhi(this.base.camera.orbit.spherical.phi + camAxisTarget)
			.makeSafe();
	}

	async updateAnimation() {
		let previousPlayerAnim = player.anim;

		if (this.state.isOnGround && !this.state.hasJumped) {
			if (this.state.isMoving && player.realSpeed >= params.speed * 0.1) {
				// force run animation if the player sprints
				if (this.keyPressed.shift) player.anim = this.base.animation.get('run');
				else {
					if (player.realSpeed <= params.speed + 3)
						player.anim = this.base.animation.get('walk');
					if (player.realSpeed > params.speed + 3.5)
						player.anim = this.base.animation.get('run');
				}
			} else player.anim = this.base.animation.get('idle');
		}

		if (this.keyPressed.space && this.state.isOnGround && !this.state.isJumping) {
			if (!store.game.player.canMove) return;

			if (this.state.isMoving && player.realSpeed >= params.speed * 0.1) {
				player.anim = this.base.animation.get('run_jump');
				this.base.animation.playOnce(player.anim);
				this.jump(0);
			} else {
				player.anim = this.base.animation.get('jump');
				this.base.animation.playOnce(player.anim);
				this.jump(400);
			}
		}

		if (this.state.isFalling && this.state.hasJumped && !this.state.isOnGround)
			player.anim = this.base.animation.get('falling');

		if (previousPlayerAnim != player.anim) this.base.animation.switch(player.anim);
	}

	updateSounds() {
		if (
			this.state.isMoving &&
			this.state.isOnGround &&
			player.realSpeed > 1 &&
			!this.state.isFalling
		) {
			if (this.state.isOnGrass) {
				signal.emit('sound:play', 'footsteps-grass', { rate: player.realSpeed * 0.3 });
				signal.emit('sound:stop', 'footsteps-ground');
			} else {
				signal.emit('sound:play', 'footsteps-ground', { rate: player.realSpeed * 0.35 });
				signal.emit('sound:stop', 'footsteps-grass');
			}
		} else if (this.state.isFalling && this.state.isOnGround && this.state.hasJumped)
			signal.emit('sound:play', 'fall');
		else {
			if (this.state.isOnGrass) signal.emit('sound:stop', 'footsteps-grass');
			else signal.emit('sound:stop', 'footsteps-ground');
		}
	}

	getPosition() {
		return this.base.mesh.position;
	}

	getDirection(vec) {
		return this.base.mesh.getWorldDirection(vec);
	}

	getQuaternion() {
		return this.base.mesh.quaternion;
	}

	async reset() {
		if (this.state.isDead) return;

		this.state.isDead = true;

		signal.emit('postpro:transition-in', 250);
		await wait(250);

		speed = 0;
		playerVelocity.set(0, 0, 0);

		this.base.mesh.position.copy(this.checkpoint.pos);
		this.base.mesh.rotation.setFromQuaternion(this.checkpoint.qt);

		this.base.camera.orbit.targetOffset.copy(this.base.mesh.position || this.checkpoint.pos);
		this.base.camera.orbit.sphericalTarget.setTheta(this.base.mesh.rotation.y || 0);

		await wait(200);

		this.state.isDead = false;
		signal.emit('postpro:transition-out');
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		this.broadphase.update(this.base.mesh.position);

		if (this.broadphase.currentObjects.length)
			this.broadphase.currentObjects.forEach((collider) => {
				for (let i = 0; i < params.physicsSteps; i++)
					this.move(
						dt / params.physicsSteps / this.broadphase.currentObjects.length,
						collider,
					);
			});

		this.checkPlayerPosition(dt);
		this.updateAnimation();
		this.updateSounds();

		// adjust the camera
		this.updatePlayerCam(dt);

		speed = dampPrecise(speed, speedTarget, 0.1, dt, 0.1);

		// update the player's model position
		this.base.group.position.copy(this.base.mesh.position);
		this.base.group.rotation.y = this.base.mesh.rotation.y;

		if (this.state.hasJumped && !this.state.isJumping)
			this.state.hasJumped = !this.state.isOnGround;

		this.state.keysPressed =
			this.state.forwardPressed ||
			this.state.backwardPressed ||
			this.state.leftPressed ||
			this.state.rightPressed;

		this.base.animation.update(dt);
	}

	setCheckpoint(cp) {
		this.checkpoint = cp;
	}

	setStartPosition(cp) {
		this.base.mesh.position.copy(cp.pos);
		this.base.mesh.rotation.setFromQuaternion(cp.qt);

		this.setCheckpoint(cp);
	}
}

/**
 *
 * @returns {Player}
 */
const initPlayer = () => {
	return new Player();
};

/**
 *
 * @returns {Player}
 */
const getPlayer = () => {
	return Player.instance;
};

export { initPlayer, getPlayer };
