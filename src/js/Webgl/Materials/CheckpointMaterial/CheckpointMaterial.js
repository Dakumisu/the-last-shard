import { Color } from 'three';
import { BaseShaderMaterial } from '../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export default class CheckpointMaterial extends BaseShaderMaterial {
	constructor() {
		super({
			uniforms: {
				uColor1: { value: new Color(0x000000) },
				uColor2: { value: new Color(0xffffff) },
				uTransition: { value: 0 },
			},
			transparent: true,
		});
		hotShaders.use(this);
	}
}
