import { BaseShaderMaterial } from '../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export default class extends BaseShaderMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
