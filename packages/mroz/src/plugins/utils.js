import { over, lensProp, concat, merge } from "ramda";

export const addMiddleware = (middleware = []) => plugin =>
  over(lensProp("middleware"), concat(middleware), plugin);

export const addReducers = (reducers = {}) => plugin =>
  over(lensProp("reducers"), merge(reducers), plugin);

export const addHooks = (hooks = []) => plugin =>
  over(lensProp("hooks"), concat(hooks), plugin);

export const addEnhancers = (enhancers = []) => plugin =>
  over(lensProp("enhancers"), concat(enhancers), plugin);
