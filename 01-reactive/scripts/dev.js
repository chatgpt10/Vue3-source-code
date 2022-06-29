const args = require('minimist')(process.argv.slice(2))// node scripts/dev.js reactivity -f global
const {resolve} = require('path'); // node中的内置模块
// minist 用来解析命令行参数的
const {build} = require('esbuild');

const target =args._[0] || 'reactivity';
const format =args.f || 'global';
// 开发环境只打包某一个
const pkg =require(resolve(__dirname,`../packages/${target}/packages.json`));
console.log(args);