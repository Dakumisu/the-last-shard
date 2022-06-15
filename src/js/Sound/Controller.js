import { loadAudio } from '@utils/loaders';
import { getPlayer } from '@webgl/World/Characters/Player';
import { Howl, Howler } from 'howler';
import { debounce, deferredPromise, throttle, wait } from 'philbin-packages/async';
import signal from 'philbin-packages/signal';

const params = {
	ambiantVolume: 0.3,
	// ambiantVolume: 0,
};

export default class SoundController {
	constructor() {
		Howler.volume(0.7);
		/**
		 * @type {Object.<string, {howl: Howl, params: Object}>}
		 */
		this.sounds = {};
		/**
		 * @type {Object.<string, Howl>}
		 */
		this.ambients = {};
		this.currentAmbient = null;

		this.player = getPlayer();

		signal.on('sound:play', this.play);
		signal.on('sound:stop', this.pause);
		signal.on('sound:setParams', this.setParams);
		signal.on('sound:beforeSwitch', this.beforeSwitch);
		signal.on('sound:afterSwitch', this.afterSwitch);
		signal.on('sound:down', this.soundDown);
		signal.on('sound:up', this.soundUp);
	}

	async init() {
		await Promise.all([
			this.add('laser', { loop: true, fadeDuration: 500 }),
			this.add('laser-rotate'),
			this.add('laser-activate'),
			this.add('laser-desactivate'),
			this.add('checkpoint'),
			this.add('timer', { loop: true }),
			this.add('footsteps-grass', { loop: true }),
			this.add('footsteps-ground', { loop: true }),
			this.add('fall-grass'),
			this.add('fall-ground'),
			this.add('pet-tp'),
			this.add('pet-happy', {
				sprite: {
					0: [0, 1171],
					1: [1171, 1012],
					2: [2183, 1449],
					3: [3632, 1484],
					4: [5116, 1417],
				},
			}),
			this.add('pet-ideas'),
			this.add('success'),
			this.add('fragment-interact'),
			this.add('cinematrix-1', {
				fadeDuration: 500,
			}),
		]);

		// this.play('footsteps-grass', { volume: 0 });
		// this.play('footsteps-ground', { volume: 0 });
	}

	async add(key, params = {}) {
		this.sounds[key] = {
			howl: new Howl({
				src: [await loadAudio(key + '-sound')],
				format: ['mp3'],
				loop: params.loop,
				rate: params.rate,
				volume: params.volume,
				sprite: params.sprite ? params.sprite : undefined,
			}),
			params,
		};
	}

	async addAmbient(sceneName) {
		this.ambients[sceneName] = new Howl({
			src: [await loadAudio('Scene_' + sceneName + '-sound')],
			format: ['mp3'],
			loop: true,
			volume: params.ambiantVolume,
		});
	}

	play = (key, params = {}) => {
		const sound = this.sounds[key];

		if (!sound) return;

		const pos = params.pos || sound.params.pos;
		if (pos) sound.howl.pos(pos.x, pos.y, pos.z);

		if (params.rate) sound.howl.rate(params.rate || 1);

		if (!params.replay && sound.howl.playing()) return;

		sound.howl.volume(params.volume || sound.params.volume || 1);

		if (sound.params.fadeDuration)
			sound.howl.fade(sound.howl.volume(), 1, sound.params.fadeDuration);

		if (params.spriteId >= 0) sound.howl.play(params.spriteId + '');
		else sound.howl.play();
	};

	pause = (key) => {
		const sound = this.sounds[key];
		if (!sound || !sound.howl.playing()) return;

		if (sound.params.fadeDuration)
			sound.howl
				.fade(sound.howl.volume(), 0, sound.params.fadeDuration)
				.once('fade', () => this.sounds[key].howl.stop());
		else sound.howl.stop();
	};

	setParams = (key, params) => {
		const sound = this.sounds[key];
		if (!sound) return;

		if (params.volume) sound.howl.volume(params.volume);
		if (params.rate) sound.howl.rate(params.rate);
	};

	beforeSwitch = (sceneName) => {
		for (const key in this.sounds)
			this.sounds[key].howl
				.fade(this.sounds[key].howl.volume(), 0, 500)
				.once('fade', () => this.sounds[key].howl.stop());

		this.fadeOutAmbient(sceneName);
	};

	soundDown = (sceneName) => {
		for (const key in this.sounds)
			this.sounds[key].howl.fade(this.sounds[key].howl.volume(), 0.4, 500);

		this.ambients[sceneName].fade(params.ambiantVolume, params.ambiantVolume - 0.15, 500);
	};

	soundUp = (sceneName) => {
		for (const key in this.sounds)
			this.sounds[key].howl.fade(this.sounds[key].howl.volume(), 1, 500);

		this.ambients[sceneName].fade(params.ambiantVolume, params.ambiantVolume, 500);
	};

	afterSwitch = (sceneName) => {
		this.fadeInAmbient(sceneName);
		this.currentAmbient = sceneName;
	};

	fadeOutAmbient(sceneName) {
		this.ambients[sceneName]
			.fade(params.ambiantVolume, 0, 500)
			.once('fade', () => this.ambients[sceneName].stop());
	}

	fadeInAmbient(sceneName) {
		this.ambients[sceneName].fade(0, params.ambiantVolume, 500).play();
	}

	update() {
		if (this.player?.base.mesh.position) {
			Howler.pos(
				this.player.base.mesh.position.x,
				this.player.base.mesh.position.y,
				this.player.base.mesh.position.z,
			);
			Howler.orientation(
				this.player.base.mesh.rotation.x,
				this.player.base.mesh.rotation.y,
				this.player.base.mesh.rotation.z,
			);
		}
	}

	destroy() {
		signal.off('sound:play', this.play);
		signal.off('sound:stop', this.pause);
		signal.off('sound:setParams', this.setParams);
		signal.off('sound:beforeSwitch', this.beforeSwitch);
		signal.off('sound:afterSwitch', this.afterSwitch);
	}
}
