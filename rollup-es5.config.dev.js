/*
  Make sure the required packages are installed before running this script.

  npm i @babel/core --save-dev
  npm i @babel/preset-env --save-dev
  npm i core-js --save-dev
  npm i @rollup/plugin-babel --save-dev
  npm i @rollup/plugin-commonjs --save-dev

  Then, run the command below.

  npx rollup -c rollup.config.dev.js
  
 */

import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import fs from "fs";

const babelPresets = [
	[
		"@babel/preset-env",
		{
			corejs: 3,
			modules: false,
			useBuiltIns: "usage",
			targets: {
				chrome: "58"
			}
		}
	]
];

const bundledPlugins = [
	commonjs(),
	resolve(),
	babel({
		babelHelpers: "bundled",
		babelrc: false,
		exclude: "node_modules/**",
		presets: babelPresets,
		compact: false
	})
];

const inlinePlugins = [
	commonjs(),
	resolve(),
	babel({
		babelHelpers: "inline",
		babelrc: false,
		exclude: "node_modules/**",
		presets: babelPresets,
		compact: false
	}),
	replace({
		preventAssignment: true,
		"`": () => "'"
	})
];

const GLOBALS = "const { Array, Object, String, Number, BigInt, Math, Date, Map, Set, Response, URL, Error, Uint8Array, Uint16Array, Uint32Array, DataView, Blob, Promise, TextEncoder, TextDecoder, document, crypto, btoa, TransformStream, ReadableStream, WritableStream, CompressionStream, DecompressionStream, navigator, Worker } = typeof globalThis !== 'undefined' ? globalThis : this || self;";
const GLOBALS_WORKER = "const { Array, Object, Number, Math, Error, Uint8Array, Uint16Array, Uint32Array, Int32Array, Map, DataView, Promise, TextEncoder, crypto, postMessage, TransformStream, ReadableStream, WritableStream, CompressionStream, DecompressionStream } = self;";

export default [{
	input: "lib/z-worker.js",
	output: [{
		intro: GLOBALS_WORKER,
		file: "lib/z-worker-inline.js",
		format: "es"
	}],
	plugins: [
		inlinePlugins
	]
}, {
	input: "lib/z-worker-inline-template.js",
	output: [{
		file: "lib/z-worker-inline.js",
		format: "es"
	}],
	plugins: [
		replace({
			preventAssignment: true,
			"__workerCode__": () => fs.readFileSync("lib/z-worker-inline.js").toString()
		})
	]
}, {
	input: ["lib/zip.js"],
	output: [{
		intro: GLOBALS,
		file: "dist/zip.min.js",
		format: "umd",
		name: "zip"
	}, {
		intro: GLOBALS,
		file: "dist/zip.js",
		format: "umd",
		name: "zip"
	}],
	plugins: bundledPlugins
}, {
	input: ["lib/zip-full.js"],
	output: [{
		intro: GLOBALS,
		file: "dist/zip-full.min.js",
		format: "umd",
		name: "zip"
	}, {
		intro: GLOBALS,
		file: "dist/zip-full.js",
		format: "umd",
		name: "zip"
	}],
	plugins: bundledPlugins
}, {
	input: "lib/zip-no-worker.js",
	output: [{
		intro: GLOBALS,
		file: "dist/zip-no-worker.min.js",
		format: "umd",
		name: "zip"
	}],
	plugins: bundledPlugins
}, {
	input: "lib/zip-no-worker-deflate.js",
	output: [{
		intro: GLOBALS,
		file: "dist/zip-no-worker-deflate.min.js",
		format: "umd",
		name: "zip"
	}],
	plugins: bundledPlugins
}, {
	input: "lib/zip-no-worker-inflate.js",
	output: [{
		intro: GLOBALS,
		file: "dist/zip-no-worker-inflate.min.js",
		format: "umd",
		name: "zip"
	}],
	plugins: bundledPlugins
}, {
	input: "lib/zip-fs.js",
	output: [{
		intro: GLOBALS,
		file: "dist/zip-fs.min.js",
		format: "umd",
		name: "zip"
	}, {
		intro: GLOBALS,
		file: "dist/zip-fs.js",
		format: "umd",
		name: "zip"
	}],
	plugins: bundledPlugins
}, {
	input: "index.js",
	output: [{
		intro: GLOBALS,
		file: "dist/zip-fs-full.min.js",
		format: "umd",
		name: "zip"
	}, {
		intro: GLOBALS,
		file: "dist/zip-fs-full.js",
		format: "umd",
		name: "zip"
	}, {
		file: "index.cjs",
		format: "cjs"
	}],
	plugins: bundledPlugins
}, {
	input: "lib/z-worker-bootstrap-pako.js",
	output: [{
		intro: GLOBALS_WORKER,
		file: "dist/z-worker-pako.js",
		format: "iife"
	}],
	plugins: inlinePlugins
}, {
	input: "lib/z-worker-bootstrap-fflate.js",
	output: [{
		intro: GLOBALS_WORKER,
		file: "dist/z-worker-fflate.js",
		format: "iife"
	}],
	plugins: inlinePlugins
}, {
	input: "lib/z-worker.js",
	output: [{
		intro: GLOBALS_WORKER,
		file: "dist/z-worker.js",
		format: "iife"
	}],
	plugins: inlinePlugins
}];