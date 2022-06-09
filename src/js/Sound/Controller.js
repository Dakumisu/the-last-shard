import { loadAudio } from '@utils/loaders';
import { Howl } from 'howler';
import { wait } from 'philbin-packages/async';
import signal from 'philbin-packages/signal';

export class SoundController {
	constructor() {
		/**
		 * @type {Object.<string, {howl: Howl, params: Object}>}
		 */
		this.sounds = {};

		signal.on('sound:play', this.play);
		signal.on('sound:stop', this.pause);

		this.init();
	}

	async init() {
		await Promise.all([this.add('laser', { loop: true, fadeDuration: 500 })]);
		await Promise.all([this.add('footsteps', { loop: true, fadeDuration: 50, rate: 1.5 })]);
	}

	async add(key, params) {
		this.sounds[key] = {
			howl: new Howl({
				src: [await loadAudio(key + '-sound')],
				format: ['mp3'],
				loop: params.loop,
				rate: params.rate,
			}),
			params,
		};

		console.log(this.sounds[key]);
		this.sounds[key];
	}

	remove(key) {}

	play = (key, params) => {
		const sound = this.sounds[key];
		sound.howl.rate(Math.max(params?.rate, sound.params.rate));

		if (sound.howl.playing()) return;

		sound.howl.fade(sound.howl.volume(), 1, sound.params.fadeDuration).play();
	};

	pause = async (key) => {
		const sound = this.sounds[key];
		if (!sound.howl.playing()) return;

		sound.howl.fade(sound.howl.volume(), 0, sound.params.fadeDuration);
		await wait(sound.params.fadeDuration);
		sound.howl.pause();
	};

	destroy() {
		signal.off('sound:play', this.play);
		signal.off('sound:stop', this.pause);
	}
}
