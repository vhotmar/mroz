import async from "./async";
import { ActionsObservable } from "redux-observable";
import { Observable } from "rxjs";

export const REQUEST_TYPE = "request_type";
const defaultAction = { type: REQUEST_TYPE };
const id = "id";
const defaultAction$ = ActionsObservable.of(defaultAction);
const defaultDeps = { async: { uuid: () => id } };

export const config = {
  action: defaultAction,
  action$: defaultAction$,
  deps: defaultDeps,
  id,
  store: null
};

export const asyncTest = ({
  action = defaultAction,
  action$,
  getState,
  work = () => Observable.of({ data: "foo" }),
  config,
  callback,
  deps = {}
}) => {
  const a$ = action$ || ActionsObservable.of(action);
  const store = getState ? { getState } : null;
  const d = { ...defaultDeps, ...deps };
  const stream = async(REQUEST_TYPE, work, config)(a$, store, d).toArray();

  return {
    config: {
      action,
      action$: a$,
      store,
      d,
      id
    },
    exec: () => stream.subscribe(res => callback(res))
  };
};

export default config =>
  asyncTest({ action$: defaultAction$, ...config }).exec();
