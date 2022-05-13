import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import { Quaternion } from 'three';
import { getPlayer } from '@webgl/World/Characters/Player';

const tVec3 = new Vector3();

export default class Area {
	constructor({ area, group }) {
		this.player = getPlayer();

		this.group = group;
		this.area = area;

		this.base = {
			pos: tVec3,
			radius: 1,
			zone: '',
		};

		this.isInside = false;

		this.initialized = false;

		this.init();
	}

	init() {
		this.setArea(this.area);

		this.initialized = true;
	}

	setArea(area) {
		const { zone, pos, size } = area;

		this.base.zone = zone;
		this.base.pos = tVec3.fromArray(pos);
		this.base.size = size;

		/// #if DEBUG
		this.mesh = new Mesh(
			new SphereGeometry(1, 16, 16),
			new BaseBasicMaterial({ color: new Color('red'), wireframe: true }),
		);
		this.mesh.scale.setScalar(size);
		this.mesh.position.copy(this.base.pos);
		this.group.add(this.mesh);
		/// #endif
	}

	getCurrent() {
		return {
			pos: this.base.pos,
		};
	}

	update(et, dt) {
		if (!this.initialized) return;

		const inRange = this.player.base.mesh.position.distanceTo(this.base.pos) < this.base.size;

		if (!this.isInside && inRange) {
			this.isInside = true;

			/// #if DEBUG
			console.log('👊 Area enter');
			/// #endif
			// signal.emit('checkpoint', this.getCurrent());
		} else if (!inRange && this.isInside) this.isInside = false;
	}
}
