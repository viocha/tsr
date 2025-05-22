# tsr — TypeScript Runner

> Run TypeScript files instantly.  
> A CLI tool for compiling and running `.ts` files with zero config, powered by [esbuild](https://esbuild.github.io/) and [Rollup](https://rollupjs.org/).

---

## ✨ 特性 Features

- 🚀 **快速执行**：一条命令立即运行 `.ts` 文件
- 🔧 **无需配置**：零配置使用，适合脚本调试和原型开发
- 🧱 **构建支持**：可构建为独立 ES 模块输出
- 📦 **支持 CommonJS、JSON 和 NODE_PATH**
- 🧹 **自动清理**：执行后的临时文件自动删除

---

## 📦 安装 Installation

```bash
npm install -g @viocha/tsr
````

或本地使用：

```bash
npm install @viocha/tsr --save-dev
```

---

## 🚀 快速开始 Quick Start

### 运行 TypeScript 文件

```bash
tsr hello.ts
```
或者

```bash
tsr run hello.ts
```

支持传参：

```bash
tsr run hello.ts arg1 arg2
```

### 仅构建，不运行

```bash
tsr build hello.ts
```

输出文件默认为 `out/hello.js`，也可自定义路径：

```bash
tsr build hello.ts -o dist/output.js
```

---

## ⚙️ 可选参数 Options

### `tsr build`

| 参数                      | 描述                     |
|-------------------------|------------------------|
| `-o, --out <path>`      | 自定义输出文件路径              |
| `-e, --external <deps>` | 指定外部依赖（逗号分隔），不会打包进输出文件 |

示例：

```bash
tsr build src/index.ts -o dist/index.js -e lodash,react
```

---

## 📁 示例文件 Example

```ts
// hello.ts
console.log('Hello,', process.argv[2] || 'World!');
```

```bash
tsr run hello.ts TypeScript
# 输出: Hello, Typescript!
```

---

## 🔍 实现原理 Behind the Scenes

* 使用 **esbuild** 快速编译 TypeScript 为 JavaScript
* 使用 **Rollup** 优化构建结果，支持 CommonJS/JSON
* 使用 `tmp` 创建临时执行文件，运行完毕后自动清除
* 自动解析 `NODE_PATH` 中的模块路径

---

## 📄 License

[MIT](./LICENSE)
