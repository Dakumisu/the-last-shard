import {
	Box3,
	BoxHelper,
	Color,
	GridHelper,
	Line3,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshNormalMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	Vector2,
	Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import { getWebgl } from '@webgl/Webgl';
import { getGame } from '@game/Game';

import { store } from '@tools/Store';
import loadModel from '@utils/loader/loadGLTF';

import BaseEntity from '../Components/BaseEntity';

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
	physicsSteps: 1,
	upVector: new Vector3().set(0, 1, 0),
	defaultPos: new Vector3().set(0, 3, 30),
};

const state = {
	playerOnGround: true,
};

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Player',
};
/// #endif

export default class Player extends BaseEntity {
	constructor(opt = {}) {
		super();

		const game = getGame();
		this.keyPressed = game.control.keyPressed;

		const webgl = getWebgl();
		this.scene = webgl.scene.instance;
		this.debugCam = webgl.camera.debugCam.camera;
		this.control = webgl.camera.debugCam.orbitControls;

		this.ground = opt.ground;

		this.base = {};

		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.debug();
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
	/// #endif

	async init() {
		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		initialized = true;
	}

	setGeometry() {
		this.base.geometry = new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5);
		this.base.geometry.translate(0, -0.5, 0);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);
	}

	setMaterial() {
		this.base.material = new MeshNormalMaterial();
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);

		this.base.mesh.position.copy(params.defaultPos);
		this.scene.add(this.base.mesh);

		this.base.capsuleInfo = {
			radius: 0.5,
			segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
		};

		/// #if DEBUG
		const v = this.setVisualizer(this.base.mesh, 15);
		this.scene.add(v);
		/// #endif
	}

	move(dt) {
		const delta = dt * 0.001;

		playerVelocity.y += state.playerOnGround ? 0 : delta * this.params.gravity;
		this.base.mesh.position.addScaledVector(playerVelocity, delta);

		// move the player
		const angle = this.control.getAzimuthalAngle();
		if (this.keyPressed.forward) {
			tVec3a.set(0, 0, -1).applyAxisAngle(params.upVector, angle);
			this.base.mesh.position.addScaledVector(tVec3a, params.speed * delta);
		}

		if (this.keyPressed.backward) {
			tVec3a.set(0, 0, 1).applyAxisAngle(params.upVector, angle);
			this.base.mesh.position.addScaledVector(tVec3a, params.speed * delta);
		}

		if (this.keyPressed.left) {
			tVec3a.set(-1, 0, 0).applyAxisAngle(params.upVector, angle);
			this.base.mesh.position.addScaledVector(tVec3a, params.speed * delta);
		}

		if (this.keyPressed.right) {
			tVec3a.set(1, 0, 0).applyAxisAngle(params.upVector, angle);
			this.base.mesh.position.addScaledVector(tVec3a, params.speed * delta);
		}

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
		this.debugCam.position.sub(this.control.target);
		this.control.target.copy(this.base.mesh.position);
		this.debugCam.position.add(this.base.mesh.position);

		// if the player has fallen too far below the level reset their position to the start
		if (this.base.mesh.position.y < -25) {
			this.reset();
		}
	}

	reset() {
		playerVelocity.set(0, 0, 0);
		this.base.mesh.position.copy(params.defaultPos);
		this.debugCam.position.sub(this.control.target);
		this.control.target.copy(this.base.mesh.position);
		this.debugCam.position.add(this.base.mesh.position);
		this.control.update();
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		for (let i = 0; i < params.physicsSteps; i++) {
			this.move(dt / params.physicsSteps);
		}
	}
}
