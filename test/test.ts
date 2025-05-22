import {waitFor} from 'global-util.js';
import {hello} from './lib';

import pkg from '../package.json';

console.log('package.json name=', pkg.name);

console.log('从当前目录的模块导入', hello);
hello();

console.log('从全局NODE_PATH模块导入：', waitFor);

console.log('使用top level await');
console.log('wait 1s');
await new Promise((resolve) => {
	setTimeout(() => {
		resolve(true);
	}, 1000);
});
console.log('wait done');
