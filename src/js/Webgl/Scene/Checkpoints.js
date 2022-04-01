import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry, Vector3 } from 'three';
import signal from 'philbin-packages/signal';

const radius = 2;
const _pVec3 = new Vector3();

export default class Checkpoints {
	constructor({ points = [], scene }) {
		this.scene = scene;

		this.points = points;
		this.checkpointsIndex = 1;
		this.isInside = false;

		this.nextCheckpointPos = new Vector3();

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

		this.nextCheckpointPos.fromArray(this.points[1]);

		/// #if DEBUG
		this.checkpointMesh.position.copy(this.nextCheckpointPos);
		this.scene.instance.add(this.checkpointMesh);
		/// #endif
	}

	getCurrent() {
		return _pVec3.fromArray(this.points[this.checkpointsIndex - 1]);
	}

	update(et, dt) {
		if (!this.initialized) return;
		if (this.checkpointsIndex !== this.points.length) {
			const inRange =
				this.scene.player.base.mesh.position.distanceTo(this.nextCheckpointPos) < radius;

			if (!this.isInside && inRange) {
				this.isInside = true;

				this.checkpointsIndex++;

				/// #if DEBUG
				console.log('👊 Checkpoint reached');
				/// #endif
				signal.emit('checkpoint', this.getCurrent());

				// Tp mesh to next checkpoint to collide
				if (this.points[this.checkpointsIndex]) {
					this.nextCheckpointPos.fromArray(this.points[this.checkpointsIndex]);
					/// #if DEBUG
					this.checkpointMesh.position.copy(this.nextCheckpointPos);
					/// #endif
				}
			} else if (!inRange && this.isInside) this.isInside = false;
		}
	}
}
