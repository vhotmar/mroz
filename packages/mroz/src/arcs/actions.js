import { compose } from "ramda";
import { Observable } from "rxjs";
import { addSuccess, addFail, addRequest } from "../epics/async";

const identity = x => x;

export default function actions(request, success, fail) {
  return compose(
    request ? addRequest(config => Observable.of(request(config))) : identity,
    success
      ? addSuccess((data, config) => Observable.of(success(data, config)))
      : identity,
    fail
      ? addFail((error, config) => Observable.of(fail(error, config)))
      : identity
  );
}
