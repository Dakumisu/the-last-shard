import { Color, DoubleSide } from 'three';
import { BaseBasicMaterial } from '../BaseMaterials/basic/material';
import hotShaders from './hotShaders';

export default class PortalMaterial extends BaseBasicMaterial {
	constructor(parameters) {
		super(parameters);
		hotShaders.use(this);
	}
}
