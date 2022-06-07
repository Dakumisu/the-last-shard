import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import { Quaternion } from 'three';
import { getPlayer } from '@webgl/World/Characters/Player';

const tVec3 = new Vector3();

export default class Areas {
	constructor({ areas = [], scene }) {
		this.player = getPlayer();

		this.scene = scene;
		this.areas = areas;

		this.base = {
			pos: tVec3,
			radius: 1,
			zone: '',
		};

		this.isInside = false;
		this.currentArea = null;

		this.initialized = false;

		this.initAreas();
	}

	initAreas() {
		const { zone, pos, size } = this.areas;

		/// #if DEBUG
		this.areas.forEach((area) => {
			const mesh = new Mesh(
				new SphereGeometry(1, 16, 16),
				new BaseBasicMaterial({ color: new Color('red'), wireframe: true }),
			);
			mesh.scale.setScalar(area.size);
			mesh.position.copy(area.pos);
			this.scene.instance.add(mesh);
		});
		/// #endif

		this.initialized = true;
	}

	getCurrent() {
		return this.currentArea;
	}

	update(et, dt) {
		if (!this.initialized) return;

		if (this.currentArea) {
			// check if the player leave the current area
			const inRange =
				this.player.base.mesh.position.distanceTo(this.currentArea.pos) <
				this.currentArea.size;
			if (inRange && this.isInside) return;

			const name = `${this.scene.label.toLowerCase()}_${this.currentArea.zone}`;
			signal.emit('area:leave', name);

			this.isInside = false;
			this.currentArea = null;

			/// #if DEBUG
			console.log('👊 Area leave');
			/// #endif
		} else {
			// check if the player enter in an area
			this.areas.forEach((area) => {
				const inRange = this.player.base.mesh.position.distanceTo(area.pos) < area.size;
				if (!inRange) return;

				this.currentArea = area;
				this.isInside = true;

				const name = `${this.scene.label.toLowerCase()}_${this.currentArea.zone}`;
				signal.emit('area:enter', name);

				/// #if DEBUG
				console.log('👊 Area enter:', this.currentArea.zone);
				/// #endif
			});
		}
	}
}
