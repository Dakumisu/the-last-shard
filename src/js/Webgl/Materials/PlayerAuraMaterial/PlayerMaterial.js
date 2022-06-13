import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { BaseBasicMaterial } from '../BaseMaterials/basic/material';
import { BaseStandardMaterial } from '../BaseMaterials/standard/material';
import hotShaders from './hotShaders';

export default class extends BaseBasicMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
