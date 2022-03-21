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
import { lerp, lerpPrecise } from 'philbin-packages/maths';

import model from '/assets/model/player.glb';
import Camera from '@webgl/Camera';
import debugMaterial from '../materials/debug/material';
import defaultMaterial from '../materials/default/material';

const twoPI = Math.PI * 2;
const tVec3a = new Vector3();
const tVec3b = new Vector3();
const tBox = new Box3();
const tMat = new Matrix4();
const tSegment = new Line3();
const playerVelocity = new Vector3();

let initialized = false;

const params = {
	speed: 10,
	physicsSteps: 5,
	upVector: new Vector3().set(0, 1, 0),
	defaultPos: new Vector3().set(0, 3, 30),
};

const state = {
	playerOnGround: true,
};

const dynamic = {
	cameraAngle: 0,
	playerAngle: 0,
	currentAngle: 0,

	speed: 0,
};

let tmpAngle = 0;
let turnAngleTarget = 0;
let speedTarget = 0;
let sens = 1;

const lastDirection = new Vector3();

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

		this.camera = webgl.camera.debugCam;
		console.log(this.camera);

		this.scene = webgl.scene.instance;

		this.ground = opt.ground;

		this.base = {};
		this.base.group = new Group();

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
			min: 0,
			max: 30,
			step: 1,
		});
		gui.addSeparator();
		gui.addMonitor(state, 'playerOnGround', { label: 'Player on ground', type: 'graph' });
	}

	helpers() {
		this.scene.add(this.base.group);

		const v = this.setVisualizer(this.base.mesh, 15);
		this.scene.add(v);

		const axesHelper = new AxesHelper(2);
		this.base.group.add(axesHelper);
		console.log(axesHelper.position);
	}
	/// #endif

	async init() {
		// this.setCameraPlayer();
		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		initialized = true;
	}

	setCameraPlayer() {
		const cam = new Camera();
		this.camera = cam.debugCam;
	}

	setGeometry() {
		this.base.geometry = new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5);

		this.base.geometry.translate(0, -0.5, 0);

		this.base.capsuleInfo = {
			radius: 0.5,
			segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
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
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);

		this.base.mesh.position.copy(params.defaultPos);
		this.base.group.add(this.base.mesh);
		this.scene.add(this.base.mesh);
	}

	move(dt) {
		const delta = dt * 0.001;

		playerVelocity.y += state.playerOnGround ? 0 : delta * this.params.gravity;
		this.base.mesh.position.addScaledVector(playerVelocity, delta);

		// move the player

		// if (state.playerOnGround) {
		dynamic.currentAngle = this.base.mesh.rotation.y;

		// console.log(tmpAngle);
		// dynamic.currentAngle = this.camera.orbit.spherical.theta;
		// tVec3a.set(0, 0, 0).applyAxisAngle(params.upVector, tmpAngle);

		if (this.keyPressed.forward) {
			// tVec3a.set(0, 0, -1).applyAxisAngle(params.upVector, tmpAngle);
			// this.base.mesh.position.addScaledVector(tVec3a, dynamic.speed * delta);

			turnAngleTarget = tmpAngle + 0;
		}

		if (this.keyPressed.backward) {
			// tVec3a.set(0, 0, 1).applyAxisAngle(params.upVector, tmpAngle);
			// this.base.mesh.position.addScaledVector(tVec3a, dynamic.speed * delta);

			turnAngleTarget = tmpAngle + Math.PI;
		}

		if (this.keyPressed.left) {
			// tVec3a.set(-1, 0, 0).applyAxisAngle(params.upVector, tmpAngle);
			// this.base.mesh.position.addScaledVector(tVec3a, dynamic.speed * delta);

			turnAngleTarget = tmpAngle + Math.PI / 2;

			// this.base.mesh.rotation.y += delta * 2.2;
			// this.base.mesh.rotation.y = this.base.mesh.rotation.y;
			// if (this.base.mesh.rotation.y > Math.PI)
			// 	this.base.mesh.rotation.y = this.base.mesh.rotation.y - 2 * Math.PI;
		}
		if (this.keyPressed.right) {
			// tVec3a.set(1, 0, 0).applyAxisAngle(params.upVector, tmpAngle);
			// this.base.mesh.position.addScaledVector(tVec3a, dynamic.speed * delta);

			turnAngleTarget = tmpAngle + -Math.PI / 2;

			// this.base.mesh.rotation.y = this.base.mesh.rotation.y;
			// if (this.base.mesh.rotation.y < -Math.PI)
			// 	this.base.mesh.rotation.y = this.base.mesh.rotation.y + 2 * Math.PI;
		}

		tVec3a.set(0, 0, -1);
		lastDirection.copy(tVec3a).applyAxisAngle(params.upVector, dynamic.playerAngle);
		this.base.mesh.position.addScaledVector(lastDirection, dynamic.speed * delta);

		if (this.keyPressed.forward && this.keyPressed.left)
			turnAngleTarget = tmpAngle + Math.PI / 4;
		if (this.keyPressed.forward && this.keyPressed.right)
			turnAngleTarget = tmpAngle + -Math.PI / 4;
		if (this.keyPressed.backward && this.keyPressed.left)
			turnAngleTarget = tmpAngle + (3 * Math.PI) / 4;
		if (this.keyPressed.backward && this.keyPressed.right)
			turnAngleTarget = tmpAngle + (5 * Math.PI) / 4;

		if (
			this.keyPressed.forward ||
			this.keyPressed.backward ||
			this.keyPressed.left ||
			this.keyPressed.right
		)
			speedTarget = params.speed;
		else speedTarget = 0;

		// if (
		// 	(!this.keyPressed.left && !this.keyPressed.right) ||
		// 	(this.keyPressed.left && this.keyPressed.right)
		// ) {
		// 	turnAngleTarget = 0;
		// }
		// }

		// console.log(this.base.mesh.rotation.y);

		if (this.keyPressed.space) {
			if (state.playerOnGround) playerVelocity.y = 10.0;
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

		const offset = Math.max(0.0, deltaVector.length() - 1e-5);
		deltaVector.normalize().multiplyScalar(offset);

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

		// this.camera.orbit.sphericalTarget.set(
		// 	this.camera.orbit.sphericalTarget.radius,
		// 	this.camera.orbit.sphericalTarget.phi,
		// 	dynamic.cameraAngle,
		// );

		// if the player has fallen too far below the level reset their position to the start
		if (this.base.mesh.position.y < -25) {
			this.reset();
		}
	}

	reset() {
		playerVelocity.set(0, 0, 0);
		this.base.mesh.position.copy(params.defaultPos);
		this.camera.camera.position.sub(this.camera.orbit.targetOffset);
		this.camera.orbit.targetOffset.copy(this.base.mesh.position);
		this.camera.camera.position.add(this.base.mesh.position);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		for (let i = 0; i < params.physicsSteps; i++) {
			this.move(dt / params.physicsSteps);
		}

		dynamic.cameraAngle = lerp(dynamic.cameraAngle, dynamic.currentAngle, 0.1);
		dynamic.playerAngle = lerp(dynamic.playerAngle, dynamic.currentAngle, 0.1);

		tmpAngle = this.camera.orbit.spherical.theta;

		// if (turnAngleTarget >= twoPI) turnAngleTarget -= twoPI;
		// if (this.base.mesh.rotation.y >= twoPI) this.base.mesh.rotation.y -= twoPI;

		// console.log(this.base.mesh.rotation.y);

		// console.log(turnAngleTarget - this.base.mesh.rotation.y <= Math.PI);
		if (turnAngleTarget - this.base.mesh.rotation.y <= Math.PI) sens = -1;
		else sens = 1;

		this.base.mesh.rotation.y = lerpPrecise(this.base.mesh.rotation.y, turnAngleTarget, 0.09);
		// console.log(this.base.mesh.rotation.y - turnAngleTarget);
		// if (this.base.mesh.rotation.y - turnAngleTarget < 0.01) {
		dynamic.speed = lerpPrecise(dynamic.speed, speedTarget, 0.04);
		// }

		this.base.group.position.copy(this.base.mesh.position);
		this.base.group.quaternion.copy(this.base.mesh.quaternion);

		// console.log(this.base.group.position, this.base.group.quaternion);
		// console.log(dynamic.speed);

		// dynamic.cameraAngle = lerp(dynamic.cameraAngle, 0, 0.01);
		// console.log(dynamic.cameraAngle);
	}
}
