import {
	BoxBufferGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	MathUtils,
	Mesh,
	PlaneBufferGeometry,
	RepeatWrapping,
	ShaderMaterial,
	TextureLoader,
	Vector3,
} from 'three';

import { loadTexture } from '@utils/loaders/loadAssets';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';

import fragmentShader from './Shaders/fragment.glsl';
import vertexShader from './Shaders/vertex.glsl';

let initialized = false;

const params = {
	speed: 0.15,
	displacement: 0.2,
	windColorIntensity: 0.2,
	noiseMouvementIntensity: 0.2,
	noiseElevationIntensity: 0.75,
	elevationIntensity: 0.25,
	maskRange: 0.04,
	halfBoxSize: 28,
	verticeScale: 0.42,
	count: 300000,
	color: '#de47ff',
	fogColor: '#3e2e77',
};

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

export default class Grass {
	constructor(scene) {
		this.scene = scene.instance;
		this.player = scene.player;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.base = {};
	}

	async loadTexture() {
		this.noiseTexture = await loadTexture('noiseTexture');
		this.noiseTexture.wrapS = this.noiseTexture.wrapT = RepeatWrapping;
	}

	async init() {
		await this.loadTexture();
		this.setDefaultGeometry();
		this.setInstancedGeometry();
		this.setMaterial();
		this.setMesh();

		/// #if DEBUG
		this.debug();
		/// #endif

		initialized = true;
	}

	setDefaultGeometry() {
		this.triangle = new BufferGeometry();

		const vertices = new Float32Array([
			-0.5 * params.verticeScale,
			-0.5 * params.verticeScale,
			0 * params.verticeScale, // bl
			0.5 * params.verticeScale,
			-0.5 * params.verticeScale,
			0 * params.verticeScale, // br
			0 * params.verticeScale,
			0.5 * params.verticeScale,
			0 * params.verticeScale, // tc
		]);

		const normal = new Float32Array([
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		]);
		const uv = new Float32Array([0, 1, 1, 1, 0, 0]);
		const indices = new Uint16Array([0, 1, 2]);

		this.triangle.setIndex(new BufferAttribute(indices, 1));
		this.triangle.setAttribute('position', new BufferAttribute(vertices, 3));
		this.triangle.setAttribute('normal', new BufferAttribute(normal, 3));
		this.triangle.setAttribute('uv', new BufferAttribute(uv, 2));
	}

	setInstancedGeometry() {
		this.positions = new Float32Array(params.count * 2);
		const scale = new Float32Array(params.count * 1);

		for (let i = 0; i < params.count; i++) {
			this.positions[i * 3 + 0] = MathUtils.randFloatSpread(params.halfBoxSize * 2);
			this.positions[i * 3 + 2] = MathUtils.randFloatSpread(params.halfBoxSize * 2);

			const random = MathUtils.randFloat(1, 2);
			scale[i * 3 + 0] = random;
			scale[i * 3 + 1] = random;
			scale[i * 3 + 2] = random;
		}

		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = this.triangle.index;
		this.base.geometry.attributes.position = this.triangle.attributes.position;
		this.base.geometry.attributes.normal = this.triangle.attributes.normal;
		this.base.geometry.attributes.uv = this.triangle.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(this.positions, 3, false),
		);
		this.base.geometry.setAttribute('aScale', new InstancedBufferAttribute(scale, 3, false));
	}

	setMaterial() {
		this.charaPos = new Vector3();

		this.base.material = new ShaderMaterial({
			side: DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uSpeed: { value: params.speed },
				uDisplacement: { value: params.displacement },
				uWindColorIntensity: { value: params.windColorIntensity },
				uMaskRange: { value: params.maskRange },
				uNoiseMouvementIntensity: { value: params.noiseMouvementIntensity },
				uNoiseElevationIntensity: { value: params.noiseElevationIntensity },
				uElevationIntensity: { value: params.elevationIntensity },
				uHalfBoxSize: { value: params.halfBoxSize },
				uCharaPos: { value: this.charaPos },
				uNoiseTexture: { value: this.noiseTexture },
				uColor: { value: new Color().set(params.color) },
				uFogColor: { value: new Color().set(params.fogColor) },
			},
			transparent: true,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;
	}

	/// #if DEBUG
	debug() {
		const gui = debug.instance.addFolder({ title: debug.label });
		gui.addInput(this.base.material.uniforms.uSpeed, 'value', {
			label: 'speed',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addInput(this.base.material.uniforms.uDisplacement, 'value', {
			label: 'displace',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addInput(this.base.material.uniforms.uWindColorIntensity, 'value', {
			label: 'windColorI',
			min: 0,
			max: 0.5,
			step: 0.01,
		});
		gui.addInput(this.base.material.uniforms.uElevationIntensity, 'value', {
			label: 'elevationI',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addInput(this.base.material.uniforms.uNoiseMouvementIntensity, 'value', {
			label: 'nMouvementI',
			min: 0,
			max: 0.5,
			step: 0.01,
		});
		gui.addInput(this.base.material.uniforms.uNoiseElevationIntensity, 'value', {
			label: 'nElevationI',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addInput(params, 'halfBoxSize', {
			label: 'boxSize',
			min: 1,
			max: 100,
			step: 0.01,
		}).on('change', (size) => {
			if (!size.last) return;
			for (let i = 0; i < params.count; i++) {
				this.positions[i * 3 + 0] = MathUtils.randFloatSpread(params.halfBoxSize * 2);
				this.positions[i * 3 + 2] = MathUtils.randFloatSpread(params.halfBoxSize * 2);
			}
			this.base.material.uniforms.uHalfBoxSize.value = size.value;
			this.base.geometry.setAttribute(
				'aPositions',
				new InstancedBufferAttribute(this.positions, 3, false),
			);
		});
		gui.addInput(this.base.material.uniforms.uMaskRange, 'value', {
			label: 'maskRange',
			min: 0,
			max: 0.5,
			step: 0.01,
		});

		gui.addInput(params, 'color').on('change', (color) => {
			this.base.material.uniforms.uColor.value.set(color.value);
		});
		gui.addInput(params, 'fogColor').on('change', (color) => {
			this.base.material.uniforms.uFogColor.value.set(color.value);
		});
	}
	/// #endif

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		this.charaPos.copy(this.player.base.mesh.position);

		this.base.material.uniforms.uTime.value = et;
	}
}
