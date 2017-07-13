import R from "ramda";
import isFunction from "lodash/isFunction";
import { Observable } from "rxjs";

const emptyObservableFn = () => Observable.empty();
const identity = x => x;

const mergeObservable = R.curry(
  (a = emptyObservableFn, b = emptyObservableFn) => (...args) =>
    Observable.merge(a(...args), b(...args))
);

const makeObservableEdit = prop =>
  R.curry((newProp = emptyObservableFn, config) =>
    R.over(R.lensProp(prop), mergeObservable(newProp), config)
  );

const makeComposeEdit = prop =>
  R.curry((newProp = identity, config) =>
    R.over(R.lensProp(prop), R.compose(newProp), config)
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
  } = isFunction(config) ? config({}) : config;

  return (actions$, store, deps) => {
    const baseStream = filter(actions$.ofType(type), { actions$, store, deps });

    return baseStream.flatMap(action => {
      const id = action.meta.async.id || deps.async.uuid();
      const config = { action, actions$, id, deps, store };

      const mapMeta = type => action =>
        R.assocPath(["meta", "async"], { id, type }, action);

      return Observable.merge(
        request(config).map(mapMeta("request")),
        wrapper(
          normalize(work(config), config)
            .flatMap(data => success(data, config).map(mapMeta("success")))
            .catch(error => fail(error, config).map(mapMeta("fail"))),
          config
        )
      );
    });
  };
}
