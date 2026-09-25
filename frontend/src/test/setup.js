import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Sin `test.globals: true`, la limpieza automática que trae
// @testing-library/react entre tests no se activa (depende de detectar un
// afterEach global). Se registra a mano así cada test arranca con un DOM
// limpio en vez de acumular los renders de los tests anteriores.
afterEach(() => {
  cleanup();
});

// jsdom (desde la v27) ya no incluye su propia implementación de
// localStorage: delega en la Web Storage API experimental de Node, que
// viene deshabilitada por defecto. En vez de depender de flags de Node,
// se polyfillea con un Storage en memoria simple para los tests.
if (typeof globalThis.localStorage === 'undefined') {
  class MemoryStorage {
    #store = new Map();
    getItem(key) { return this.#store.has(key) ? this.#store.get(key) : null; }
    setItem(key, value) { this.#store.set(key, String(value)); }
    removeItem(key) { this.#store.delete(key); }
    clear() { this.#store.clear(); }
    key(index) { return Array.from(this.#store.keys())[index] ?? null; }
    get length() { return this.#store.size; }
  }

  const storage = new MemoryStorage();
  globalThis.localStorage = storage;
  if (typeof window !== 'undefined') window.localStorage = storage;
}
