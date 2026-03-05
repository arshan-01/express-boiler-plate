import { AsyncLocalStorage } from "node:async_hooks";

const requestContextStorage = new AsyncLocalStorage();

/**
 * Get the current request context
 * @returns {Object|undefined} The request context object
 */
function getRequestContext() {
  return requestContextStorage.getStore();
}

/**
 * Run a function with request context
 * @param {Object} context - The context object to store
 * @param {Function} fn - The function to run with the context
 */
function runWithRequestContext(context, fn) {
  return requestContextStorage.run(context, fn);
}

export { getRequestContext, runWithRequestContext };
