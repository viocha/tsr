import fs from 'fs';
import {waitFor} from 'global-util';

console.log('等待1秒');
await waitFor(1000)
console.log(fs.readdirSync('.'));
