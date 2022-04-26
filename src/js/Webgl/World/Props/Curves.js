import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import signal from 'philbin-packages/signal';
import { Group } from 'three';
import { beziersPath, catmullPath } from '@utils/webgl/blenderCurves';
import { LineBasicMaterial } from 'three';
import { Line } from 'three';
import { BufferGeometry } from 'three';

export default class Curves {
	constructor({ curves = [], scene }) {
		this.scene = scene;

		this.rawCurves = curves;
		this.curves = [];
		this.group = new Group();

		this.initialized = false;

		this.init();
	}

	init() {
		this.initialized = true;

		this.loadCurves();

		/// #if DEBUG
		this.scene.instance.add(this.group);
		/// #endif
	}

	loadCurves() {
		this.rawCurves.forEach((curve) => {
			const { uid, type, closed, points } = curve;
			if (!type) return;
			const _t = type.toLowerCase();

			if (_t === 'nurbs') this.curves.push(catmullPath(points, { closed, uid }));
			else if (_t === 'bezier') this.curves.push(beziersPath(points, { closed, uid }));
		});

		console.log(this.curves);

		/// #if DEBUG
		const curveHelpers = [];
		const material = new LineBasicMaterial({
			color: 0xff0000,
			linewidth: 1,
		});
		this.curves.forEach((curve) => {
			const _points = curve.getPoints(250);
			const _geometry = new BufferGeometry().setFromPoints(_points);
			const _curve = new Line(_geometry, material);

			curveHelpers.push(_curve);
		});

		this.group.add(...curveHelpers);
		/// #endif
	}

	getCurve(label) {
		return label;
	}

	update(et, dt) {
		if (!this.initialized) return;
	}
}
