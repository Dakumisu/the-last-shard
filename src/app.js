import Dom from '@dom/Dom';
import { getGame } from '@game/Game';
import '@scss/main.scss';
import { getWebgl } from '@webgl/Webgl';

const dom = new Dom();

dom.nodes.on('load', () => {
	const webgl = getWebgl(dom.nodes.domElements.canvas);
	const game = getGame();
});

/// #if DEBUG
console.log('debug mode 🔥');
/// #endif
