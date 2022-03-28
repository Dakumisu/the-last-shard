import { getWebgl } from '@webgl/Webgl';
import baseUniforms from '@webgl/Materials/baseUniforms';
import { Color, Fog, ShaderChunk } from 'three';
import fogFrag from './shaders/fogFrag.glsl';
import fogParsFrag from './shaders/fogParsFrag.glsl';
import fogParsVert from './shaders/fogParsVert.glsl';
import fogVert from './shaders/fogVert.glsl';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Fog',
};
/// #endif

export default class BaseFog {
	constructor({
		fogNearColor,
		fogFarColor,
		fogNear,
		fogFar,
		fogNoiseSpeed,
		fogNoiseFreq,
		fogNoiseImpact,
		background,
		/// #if DEBUG
		gui,
		/// #endif
	}) {
		this.webgl = getWebgl();
		this.scene = this.webgl.mainScene.instance;

		this.params = {
			fogNearColor,
			fogFarColor,
			fogNear,
			fogFar,
			fogNoiseSpeed,
			fogNoiseFreq,
			fogNoiseImpact,
			background,
		};

		/// #if DEBUG
		debug.instance = gui;
		this.setDebug();
		/// #endif
	}

	set() {
		baseUniforms.uFogNearColor.value = new Color(this.params.fogNearColor);
		baseUniforms.uFogNoiseFreq.value = this.params.fogNoiseFreq;
		baseUniforms.uFogNoiseSpeed.value = this.params.fogNoiseSpeed;
		baseUniforms.uFogNoiseImpact.value = this.params.fogNoiseImpact;

		ShaderChunk.fog_pars_vertex = fogParsVert;
		ShaderChunk.fog_vertex = fogVert;
		ShaderChunk.fog_pars_fragment = fogParsFrag;
		ShaderChunk.fog_fragment = fogFrag;

		const fog = new Fog(this.params.fogFarColor, this.params.fogNear, this.params.fogFar);
		this.scene.fog = fog;
		this.scene.background = this.params.background;
	}

	/// #if DEBUG
	setDebug() {
		const gui = debug.instance.addFolder({ title: debug.label, expanded: true });

		gui.addInput(this.params, 'fogFarColor', { label: 'farColor', view: 'color' }).on(
			'change',
			(fogFarColor) => {
				this.scene.fog.color.set(fogFarColor.value);
			},
		);
		gui.addInput(this.params, 'fogNearColor', {
			label: 'nearColor',
			view: 'color',
		}).on('change', (fogNearColor) => {
			baseUniforms.uFogNearColor.value.set(fogNearColor.value);
		});
		gui.addInput(this.params, 'fogFar', {
			label: 'farRange',
			min: 20,
			max: 150,
			step: 0.01,
		}).on('change', (fogFar) => {
			this.scene.fog.far = fogFar.value;
		});
		gui.addInput(this.params, 'fogNear', {
			label: 'nearRange',
			min: 0,
			max: 50,
			step: 0.01,
		}).on('change', (fogNear) => {
			this.scene.fog.near = fogNear.value;
		});
		gui.addInput(baseUniforms.uFogNoiseSpeed, 'value', {
			label: 'speed',
			min: 0,
			max: 0.02,
			step: 0.001,
		}).on('change', (speed) => {
			baseUniforms.uFogNoiseSpeed.value = speed.value;
		});
		gui.addInput(baseUniforms.uFogNoiseFreq, 'value', {
			label: 'frequency',
			min: 0,
			max: 2,
			step: 0.001,
		}).on('change', (freq) => {
			baseUniforms.uFogNoiseFreq.value = freq.value;
		});
		gui.addInput(baseUniforms.uFogNoiseImpact, 'value', {
			label: 'impact',
			min: 0,
			max: 1,
			step: 0.001,
		}).on('change', (imp) => {
			baseUniforms.uFogNoiseImpact.value = imp.value;
		});
	}
	/// #endif
}
