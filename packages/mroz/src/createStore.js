import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

/* istanbul ignore next */
const devtools =
  typeof window !== "undefined" && window.devToolsExtension
    ? window.devToolsExtension()
    : undefined;

function applyPlugins(plugins) {
  const basePlugin = {
    middleware: [],
    enhancers: [],
    reducers: {},
    hooks: []
  };

  return plugins.reduce((result, plugin) => plugin(result), basePlugin);
}

export default function createReduxStore({
  middleware = [],
  enhancers = [],
  reducers = {},
  hooks = [],
  initialState = {},
  plugins = []
}) {
  const plugin = applyPlugins(plugins);
  const defaultEnhancers = [devtools].filter(x => x);

  /* istanbul ignore next */
  const defaultMiddleware = [
    thunk,
    process.env.NODE_ENV !== "production"
      ? createLogger({ collapsed: true })
      : undefined
  ].filter(x => x);

  const finalMiddleware = [
    ...defaultMiddleware,
    ...middleware,
    ...plugin.middleware
  ];

  const finalEnhancers = [
    ...defaultEnhancers,
    ...enhancers,
    ...plugin.enhancers
  ];

  const finalHooks = [...hooks, ...plugin.hooks];

  const finalReducers = {
    ...reducers,
    ...plugin.reducers
  };

  const store = createStore(
    combineReducers(finalReducers),
    initialState,
    compose(applyMiddleware(...finalMiddleware), ...finalEnhancers)
  );

  finalHooks.forEach(hook => hook(store));

  return store;
}
