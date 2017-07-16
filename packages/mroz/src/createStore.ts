declare var window: Window & { devToolsExtension: any };
declare var process: { env: { NODE_ENV: string } };

import {
  applyMiddleware,
  compose,
  createStore,
  combineReducers,
  GenericStoreEnhancer,
  ReducersMapObject,
  Middleware,
  Store
} from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

const devtools =
  typeof window !== "undefined" && window.devToolsExtension
    ? window.devToolsExtension()
    : undefined;

export type StoreHook<S> = (store: Store<S>) => void;

export type Plugin<S extends {}> = {
  middleware: Array<Middleware>;
  enhancers: Array<GenericStoreEnhancer>;
  reducers: ReducersMapObject;
  hooks: Array<StoreHook<S>>;
  initialState: S;
};

export type PluginEnhancer<S extends {}> = (plugin: Plugin<S>) => Plugin<S>;

export function applyPlugins<S extends {}>(
  plugins: Array<PluginEnhancer<S>>
): Plugin<S> {
  const basePlugin: Plugin<S> = {
    middleware: [],
    enhancers: [],
    reducers: {},
    hooks: [],
    initialState: {}
  } as any;

  return plugins.reduce((result, plugin) => plugin(result), basePlugin);
}

export default function createReduxStore<S>({
  middleware,
  enhancers,
  reducers,
  hooks,
  initialState
}: Plugin<S>): Store<S> {
  const defaultEnhancers: Array<GenericStoreEnhancer> = [devtools].filter(
    x => x
  );

  const defaultMiddleware: Array<Middleware> = [
    thunk,
    process.env.NODE_ENV !== "production"
      ? createLogger({ collapsed: true })
      : undefined
  ].filter(x => x) as Array<Middleware>;

  const finalMiddleware = [...defaultMiddleware, ...middleware];

  const finalEnhancers = [...defaultEnhancers, ...enhancers];

  const store = createStore<S>(
    combineReducers(reducers),
    initialState,
    compose(applyMiddleware(...finalMiddleware), ...finalEnhancers)
  );

  hooks.forEach(hook => hook(store));

  return store;
}
