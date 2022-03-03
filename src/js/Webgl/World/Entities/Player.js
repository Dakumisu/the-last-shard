import {
	Box3,
	BoxHelper,
	Color,
	GridHelper,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshNormalMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	Vector2,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import { getWebgl } from '@webgl/Webgl';
import { getGame } from '@game/Game';

import { store } from '@tools/Store';
import loadModel from '@utils/loader/loadGLTF';

import sandbox from '/assets/model/sandbox.glb';
import BaseEntity from '../Components/BaseEntity';

const twoPI = Math.PI * 2;
const tVec2 = new Vector2();
const velocity = new Vector2();
const tCol = new Color();

let initialized = false;

const params = {
	speed: 10,
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
		const control = game.control;

		const webgl = getWebgl();
		this.scene = webgl.scene.instance;
		this.camera = webgl.camera.instance;
		// this.debugCam = webgl.camera.debugCam.camera;

		this.object = {};

		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.debug();
		/// #endif
	}

	/// #if DEBUG
	debug() {}
	/// #endif

	async init() {
		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		initialized = true;
	}

	setGeometry() {
		this.object.geometry = new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5);
	}

	setMaterial() {
		this.object.material = new MeshNormalMaterial();
	}

	setMesh() {
		this.object.mesh = new Mesh(this.object.geometry, this.object.material);

		console.log(this.object.geometry);
		this.object.geometry.computeBoundingBox();
		const playerBox = this.object.geometry.boundingBox;

		// console.log(playerBox);
		this.object.mesh.position.set(0, playerBox.max.y, 30);

		this.helperBox = new BoxHelper(this.object.mesh, 0xffff00);
		this.scene.add(this.object.mesh);
		this.scene.add(this.helperBox);
	}

	move() {
		playerVelocity.y += playerIsOnGround ? 0 : delta * params.gravity;
		player.position.addScaledVector(playerVelocity, delta);

		// move the player
		const angle = controls.getAzimuthalAngle();
		if (fwdPressed) {
			tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(
				tempVector,
				params.playerSpeed * delta,
			);
		}

		if (bkdPressed) {
			tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(
				tempVector,
				params.playerSpeed * delta,
			);
		}

		if (lftPressed) {
			tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(
				tempVector,
				params.playerSpeed * delta,
			);
		}

		if (rgtPressed) {
			tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
			player.position.addScaledVector(
				tempVector,
				params.playerSpeed * delta,
			);
		}

		player.updateMatrixWorld();
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		this.camera.lookAt(this.object.mesh.position);

		this.helperBox.position.copy(this.object.mesh.position);
	}
}

function updatePlayer(delta) {
	playerVelocity.y += playerIsOnGround ? 0 : delta * params.gravity;
	player.position.addScaledVector(playerVelocity, delta);

	// move the player
	const angle = controls.getAzimuthalAngle();
	if (fwdPressed) {
		tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle);
		player.position.addScaledVector(tempVector, params.playerSpeed * delta);
	}

	if (bkdPressed) {
		tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
		player.position.addScaledVector(tempVector, params.playerSpeed * delta);
	}

	if (lftPressed) {
		tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
		player.position.addScaledVector(tempVector, params.playerSpeed * delta);
	}

	if (rgtPressed) {
		tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
		player.position.addScaledVector(tempVector, params.playerSpeed * delta);
	}

	player.updateMatrixWorld();

	// adjust player position based on collisions
	const capsuleInfo = player.capsuleInfo;
	tempBox.makeEmpty();
	tempMat.copy(collider.matrixWorld).invert();
	tempSegment.copy(capsuleInfo.segment);

	// get the position of the capsule in the local space of the collider
	tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
	tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

	// get the axis aligned bounding box of the capsule
	tempBox.expandByPoint(tempSegment.start);
	tempBox.expandByPoint(tempSegment.end);

	tempBox.min.addScalar(-capsuleInfo.radius);
	tempBox.max.addScalar(capsuleInfo.radius);

	collider.geometry.boundsTree.shapecast({
		intersectsBounds: (box) => box.intersectsBox(tempBox),

		intersectsTriangle: (tri) => {
			// check if the triangle is intersecting the capsule and adjust the
			// capsule position if it is.
			const triPoint = tempVector;
			const capsulePoint = tempVector2;

			const distance = tri.closestPointToSegment(
				tempSegment,
				triPoint,
				capsulePoint,
			);
			if (distance < capsuleInfo.radius) {
				const depth = capsuleInfo.radius - distance;
				const direction = capsulePoint.sub(triPoint).normalize();

				tempSegment.start.addScaledVector(direction, depth);
				tempSegment.end.addScaledVector(direction, depth);
			}
		},
	});

	// get the adjusted position of the capsule collider in world space after checking
	// triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
	// the origin of the player model.
	const newPosition = tempVector;
	newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

	// check how much the collider was moved
	const deltaVector = tempVector2;
	deltaVector.subVectors(newPosition, player.position);

	// if the player was primarily adjusted vertically we assume it's on something we should consider ground
	playerIsOnGround =
		deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

	const offset = Math.max(0.0, deltaVector.length() - 1e-5);
	deltaVector.normalize().multiplyScalar(offset);

	// adjust the player model
	player.position.add(deltaVector);

	if (!playerIsOnGround) {
		deltaVector.normalize();
		playerVelocity.addScaledVector(
			deltaVector,
			-deltaVector.dot(playerVelocity),
		);
	} else {
		playerVelocity.set(0, 0, 0);
	}

	// adjust the camera
	camera.position.sub(controls.target);
	controls.target.copy(player.position);
	camera.position.add(player.position);

	// if the player has fallen too far below the level reset their position to the start
	if (player.position.y < -25) {
		reset();
	}
}
