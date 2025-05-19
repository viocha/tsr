#!/usr/bin/env node

import path from 'path';
import {rollup} from 'rollup';
import {program} from 'commander';

import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import tmp from 'tmp';
import {spawn} from 'child_process';

program
		.name('tsr')
		.description('Compile and optionally execute a TypeScript file');

program
		.command('run <entry>', {isDefault:true})
		.description('Build and run the TypeScript file')
		.action(async(entry)=>{
			await buildAndRun(entry);
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

async function buildAndRun(entry){
	const inputPath = path.resolve(process.cwd(), entry);
	
	const tmpFile = tmp.fileSync({postfix:'.js'});
	const outputFile = tmpFile.name;
	try {
		await rollupBuild(inputPath, outputFile);
		
		const child = spawn('node', [outputFile], {stdio:'inherit'}); // 继承父进程的io
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
	const inputBaseName = path.basename(inputPath, path.extname(inputPath)); // 去掉后缀名
	const outputFile = out
										 ? path.resolve(process.cwd(), out)
										 : path.join(inputDir, `${inputBaseName}.out.js`); // 默认输出文件名为 inputFileName.out.js
	try {
		await rollupBuild(inputPath, outputFile, {external});
		console.log(`Build succeeded: ${outputFile}`);
	} catch (err){
		console.error('Build failed:', err);
		process.exit(1);
	}
}

// 构建并输出es格式的js文件到指定路径
async function rollupBuild(inputPath, outputFile, options){
	const bundle = await rollup({
		treeshake:'smallest', // 最大程度去除未使用的代码
		input:inputPath,
		plugins:[
			nodeResolve({modulePaths:process.env.NODE_PATH?.split(';')}),
			commonjs(),
			typescript({
				tsconfig:false,
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
