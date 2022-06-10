import { getWebgl } from '@webgl/Webgl';
import baseUniforms from '@webgl/Materials/baseUniforms';
import { Color, Fog, FogExp2, ShaderChunk } from 'three';
import fogFrag from './shaders/fogFrag.glsl';
import fogParsFrag from './shaders/fogParsFrag.glsl';
import fogParsVert from './shaders/fogParsVert.glsl';
import fogVert from './shaders/fogVert.glsl';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Fog',
	tab: 'Env',
	folder: null,
};
/// #endif

// Edit fog chunks one time
ShaderChunk.fog_pars_vertex = fogParsVert;
ShaderChunk.fog_vertex = fogVert;
ShaderChunk.fog_pars_fragment = fogParsFrag;
ShaderChunk.fog_fragment = fogFrag;

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
		if (!debug.instance) {
			debug.instance = this.webgl.debug;
		}
		/// #endif
	}

	set() {
		baseUniforms.uFogNearColor.value = new Color(this.params.fogNearColor);
		baseUniforms.uFogNoiseFreq.value = this.params.fogNoiseFreq;
		baseUniforms.uFogNoiseSpeed.value = this.params.fogNoiseSpeed;
		baseUniforms.uFogNoiseImpact.value = this.params.fogNoiseImpact;

		// const fog = new Fog(this.params.fogFarColor, this.params.fogNear, this.params.fogFar);
		const fog = new FogExp2(this.params.fogNearColor, 0);
		this.scene.fog = fog;

		this.scene.background = this.params.background;

		/// #if DEBUG
		// this.setdevtool();
		/// #endif
	}

	/// #if DEBUG
	setdevtool() {
		debug.instance.setFolder(debug.label, debug.tab, true);
		const gui = debug.instance.getFolder(debug.label);
		if (debug.folder) debug.folder.dispose();

		debug.folder = gui;

		gui.addInput(this.scene.fog, 'color', { label: 'farColor', view: 'color-2' });

		gui.addInput(baseUniforms.uFogNearColor, 'value', {
			label: 'nearColor',
			view: 'color-2',
		});

		// gui.addInput(this.scene.fog, 'far', {
		// 	label: 'farRange',
		// 	min: 0,
		// 	max: 150,
		// 	step: 0.01,
		// });

		// gui.addInput(this.scene.fog, 'near', {
		// 	label: 'nearRange',
		// 	min: 0,
		// 	max: 50,
		// 	step: 0.01,
		// });

		gui.addInput(baseUniforms.uFogNoiseSpeed, 'value', {
			label: 'speed',
			min: 0,
			max: 0.02,
			step: 0.001,
		});

		gui.addInput(baseUniforms.uFogNoiseFreq, 'value', {
			label: 'frequency',
			min: 0,
			max: 2,
			step: 0.001,
		});

		gui.addInput(baseUniforms.uFogNoiseImpact, 'value', {
			label: 'impact',
			min: 0,
			max: 1,
			step: 0.001,
		});
	}
	/// #endif
}
