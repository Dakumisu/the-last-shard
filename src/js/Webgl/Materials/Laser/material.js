import { BaseShaderMaterial } from '../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export class LaserMaterial extends BaseShaderMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
