import Emitter from '@tools/Emitter';

export default class Keyboard extends Emitter {
	constructor() {
		super();

		document.addEventListener('keydown', this.getKeyDown.bind(this));
		document.addEventListener('keyup', this.getKeyUp.bind(this));
	}

	getKeyDown(e) {
		const key = (e.key != ' ' ? e.key : e.code).toUpperCase();

		this.emit('keydown', [key]);
	}

	getKeyUp(e) {
		const key = (e.key != ' ' ? e.key : e.code).toUpperCase();

		this.emit('keyup', [key]);
	}

	destroy() {
		this.off('keydown');
		this.off('keyup');
		document.removeEventListener('keydown', this.getKeyDown.bind(this));
		document.removeEventListener('keyup', this.getKeyUp.bind(this));
	}
}
