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
		fogHeightPropagation,
		fogHeightDensity,
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
			fogHeightPropagation,
			fogHeightDensity,
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
		baseUniforms.uFogFarColor.value = new Color(this.params.fogFarColor);
		baseUniforms.uFogNear.value = this.params.fogNear;
		baseUniforms.uFogFar.value = this.params.fogFar;
		baseUniforms.uFogNoiseFreq.value = this.params.fogNoiseFreq;
		baseUniforms.uFogNoiseSpeed.value = this.params.fogNoiseSpeed;
		baseUniforms.uFogHeightPropagation.value = this.params.fogHeightPropagation;
		baseUniforms.uFogHeightDensity.value = this.params.fogHeightDensity;

		// const fog = new Fog(this.params.fogFarColor, this.params.fogNear, this.params.fogFar);
		const fog = new FogExp2(this.params.fogNearColor, 0);
		this.scene.fog = fog;

		this.scene.background = this.params.background;

		/// #if DEBUG
		// this.devtools();
		/// #endif
	}

	/// #if DEBUG
	devtools() {
		debug.instance.setFolder(debug.label, debug.tab, true);
		const gui = debug.instance.getFolder(debug.label);
		if (debug.folder) debug.folder.dispose();

		debug.folder = gui;

		gui.addInput(baseUniforms.uFogNearColor, 'value', {
			label: 'nearColor',
			view: 'color-2',
		});
		gui.addInput(baseUniforms.uFogFarColor, 'value', {
			label: 'farColor',
			view: 'color-2',
		});

		gui.addInput(baseUniforms.uFogNear, 'value', {
			label: 'nearRange',
			min: 0,
			max: 150,
			step: 0.01,
		});
		gui.addInput(baseUniforms.uFogFar, 'value', {
			label: 'farRange',
			min: 0,
			max: 50,
			step: 0.01,
		});

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
		gui.addInput(baseUniforms.uFogHeightPropagation, 'value', {
			label: 'height',
			min: 0,
			max: 10,
			step: 0.001,
		});
		gui.addInput(baseUniforms.uFogHeightDensity, 'value', {
			label: 'density',
			min: 0,
			max: 2,
			step: 0.001,
		});
	}
	/// #endif
}
