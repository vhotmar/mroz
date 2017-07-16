import R from "ramda";
import isFunction from "lodash/isFunction";
import { Observable } from "rxjs";
import asyncArc from "../arcs/async";

const emptyObservableFn = () => Observable.empty();
const identity = x => x;

const mergeObservableCreator = (a = emptyObservableFn) => (
  b = emptyObservableFn
) => (...args) => Observable.merge(b(...args), a(...args));

const makeObservableEdit = propName => newProp => (config = {}) =>
  R.over(R.lensProp(propName), mergeObservableCreator(newProp), config);

const makeComposeEdit = propName => (newProp = identity) => (config = {}) =>
  R.over(
    R.lensProp(propName),
    prop => (s, ...args) =>
      newProp(isFunction(prop) ? prop(s, ...args) : s, ...args),
    config
  );

export const addRequest = makeObservableEdit("request");

export const addSuccess = makeObservableEdit("success");

export const addFail = makeObservableEdit("fail");

export const addWrapper = makeComposeEdit("wrapper");

export const addFilter = makeComposeEdit("filter");

export const addNormalize = makeComposeEdit("normalize");

export default function epic(type, work, config) {
  const {
    request = emptyObservableFn,
    success = emptyObservableFn,
    fail = emptyObservableFn,
    wrapper = identity,
    filter = identity,
    normalize = identity
  } = asyncArc()(isFunction(config) ? config({}) : config);

  return (action$, store, deps) => {
    const baseStream = filter(action$.ofType(type), { action$, store, deps });

    return baseStream.flatMap(action => {
      const id = R.path(["meta", "async", "id"], action) || deps.async.uuid();
      const config = { action, action$, id, deps, store };

      const mapMeta = type => action =>
        R.assocPath(["meta", "async"], { id, type }, action);

      return Observable.merge(
        request(config).map(mapMeta("request")),
        wrapper(
          work(config)
            .map(data => normalize(data, config))
            .flatMap(data => success(data, config).map(mapMeta("success"))),
          config
        ).catch(error => fail(error, config).map(mapMeta("fail")))
      );
    });
  };
}
