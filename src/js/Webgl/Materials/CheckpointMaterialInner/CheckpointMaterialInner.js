import { Color } from 'three';
import { BaseBasicMaterial } from '../BaseMaterials/basic/material';
import { BaseShaderMaterial } from '../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export default class CheckpointMaterialInner extends BaseBasicMaterial {
	constructor(params) {
		super(params);
		hotShaders.use(this);
	}
}
