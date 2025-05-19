import {waitFor} from 'global-util';
import {hello} from './lib';

console.log('从当前目录的模块导入',hello);
hello();

console.log('从全局NODE_PATH模块导入：',waitFor);

console.log('使用top level await');
console.log('wait 1s');
await new Promise((resolve) => {
	setTimeout(() => {
		resolve(true);
	}, 1000);
});
console.log('wait done');
