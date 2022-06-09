import { Color } from 'three';
import { BaseBasicMaterial } from '../BaseMaterials/basic/material';
import hotShaders from './hotShaders';

let singleton;
export default class PortalMaterial extends BaseBasicMaterial {
	constructor() {
		super({
			uniforms: {
				uColor: { value: new Color(0xffffff) },
				uColor2: { value: new Color(0xff0000) },
			},
		});

		hotShaders.use(this);
	}
}

PortalMaterial.use = () => {
	return singleton || (singleton = new PortalMaterial());
};
