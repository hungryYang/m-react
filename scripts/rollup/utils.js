import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function getPkgPath(name, isDist) {
	if (isDist) {
		return `${distPath}/${name}`;
	}
	return `${pkgPath}/${name}`;
}

export function getPkgJson(pkgName) {
	const path = `${getPkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, 'utf-8');

	return JSON.parse(str);
}

export function getBaseRollupPlugins({
	alias = { __DEV__: true, preventAssignment: true },
	typescript = {}
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
