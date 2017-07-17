import { over, lensProp, concat, merge } from "ramda";

export const addMiddleware = (middleware = []) => (plugin = {}) =>
  over(lensProp("middleware"), (a = []) => concat(middleware, a), plugin);

export const addReducers = (reducers = {}) => (plugin = {}) =>
  over(lensProp("reducers"), (r = {}) => merge(reducers, r), plugin);

export const addHooks = (hooks = []) => (plugin = {}) =>
  over(lensProp("hooks"), (a = []) => concat(hooks, a), plugin);

export const addEnhancers = (enhancers = []) => (plugin = {}) =>
  over(lensProp("enhancers"), (a = []) => concat(enhancers, a), plugin);
