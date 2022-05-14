import { BaseBasicMaterial } from '../BaseMaterials/basic/material';
import { BaseShaderMaterial } from '../BaseMaterials/shader/material';
import { BaseToonMaterial } from '../BaseMaterials/toon/material';
import hotShaders from './hotShaders';

export default class extends BaseToonMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
