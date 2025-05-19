// 等待条件成立，或者超时
async function waitFor(condition, options = {}){
	if (typeof condition==='number'){
		await new Promise(r=>setTimeout(r, condition));
		return true;
	}
	
	let {timeout = 10*1000, interval = 100, throwMsg} = options;
	while (!await condition()){
		if (timeout<=0){
			if (throwMsg){
				throw new Error(throwMsg);
			}
			return false;
		}
		
		await new Promise(r=>setTimeout(r, interval));
		timeout -= interval;
	}
	return true;
}

function hello() {
    console.log('hello');
}

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
