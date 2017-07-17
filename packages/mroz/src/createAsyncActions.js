import { createAction } from "redux-actions";
import createAsyncAction from "./createAsyncAction";

const action = (fn, type, config) => {
  if (config) {
    if (Array.isArray(config)) {
      return fn(type, ...config);
    }

    return fn(type, config);
  }

  return fn(type);
};

export default (prefix, options = {}) => {
  return {
    request: action(createAsyncAction, `${prefix}/REQUEST`, options.request),
    success: action(createAction, `${prefix}/SUCCESS`, options.success),
    fail: action(createAction, `${prefix}/FAIL`, options.fail)
  };
};
