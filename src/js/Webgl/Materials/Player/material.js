import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import hotShaders from './hotShaders';

export class PlayerMaterial extends BaseToonMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
