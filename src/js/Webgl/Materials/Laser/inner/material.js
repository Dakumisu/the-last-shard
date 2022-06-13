import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { BaseShaderMaterial } from '../../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export class LaserMaterialInner extends BaseBasicMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
