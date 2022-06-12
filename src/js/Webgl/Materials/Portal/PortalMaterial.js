import { Color, DoubleSide } from 'three';
import { BaseBasicMaterial } from '../BaseMaterials/basic/material';
import { BaseShaderMaterial } from '../BaseMaterials/shader/material';
import hotShaders from './hotShaders';

export default class PortalMaterial extends BaseShaderMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
