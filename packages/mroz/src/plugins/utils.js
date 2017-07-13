import R from "ramda";

export const addMiddleware = (middleware = []) => (plugin = {}) =>
  R.over(R.lensProp("middleware"), R.concat(middleware), plugin);

export const addReducers = (reducers = {}) => (plugin = {}) =>
  R.over(R.lensProp("reducers"), R.merge(reducers), plugin);

export const addHooks = (hooks = []) => (plugin = {}) =>
  R.over(R.lensProp("hooks"), R.concat(hooks), plugin);

export const addEnhancers = (enhancers = []) => (plugin = {}) =>
  R.over(R.lensProp("enhancers"), R.concat(enhancers), plugin);
