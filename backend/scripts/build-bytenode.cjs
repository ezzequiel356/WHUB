// Script de build (no va en la imagen final). Corre dentro del stage
// "builder" del Dockerfile.
//
// 1. esbuild empaqueta todo el backend (ESM, con sus imports) en un único
//    archivo CommonJS: bytenode no entiende import/export directo.
// 2. bytenode compila ese bundle a bytecode V8 (.jsc) — usamos la API
//    programática (compileFile) en vez de la CLI para no depender de cómo
//    esa CLI valida la extensión del archivo de entrada.
//
// Extensión ".cjs" en este archivo a propósito: backend/package.json tiene
// "type": "module", así que un ".js" acá se interpretaría como ESM y
// require() fallaría.
const esbuild = require('esbuild');
const bytenode = require('bytenode');

esbuild.buildSync({
  entryPoints: ['server.js'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/server.cjs',
});

bytenode.compileFile({
  filename: 'dist/server.cjs',
  output: 'dist/server.jsc',
});

console.log('Compilado: dist/server.jsc');
