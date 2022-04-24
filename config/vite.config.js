import { defineConfig } from 'vite';
import glslify from 'vite-plugin-glslify';
import handlebars from 'vite-plugin-handlebars';
import ifdefRollupPlugin from './ifdef/ifdefRollupPlugin';

import content from '../src/json/content.json';

export default ({ mode }) => {
	process.stdout.write('\x1b[2mv' + process.env.npm_package_version + '\x1b[22m\n');
	process.stdout.write(
		'\x1b[93m\x1b[1m🍜 Beesly \x1b[22m\x1b[39m' + 'is cooking your code... \n',
	);
	process.stdout.write('\n✨ Project : ' + process.env.npm_package_name);
	process.stdout.write('\n🏓 Environnement : ' + mode + '\n\n');

	const debug = mode ? mode != 'production' : true;
	const define = {
		DEBUG: debug,
	};

	return defineConfig({
		server: {
			port: '8080',
			https: true,
			open: false,
			host: true,
			hmr: { port: 8080 },
		},

		plugins: [
			glslify(),
			ifdefRollupPlugin(define),
			handlebars({
				reloadOnPartialChange: false,
				context: content,
			}),
		],

		assetsInclude: ['**/*.glb', '**/*.gltf'],

		resolve: {
			alias: [
				{
					find: '@game',
					replacement: '/src/js/Game',
				},
				{
					find: '@webgl',
					replacement: '/src/js/Webgl',
				},
				{
					find: '@dom',
					replacement: '/src/js/Dom',
				},
				{
					find: '@tools',
					replacement: '/src/js/Tools',
				},

				{
					find: '@js',
					replacement: '/src/js',
				},
				{
					find: '@json',
					replacement: '/src/json',
				},
				{
					find: '@scss',
					replacement: '/src/scss',
				},
				{
					find: '@utils',
					replacement: '/src/utils',
				},
				{
					find: '@workers',
					replacement: '/src/workers',
				},
				{
					find: '@src',
					replacement: '/src',
				},
				{
					find: '@@',
					replacement: '/*',
				},
			],
			extensions: ['.cjs', '.mjs', '.js', '.ts', '.json'],
		},

		preprocessorOptions: {
			scss: {
				sassOptions: {
					outputStyle: 'compressed',
				},
			},
		},
	});
};
