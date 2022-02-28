import CtaButton from './Components/button/CtaButton';
import AnchorLink from './Components/link/AnchorLink';

import Nodes from './Nodes';
import Views from './Views';

let initialized = false;

export default class Dom {
	static instance;

	constructor() {
		if (Dom.instance) {
			return Dom.instance;
		}
		Dom.instance = this;

		this.pages = {};

		this.init();
	}

	init() {
		this.nodes = new Nodes();
		this.views = new Views();
	}

	event() {
		if (!initialized) return;
	}
}
