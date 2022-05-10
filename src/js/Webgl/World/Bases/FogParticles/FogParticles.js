/// #if DEBUG
const debug = {
	instance: null,
	label: 'Particles',
};
/// #endif

import {
	BufferAttribute,
	Color,
	DoubleSide,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	MathUtils,
	Mesh,
	PlaneBufferGeometry,
} from 'three';

import { getWebgl } from '@webgl/Webgl';

import FogParticlesMaterial from '@webgl/Materials/FogParticles/FogParticlesMaterial';

export default class FogParticles {
	constructor({ scene, params }) {
		this.scene = scene;

		this.params = params;

		const webgl = getWebgl();
		this.renderer = webgl.renderer.renderer;

		this.geometry = null;
		this.base = {
			geometry: null,
			material: null,
		};

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.initialized = false;

		this.init();
	}

	init() {
		this.setDefaultGeometry();
		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		/// #if DEBUG
		// this.debug();
		/// #endif

		this.initialized = true;
	}

	setDefaultGeometry() {
		this.geometry = new PlaneBufferGeometry();

		this.geometry.setIndex(new BufferAttribute(this.geometry.index.array, 1));
		this.geometry.setAttribute(
			'position',
			new BufferAttribute(this.geometry.attributes.position.array, 3),
		);
		this.geometry.setAttribute(
			'normal',
			new BufferAttribute(this.geometry.attributes.normal.array, 3),
		);
		this.geometry.setAttribute('uv', new BufferAttribute(this.geometry.attributes.uv.array, 2));
	}

	setGeometry() {
		const positions = new Float32Array(this.params.count * 3);
		const scale = new Float32Array(this.params.count * 1);
		const offset = new Float32Array(this.params.count * 1);

		for (let i = 0; i < this.params.count; i++) {
			positions[i * 3 + 0] = MathUtils.randFloatSpread(this.params.halfBoxSize * 2);
			positions[i * 3 + 1] = MathUtils.randFloatSpread(this.params.halfBoxSize * 2);
			positions[i * 3 + 2] = MathUtils.randFloatSpread(this.params.halfBoxSize * 2);

			scale[i] = MathUtils.randFloat(1, 2);
			offset[i] = MathUtils.randFloat(0, 10);
		}

		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = this.geometry.index;
		this.base.geometry.attributes.position = this.geometry.attributes.position;
		this.base.geometry.attributes.normal = this.geometry.attributes.normal;
		this.base.geometry.attributes.uv = this.geometry.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(positions, 3, false),
		);
		this.base.geometry.setAttribute('aScale', new InstancedBufferAttribute(scale, 1, false));
		this.base.geometry.setAttribute('aOffset', new InstancedBufferAttribute(offset, 1, false));
	}

	async setMaterial() {
		this.base.material = new FogParticlesMaterial({
			side: DoubleSide,
			transparent: true,
			depthWrite: false,
			uniforms: {
				uHalfBoxSize: { value: this.params.halfBoxSize },
				uCharaPos: { value: this.scene.player.base.mesh.position },
				uElevationTexture: { value: this.scene.depthTexture },
				uPositionTexture: { value: this.params.positionsTexture },
				uMaxMapBounds: { value: this.scene.maxBox },
				uMinMapBounds: { value: this.scene.minBox },
				uColor: { value: new Color().set(this.params.color) },
				uColor2: { value: new Color().set(this.params.color2) },
			},
		});
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.instance.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;
	}

	/// #if DEBUG
	debug() {
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
			for (let i = 0; i < this.params.count; i++) {
				this.base.positions[i * 3 + 0] = MathUtils.randFloatSpread(
					this.params.halfBoxSize * 2,
				);
				this.base.positions[i * 3 + 2] = MathUtils.randFloatSpread(
					this.params.halfBoxSize * 2,
				);
			}
			this.base.material.uniforms.uHalfBoxSize.value = size.value;
			this.base.geometry.setAttribute(
				'aPositions',
				new InstancedBufferAttribute(this.base.positions, 3, false),
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
