// Global polyfills for server-side rendering

if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {};
}

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {};
}

if (typeof globalThis.indexedDB === 'undefined') {
  globalThis.indexedDB = undefined;
}
