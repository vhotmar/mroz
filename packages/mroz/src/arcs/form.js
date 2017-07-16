import isFunction from "lodash/isFunction";
import { startSubmit, stopSubmit } from "redux-form";
import actions from "./actions.js";

export default function form(form, getErrors) {
  const fn = isFunction(form) ? form : () => form;
  const errFn = isFunction(getErrors) ? getErrors : () => undefined;

  return actions(
    config => startSubmit(fn(config)),
    (data, config) => stopSubmit(fn(config)),
    (error, config) => stopSubmit(fn(config), errFn(error, config))
  );
}
