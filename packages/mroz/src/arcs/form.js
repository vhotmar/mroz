import R from "ramda";
import { Observable } from "rxjs";
import isFunction from "lodash/isFunction";
import { startSubmit, stopSubmit } from "redux-form";
import { addRequest, addSuccess, addFail } from "../epics/async";

export default function form(form, getErrors) {
  const fn = isFunction(form) ? form : () => form;
  const errFn = isFunction(getErrors) ? getErrors : () => undefined;

  return R.compose(
    addRequest(config => Observable.of(startSubmit(fn(config)))),
    addSuccess((data, config) => Observable.of(stopSubmit(fn(config)))),
    addFail((error, config) =>
      Observable.of(stopSubmit(fn(config), errFn(error)))
    )
  );
}
