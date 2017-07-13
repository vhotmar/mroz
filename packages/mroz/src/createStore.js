import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import thunk from "redux-thunk";
import { each } from "lodash";

const devtools =
  typeof window !== "undefined" && window.devToolsExtension()
    ? window.devToolsExtension()
    : undefined;

const defaultEnhancers = [devtools].filter(x => x);

const defaultMiddleware = [
  thunk,
  process.env.NODE_ENV !== "production"
    ? require("redux-logger").createLogger({ collapsed: true })
    : undefined
].filter(x => x);

function transformPlugins(plugins) {
  return plugins.reduce((result, plugin) => plugin(result), {
    reducers: {},
    middleware: [],
    enhancers: [],
    hooks: []
  });
}

export default function createReduxStore({
  plugins = [],
  middleware = [],
  enhancers = [],
  reducers = {},
  hooks = [],
  initialState = {}
}) {
  const transformed = transformPlugins(plugins);
  const finalReducers = { ...reducers, ...transformed.reducers };
  const finalMiddleware = [
    ...defaultMiddleware,
    ...middleware,
    ...transformed.middleware
  ];
  const finalEnhancers = [
    ...defaultEnhancers,
    ...enhancers,
    ...transformed.enhancers
  ];
  const finalHooks = [...hooks, ...transformed.hooks];

  const store = createStore(
    combineReducers(finalReducers),
    initialState,
    compose(applyMiddleware(...finalMiddleware), ...finalEnhancers)
  );

  each(hooks, hook => hook(store));

  store.replaceReducers = newReducers => {
    return store.replaceReducer({ ...newReducers, ...transformed.reducers });
  };

  return store;
}
