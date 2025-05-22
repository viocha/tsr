import fs from 'fs';
import {fileURLToPath} from 'url'

console.log(fileURLToPath('file:/D:/Program%20Files/IntelliJ%20IDEA%20Ultimate/plugins/nodeJS/js/ts-file-loader/node_modules/tsx/dist/loader.cjs'));
console.log('等待1秒');
await new Promise((resolve) => {
	setTimeout(() => {
		resolve(true);
	}, 1000);
});
console.log(fs.readdirSync('.'));
