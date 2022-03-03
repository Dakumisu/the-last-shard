import '@scss/main.scss';

import Dom from '@dom/Dom';
import { getWebgl } from '@webgl/Webgl';
import { getGame } from '@game/Game';

const dom = new Dom();

dom.nodes.on('load', () => {
	const webgl = getWebgl(dom.nodes.domElements.canvas);
	const game = getGame();
});

/// #if DEBUG
console.log('debug mode 🔥');
/// #endif
