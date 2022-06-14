import { Color } from 'three';
import { BaseShaderMaterial } from '../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export default class LaserSphereMaterial extends BaseShaderMaterial {
	constructor(params) {
		super(params);
		hotShaders.use(this);
	}
}
