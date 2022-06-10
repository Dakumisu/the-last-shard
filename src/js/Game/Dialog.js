import signal from 'philbin-packages/signal';
import { wait, throttle } from 'philbin-packages/async';

import dialog from '@json/dialog.json?json';
import { store } from '@tools/Store';
import { getGame } from './Game';

let pool = [];
let length = 0;
let index = 0;

let dialogSet = false;

let dummyKeyboard = {
	escape: false,
	shift: false,
	space: false,
};

export default class Dialog {
	constructor() {
		const game = getGame();
		this.keyPressed = game.control.keyPressed;

		this.dialog = dialog;

		this.listeners();
	}

	listeners() {
		signal.on('dialog:open', this.open.bind(this));
		signal.on('dialog:next', this.nextLine);
	}

	async open({ scene = '', sequence = '' }) {
		const dialog = this.dialog[scene][sequence];
		console.log('[DIALOG]', dialog);

		dialogSet = false;

		if (!dialog) return;

		signal.emit('postpro:transition-in', 500);
		await wait(500);
		// signal.emit('camera:switch', 'dialog');
		signal.emit('postpro:transition-out');

		store.game.player.canMove = false;

		const dialogPool = [];
		dialog.forEach((line) => {
			dialogPool.push(line);
		});

		pool = dialogPool;
		length = pool.length;
		index = 0;

		dialogSet = true;

		this.nextLine();
	}

	nextLine = throttle(() => {
		console.log('[DIALOG] nextline');
		if (index >= length) {
			this.close();

			return;
		}

		this.speak({ line: pool[index] });
		index++;

		return this;
	}, 500);

	speak({ line = '' }) {
		console.log('[line]', line);
	}

	async close() {
		dialogSet = false;
		signal.emit('dialog:complete');

		signal.emit('postpro:transition-in', 500);
		await wait(500);
		store.game.player.canMove = true;
		// signal.emit('camera:switch', 'player');
		signal.emit('postpro:transition-out');

		console.log('[DIALOG] close');
	}

	update() {
		if (!dialogSet) return;

		if (dummyKeyboard.space !== this.keyPressed.space) {
			dummyKeyboard.space = this.keyPressed.space;

			if (this.keyPressed.space) {
				this.nextLine();
			}
		}
		if (this.keyPressed.escape) this.close();
	}
}
