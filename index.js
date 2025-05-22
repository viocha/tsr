import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {nodeResolve} from '@rollup/plugin-node-resolve';

import typescript from '@rollup/plugin-typescript';
import {spawn} from 'child_process';
import {program} from 'commander';
import {build} from 'esbuild';
import path from 'path';
import {rollup} from 'rollup';
import tmp from 'tmp';

program
		.name('tsr')
		.description('Compile and optionally execute a TypeScript file');

program
		.command('run <entry> [args...]', {isDefault:true})
		.description('Build and run the TypeScript file')
		.action(async(entry, args)=>{
			await buildAndRun(entry, args);
		});

program
		.command('build <entry>')
		.description('Only build the TypeScript file, no execution')
		// 指定外部依赖
		.option('-e, --external <external>', 'External dependencies, separated by commas', (val)=>val.split(','))
		.option('-o, --out <output>', 'Output file path')
		.action(async(entry, options)=>{
			await buildOnly(entry, options);
		});

await program.parseAsync(process.argv);

async function buildAndRun(entry, args){
	const inputPath = path.resolve(process.cwd(), entry);
	
	const tmpFile = tmp.fileSync({postfix:'.js'});
	const outputFile = tmpFile.name;
	try {
		await esbuildBuild(inputPath, outputFile);
		
		const child = spawn('node', [outputFile, ...args], {stdio:'inherit'}); // 继承父进程的io
		child.on('exit', (code)=>{
			tmpFile.removeCallback();
			process.exit(code);
		});
	} catch (err){
		tmpFile.removeCallback();
		console.error('Build or execution failed:', err);
		process.exit(1);
	}
}

async function buildOnly(entry, options){
	const {out, external} = options;
	const inputPath = path.resolve(process.cwd(), entry);
	
	const inputDir = path.dirname(inputPath); // 获取输入文件的目录
	const inputBaseName = path.basename(inputPath, path.extname(inputPath)); // 获取输入文件的文件名（不带扩展名）
	const outputFile = out
										 ? path.resolve(process.cwd(), out)
										 : path.join(inputDir, `out/${inputBaseName}.js`); // 默认输出文件名为 inputFileName.out.js
	try {
		// esbuild 不支持commonjs的treeshake，故使用rollup
		await rollupBuild(inputPath, outputFile, {external});
		console.log(`Build succeeded: ${outputFile}`);
	} catch (err){
		console.error('Build failed:', err);
		process.exit(1);
	}
}

// 构建并输出es格式的js文件到指定路径
async function rollupBuild(inputPath, outputFile, options){
	const modulePaths = process.env.NODE_PATH?.split(';')?.filter(x=>x) || []; // 不能包含空字符串，若文件不在npm包中，会无法执行
	const bundle = await rollup({
		treeshake:'smallest', // 最大程度去除未使用的代码
		input:inputPath,
		plugins:[
			nodeResolve({modulePaths}), // 解析NODE_PATH中的模块
			commonjs(), // 将CommonJS模块转换为ES模块
			json(), // 支持导入json文件
			typescript({
				target:'ESNext',
				module:'ESNext',
				moduleResolution:'node',
			}),
		],
		onwarn(warning, warn){
			if (warning.plugin==='typescript'){ // 移除typescript的警告
				return;
			}
			warn(warning);
		},
		...options,
	});
	await bundle.write({
		file:outputFile,
		format:'es', // 使用ES模块格式
	});
}

async function esbuildBuild(input, outfile, options){
	const modulePaths = process.env.NODE_PATH?.split(path.delimiter).filter(Boolean) || [];
	
	await build({
		entryPoints:[input],
		outfile,
		bundle:true,
		platform:'node',
		format:'esm',
		target:'esnext',
		charset:'utf8',
		nodePaths:modulePaths, // 会自动添加 js/ts 后缀，以及识别目录的 index.js/index.ts 文件
		...options,
	});
}
