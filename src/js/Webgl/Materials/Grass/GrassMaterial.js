import { BaseBasicMaterial } from '../BaseMaterials/basic/material';
import hotShaders from './hotShaders';

export default class extends BaseBasicMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
