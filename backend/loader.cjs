// Bootstrap de arranque para la imagen empaquetada: bytenode engancha
// require() para poder cargar .jsc (bytecode V8), y ahí adentro está todo
// el backend real, ya compilado. Este archivo es el único ".js" legible
// que queda en la imagen final, y no tiene lógica de negocio.
require('bytenode');
require('./server.jsc');
