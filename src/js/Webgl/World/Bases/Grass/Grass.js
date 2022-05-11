/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

import {
	BufferAttribute,
	BufferGeometry,
	Color,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	MathUtils,
	Mesh,
	Texture,
} from 'three';

import { getWebgl } from '@webgl/Webgl';
import BaseScene from '@webgl/Scene/BaseScene';
import GrassMaterial from '@webgl/Materials/Grass/GrassMaterial';
import signal from 'philbin-packages/signal';

const twigsCountList = [0, 0, 80000, 100000, 300000, 1000000];

export default class Grass {
	/**
	 *
	 * @param {{scene: BaseScene, params?:{color?: string, color2?: string, verticeScale?: number, halfBoxSize?: number, maskRange?: number, noiseElevationIntensity?: number, noiseMouvementIntensity?: number, windColorIntensity?: number, displacement?: number, positionsTexture: Texture}}}
	 */

	constructor({ scene, params }) {
		this.scene = scene;
		this.params = params;

		const webgl = getWebgl();
		this.renderer = webgl.renderer.renderer;

		this.base = {
			geometry: null,
			material: null,
		};
		this.attributes = {};

		this.triangle = null;

		this.count = twigsCountList[5];

		signal.on('quality', (quality) => {
			this.count = twigsCountList[quality];
			this.updateAttributes();
			// this.setAttributes();
			// this.setGeometry();
			// this.setMaterial();
			// this.setMesh();
		});

		this.initialized = false;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.init();
	}

	init() {
		this.setDefaultGeometry();
		this.setAttributes();
		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		/// #if DEBUG
		this.devtools();
		/// #endif

		this.initialized = true;
	}

	setDefaultGeometry() {
		this.triangle = new BufferGeometry();

		const vertices = new Float32Array([
			-0.15 * this.params.verticeScale,
			-0.15 * this.params.verticeScale,
			0 * this.params.verticeScale, // bl
			0.15 * this.params.verticeScale,
			-0.15 * this.params.verticeScale,
			0 * this.params.verticeScale, // br
			0 * this.params.verticeScale,
			0.75 * this.params.verticeScale,
			0 * this.params.verticeScale, // tc
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

	setAttributes() {
		this.attributes.position = new Float32Array(this.count * 3);
		this.attributes.scale = new Float32Array(this.count * 1);

		for (let i = 0; i < this.count; i++) {
			this.attributes.position[i * 3 + 0] = MathUtils.randFloatSpread(
				this.params.halfBoxSize * 2,
			);
			this.attributes.position[i * 3 + 2] = MathUtils.randFloatSpread(
				this.params.halfBoxSize * 2,
			);

			const random = MathUtils.randFloat(1, 3);
			this.attributes.scale[i * 3 + 0] = random;
			this.attributes.scale[i * 3 + 1] = random;
			this.attributes.scale[i * 3 + 2] = random;
		}
	}

	setGeometry() {
		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = this.triangle.index;
		this.base.geometry.attributes.position = this.triangle.attributes.position;
		this.base.geometry.attributes.normal = this.triangle.attributes.normal;
		this.base.geometry.attributes.uv = this.triangle.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(this.attributes.position, 3, false),
		);
		this.base.geometry.setAttribute(
			'aScale',
			new InstancedBufferAttribute(this.attributes.scale, 3, false),
		);
	}

	updateAttributes() {
		const particlesCount = this.count;

		this.attributes.newPosition = new Float32Array(particlesCount * 3);
		this.attributes.newScale = new Float32Array(particlesCount * 1);

		for (let i = 0; i < particlesCount; i++) {
			this.attributes.newPosition[i * 3 + 1] = this.attributes.position[i * 3 + 1];
			this.attributes.newPosition[i * 3 + 0] = this.attributes.position[i * 3 + 0];
			this.attributes.newPosition[i * 3 + 2] = this.attributes.position[i * 3 + 2];

			this.attributes.newScale[i + 0] = this.attributes.scale[i + 0];
		}

		this.updateGeometry();
	}

	updateGeometry() {
		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = this.triangle.index;
		this.base.geometry.attributes.position = this.triangle.attributes.position;
		this.base.geometry.attributes.normal = this.triangle.attributes.normal;
		this.base.geometry.attributes.uv = this.triangle.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(this.attributes.newPosition, 3, false),
		);
		this.base.geometry.setAttribute(
			'aScale',
			new InstancedBufferAttribute(this.attributes.newScale, 1, false),
		);

		this.base.mesh.geometry = this.base.geometry;
	}

	setMaterial() {
		this.base.material = new GrassMaterial({
			uniforms: {
				uDisplacement: { value: this.params.displacement },
				uWindColorIntensity: { value: this.params.windColorIntensity },
				uMaskRange: { value: this.params.maskRange },
				uNoiseMouvementIntensity: { value: this.params.noiseMouvementIntensity },
				uNoiseElevationIntensity: { value: this.params.noiseElevationIntensity },
				uHalfBoxSize: { value: this.params.halfBoxSize },
				uCharaPos: { value: this.scene.player.base.mesh.position },
				uColor: { value: new Color().set(this.params.color) },
				uColor2: { value: new Color().set(this.params.color2) },
				uElevationTexture: { value: this.scene.depthTexture },
				uGrassTexture: { value: this.params.positionsTexture },
				uMaxMapBounds: { value: this.scene.maxBox },
				uMinMapBounds: { value: this.scene.minBox },
			},
		});
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.instance.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;
		this.base.mesh.position.y = -0.2;
	}

	/// #if DEBUG
	devtools() {
		const gui = debug.instance.addFolder({ title: debug.label });

		gui.addInput(this.base.mesh.material.uniforms.uDisplacement, 'value', {
			label: 'displace',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addInput(this.base.mesh.material.uniforms.uWindColorIntensity, 'value', {
			label: 'windColorI',
			min: 0,
			max: 0.5,
			step: 0.01,
		});

		gui.addInput(this.base.mesh.material.uniforms.uNoiseMouvementIntensity, 'value', {
			label: 'nMouvementI',
			min: 0,
			max: 0.5,
			step: 0.01,
		});
		gui.addInput(this.base.mesh.material.uniforms.uNoiseElevationIntensity, 'value', {
			label: 'nElevationI',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addInput(this.params, 'halfBoxSize', {
			label: 'boxSize',
			min: 1,
			max: 100,
			step: 0.01,
		}).on('change', (size) => {
			if (!size.last) return;
			for (let i = 0; i < this.count; i++) {
				this.attributes.position[i * 3 + 0] = MathUtils.randFloatSpread(
					this.params.halfBoxSize * 2,
				);
				this.attributes.position[i * 3 + 2] = MathUtils.randFloatSpread(
					this.params.halfBoxSize * 2,
				);
			}
			this.base.material.uniforms.uHalfBoxSize.value = size.value;
			this.base.geometry.setAttribute(
				'aPositions',
				new InstancedBufferAttribute(this.attributes.position, 3, false),
			);
		});
		gui.addInput(this.base.material.uniforms.uMaskRange, 'value', {
			label: 'maskRange',
			min: 0,
			max: 0.5,
			step: 0.01,
		});

		gui.addInput(this.params, 'color').on('change', (color) => {
			this.base.material.uniforms.uColor.value.set(color.value);
		});
		gui.addInput(this.params, 'color2').on('change', (color) => {
			this.base.material.uniforms.uColor2.value.set(color.value);
		});
	}
	/// #endif
}
