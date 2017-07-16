import R from "ramda";
import isFunction from "lodash/isFunction";
import { createAction } from "redux-actions";
import createRequestAction from "./createRequestAction";

import wrapAction from "./wrapAction";

const action = (fn, type, config) => {
  if (config) {
    if (Array.isArray(config)) {
      return fn(type, ...config);
    }

    return fn(type, config);
  }

  return fn(type);
};

export default (prefix, options) => {
  return {
    request: wrapAction(
      action(createRequestAction, `${prefix}/REQUEST`, options.request),
      (action, ...args) =>
        R.assocPath(
          ["meta", "request", "key"],
          isFunction(options.queryKey)
            ? options.queryKey(...args)
            : options.queryKey || `${prefix}.request`
        )
    ),
    success: action(createAction, `${prefix}/SUCCESS`, options.success),
    fail: action(createAction, `${prefix}/FAIL`, options.fail)
  };
};
