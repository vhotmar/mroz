import R from "ramda";
import { handleActions, createAction, createActions } from "redux-actions";
import { ajax as rxAjax } from "rxjs/observable/dom/ajax";
import { addDependencies } from "./observable";

export const addHeaders = headers => properties =>
  R.over(R.lensProp("headers"), R.merge(properties.headers), headers);

export function ajax(properties) {
  return rxAjax(
    addHeaders({
      "Content-Type": "application/json",
      Accept: "application/json"
    })(properties)
  );
}

export const actions = {
  request: createAction("@@mroz/REQUEST_REQUEST"),
  success: createAction("@@mroz/REQUEST_SUCCESS"),
  fail: createAction("@@mroz/REQUEST_FAIL"),
  cancel: createAction("@@mrot/REQUEST_CANCEL")
};

export function createAsyncActions(prefix, { request, success, fail }) {
  return createActions();
}

const reducer = handleActions({});

export default () => (plugin = {}) => addDependencies(ajax)(plugin);
