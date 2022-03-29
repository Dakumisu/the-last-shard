import {
	BoxBufferGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	Float32BufferAttribute,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	PlaneBufferGeometry,
	PlaneGeometry,
	RawShaderMaterial,
	RepeatWrapping,
	ShaderMaterial,
	TextureLoader,
	Triangle,
	Vector3,
	Vector4,
} from 'three';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';

import fragmentShader from './Shaders/fragment.glsl';
import vertexShader from './Shaders/vertex.glsl';

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

const BLADE_WIDTH = 0.3;
const BLADE_HEIGHT = 0.5;
const BLADE_HEIGHT_VARIATION = 0.6;
const BLADE_VERTEX_COUNT = 5;
const BLADE_TIP_OFFSET = 0.1;

function interpolate(val, oldMin, oldMax, newMin, newMax) {
	return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

const cloudTexture = new TextureLoader().load('/assets/image/cloud.jpg');
cloudTexture.wrapS = cloudTexture.wrapT = RepeatWrapping;

export default class Grass {
	constructor(scene) {
		this.scene = scene.instance;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.base = {};
		this.count = 1000000;
	}

	/// #if DEBUG

	debug() {
		const gui = debug.instance.addFolder({ title: debug.label });
	}
	/// #endif

	async init() {
		this.setGrass();

		/// #if DEBUG
		this.debug();
		/// #endif

		initialized = true;
	}

	setGrass() {
		// geometry
		const vector = new Vector4();

		const positions = [];
		const offsets = [];
		const colors = [];
		const orientationsStart = [];
		const orientationsEnd = [];

		positions.push(0.025, -0.025, 0);
		positions.push(-0.025, 0.025, 0);
		positions.push(0, 0, 0.025);

		// instanced attributes

		for (let i = 0; i < this.count; i++) {
			// offsets

			offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

			// colors

			colors.push(Math.random(), Math.random(), Math.random(), Math.random());

			// orientation start

			vector.set(
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
			);
			vector.normalize();

			orientationsStart.push(vector.x, vector.y, vector.z, vector.w);

			// orientation end

			vector.set(
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
			);
			vector.normalize();

			orientationsEnd.push(vector.x, vector.y, vector.z, vector.w);
		}

		const geometry = new InstancedBufferGeometry();
		geometry.instanceCount = this.count; // set so its initalized for dat.GUI, will be set in first draw otherwise

		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

		geometry.setAttribute('offset', new InstancedBufferAttribute(new Float32Array(offsets), 3));
		geometry.setAttribute('color', new InstancedBufferAttribute(new Float32Array(colors), 4));
		geometry.setAttribute(
			'orientationStart',
			new InstancedBufferAttribute(new Float32Array(orientationsStart), 4),
		);
		geometry.setAttribute(
			'orientationEnd',
			new InstancedBufferAttribute(new Float32Array(orientationsEnd), 4),
		);

		// material

		const material = new ShaderMaterial({
			uniforms: {
				time: { value: 1.0 },
				sineTime: { value: 1.0 },
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: DoubleSide,
			transparent: true,
		});

		//

		const mesh = new Mesh(geometry, material);
		this.scene.add(mesh);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}
