import { getDom } from './Dom';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { getWebgl } from '@webgl/Webgl';

let dom;
let webgl;

let alreadyInitialized = false;

export class Home {
	constructor() {
		dom = getDom();

		this.setup();
	}

	setup() {
		signal.on('context:complete', () => this.start());
		signal.on('pause:back', () => this.start());
	}

	start() {
		webgl = getWebgl();

		signal.emit('view:change', 'home');
		signal.emit('sound: down', store.game.currentScene);

		webgl.world.homeCamera.reset();
		signal.emit('camera:switch', 'home');

		this.show(dom.nodes.domElements.home_container);

		this.events();

		alreadyInitialized = true;
	}

	events() {
		if (alreadyInitialized) return;

		dom.nodes.domElements.button_start.addEventListener('click', (e) => {
			dom.nodes.domElements.button_start.blur();

			webgl.world.homeCamera.start();

			store.game.isPaused = false;
			store.game.player.canMove = store.game.player.canInteract = true;
			this.hide(dom.nodes.domElements.home_container);
			signal.emit('home:quit');

			signal.emit('dialog:open', { scene: store.game.currentScene, sequence: 'intro' });
		});

		dom.nodes.domElements.button_quit.addEventListener('click', (e) => {
			dom.nodes.domElements.button_quit.blur();

			console.log('bye');
			webgl.destroy();
		});
	}

	show(node) {
		node.classList.add('visible');
	}

	hide(node) {
		node.classList.remove('visible');
	}
}
