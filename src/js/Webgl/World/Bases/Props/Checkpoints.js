import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import { Quaternion } from 'three';
import { getPlayer } from '@webgl/World/Characters/Player';

const radius = 2;
const tVec3 = new Vector3();
const tQuat = new Quaternion();

export default class Checkpoints {
	constructor({ points = [], scene }) {
		this.player = getPlayer();

		this.scene = scene;
		this.points = points;

		this.checkpointsIndex = 1;
		this.isInside = false;

		this.nextCheckpointPos = new Vector3();
		this.nextCheckpointQt = new Quaternion();

		this.initialized = false;

		/// #if DEBUG
		this.checkpointMesh = new Mesh(
			new SphereGeometry(radius, 16, 16),
			new BaseBasicMaterial({ color: new Color('red'), wireframe: true }),
		);
		/// #endif

		if (this.points.length > 1) this.init();
	}

	init() {
		this.initialized = true;

		this.nextCheckpointPos.copy(this.points[1].pos);
		this.nextCheckpointQt.copy(this.points[1].qt);

		/// #if DEBUG
		this.checkpointMesh.position.copy(this.nextCheckpointPos);
		this.checkpointMesh.quaternion.copy(this.nextCheckpointQt);
		this.scene.instance.add(this.checkpointMesh);
		/// #endif
	}

	getCurrent() {
		return {
			pos: tVec3.copy(this.points[this.checkpointsIndex - 1].pos),
			qt: tQuat.copy(this.points[this.checkpointsIndex - 1].qt),
		};
	}

	update(et, dt) {
		if (!this.initialized) return;
		if (this.checkpointsIndex >= this.points.length) return;

		const inRange = this.player.base.mesh.position.distanceTo(this.nextCheckpointPos) < radius;

		if (!this.isInside && inRange) {
			this.isInside = true;

			this.checkpointsIndex++;

			/// #if DEBUG
			console.log('👊 Checkpoint reached');
			/// #endif
			signal.emit('checkpoint', this.getCurrent());

			// Tp mesh to next checkpoint to collide
			if (this.points[this.checkpointsIndex]) {
				this.nextCheckpointPos.copy(this.points[this.checkpointsIndex].pos);
				this.nextCheckpointQt.copy(this.points[this.checkpointsIndex].qt);
				/// #if DEBUG
				this.checkpointMesh.position.copy(this.nextCheckpointPos);
				this.checkpointMesh.quaternion.copy(this.nextCheckpointQt);
				/// #endif
			}
		} else if (!inRange && this.isInside) this.isInside = false;
	}
}
