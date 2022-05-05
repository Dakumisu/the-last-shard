import { BaseShaderMaterial } from '../../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export class LaserMaterialInner extends BaseShaderMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
